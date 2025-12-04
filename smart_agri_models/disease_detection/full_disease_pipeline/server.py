import io
import os
from typing import Optional

import cv2
import json
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from torchvision import transforms, models
import tensorflow as tf

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")
SEG_MODEL_PATH = os.path.join(BASE_DIR, "model_full.pth")
CROP_CLASSIFIER_PATH = os.path.join(BASE_DIR, "fruit_classifier_tf.keras")
DISEASE_MODEL_WEIGHTS = os.path.join(BASE_DIR, "mobilenet_plant_weights.pt")

app = FastAPI(title="Disease Detection Pipeline API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load global artifacts once
try:
    # Load segmentation model (torch Unet)
    seg_model = torch.load(SEG_MODEL_PATH, weights_only=False, map_location=torch.device('cpu'))
    seg_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    seg_model.to(seg_device)
    seg_model.eval()

    # Load crop classifier (TensorFlow Keras)
    crop_classifier = tf.keras.models.load_model(CROP_CLASSIFIER_PATH)

    # Load disease class names
    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        DISEASE_CLASS_NAMES = json.load(f)
    num_classes = len(DISEASE_CLASS_NAMES)

    # Load disease classifier (PyTorch MobileNet v2)
    disease_model = models.mobilenet_v2(pretrained=False)
    disease_model.classifier[1] = torch.nn.Linear(disease_model.last_channel, num_classes)
    disease_model.load_state_dict(torch.load(DISEASE_MODEL_WEIGHTS, map_location=torch.device('cpu')))
    disease_model_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    disease_model.to(disease_model_device)
    disease_model.eval()

    disease_preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],[0.229, 0.224, 0.225])
    ])

    # Crop categories mapping (from notebook)
    categories = {
        0: 'fruits', 1: 'apple', 2: 'avacado', 3: 'banana',
        4: 'bell pepper', 5: 'cabbage', 6: 'carrot',
        7: 'chili pepper', 8: 'coconut', 9: 'courgette',
        10: 'cucumber', 11: 'eggplant', 12: 'kiwi',
        13: 'lemon', 14: 'orange', 15: 'peach',
        16: 'pear', 17: 'potato', 18: 'red cabbage',
        19: 'tangerine', 20: 'tomato', 21: 'watermelon'
    }
    unique_cat_ids = sorted(categories.keys())
    catid2class = {cat_id: i for i, cat_id in enumerate(unique_cat_ids)}
    class2name = {v: categories[k] for k, v in catid2class.items()}

except Exception as e:
    raise RuntimeError(f"Failed to initialize models: {e}")


def filter_diseases_by_crop(predicted_crop: str):
    crop_norm = predicted_crop.strip().lower()
    filtered = []
    for cls in DISEASE_CLASS_NAMES:
        crop_part = cls.split("___")[0].lower()
        if crop_norm in crop_part:
            filtered.append(cls)
    return filtered


def run_segmentation_mask(img_rgb: np.ndarray) -> np.ndarray:
    inp = torch.tensor(img_rgb.transpose(2, 0, 1) / 255.0, dtype=torch.float32).unsqueeze(0).to(seg_device)
    with torch.no_grad():
        pred_mask = seg_model(inp)[0, 0].detach().cpu().numpy()
    mask = (pred_mask > 0.5).astype(np.uint8)
    H, W = img_rgb.shape[:2]
    if mask.sum() == 0:
        mask = np.ones((H, W), dtype=np.uint8)
    return mask


def crop_predict(img_rgb: np.ndarray):
    # Prepare masked image for the TF crop classifier
    H, W = img_rgb.shape[:2]
    mask = run_segmentation_mask(img_rgb)
    leaf_mask = 1 - mask
    leaf_mask3 = leaf_mask[:, :, None]
    img_leaf_only = (img_rgb * leaf_mask3 + 255 * (1 - leaf_mask3)).astype(np.uint8)

    img_resized = cv2.resize(img_leaf_only, (224, 224))
    img_input = img_resized.astype("float32") / 255.0
    img_input = np.expand_dims(img_input, axis=0)

    pred = crop_classifier.predict(img_input, verbose=0)[0]
    class_idx = int(np.argmax(pred))
    class_name = class2name[class_idx]
    probability = float(pred[class_idx])

    return class_name, probability, img_leaf_only


def disease_predict(img_leaf_only: np.ndarray, candidate_diseases: list):
    img = Image.fromarray(img_leaf_only)
    input_tensor = disease_preprocess(img).unsqueeze(0).to(disease_model_device)

    with torch.no_grad():
        logits = disease_model(input_tensor)
        probs = torch.softmax(logits, dim=1)[0]

    disease_to_idx = {name: i for i, name in enumerate(DISEASE_CLASS_NAMES)}
    candidate_indices = [disease_to_idx[d] for d in candidate_diseases if d in disease_to_idx]
    if len(candidate_indices) == 0:
        raise ValueError("No matching candidate diseases found in model classes.")

    candidate_probs = probs[candidate_indices]
    candidate_probs = candidate_probs / candidate_probs.sum()

    best_idx_local = int(torch.argmax(candidate_probs).item())
    best_idx_global = int(candidate_indices[best_idx_local])

    return {
        "disease": DISEASE_CLASS_NAMES[best_idx_global],
        "confidence": float(candidate_probs[best_idx_local])
    }


class PredictResponse(BaseModel):
    crop: str
    crop_confidence: float
    disease: str
    disease_confidence: float


@app.post("/predict", response_model=PredictResponse)
async def predict(image: UploadFile = File(...)):
    if not image:
        raise HTTPException(status_code=400, detail="Image file is required")
    try:
        data = await image.read()
        pil_img = Image.open(io.BytesIO(data)).convert("RGB")
        img_rgb = np.array(pil_img)

        # Stage 1: Crop classification with segmentation masking
        crop_name, crop_prob, img_leaf_only = crop_predict(img_rgb)

        # Stage 2: Filter diseases for the crop and classify
        candidate = filter_diseases_by_crop(crop_name)
        disease_res = disease_predict(img_leaf_only, candidate)

        return PredictResponse(
            crop=crop_name,
            crop_confidence=crop_prob,
            disease=disease_res["disease"],
            disease_confidence=disease_res["confidence"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
