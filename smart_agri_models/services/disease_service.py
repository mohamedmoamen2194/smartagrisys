import io
from typing import Dict
from PIL import Image
import numpy as np

# Reuse the existing pipeline and loaded models
# Note: This relies on running from the repo root or having the project on PYTHONPATH
from smart_agri_models.disease_detection.full_disease_pipeline import server as pipeline


def analyze_image(image_bytes: bytes) -> Dict:
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_rgb = np.array(pil_img)

    crop_name, crop_prob, img_leaf_only = pipeline.crop_predict(img_rgb)
    candidates = pipeline.filter_diseases_by_crop(crop_name)
    disease_res = pipeline.disease_predict(img_leaf_only, candidates)

    return {
        "crop": crop_name,
        "crop_confidence": float(crop_prob),
        "disease": disease_res["disease"],
        "disease_confidence": float(disease_res["confidence"]) ,
    }
