import torch
import json
from PIL import Image
from torchvision import transforms, models
import os

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# Load class names
with open(os.path.join(MODEL_DIR, "class_names.json")) as f:
    class_names = json.load(f)

num_classes = len(class_names)

map_location = torch.device('cpu')
model = models.mobilenet_v2(pretrained=False)
model.classifier[1] = torch.nn.Linear(model.last_channel, num_classes)
model.load_state_dict(torch.load(os.path.join(MODEL_DIR, "mobilenet_plant_weights.pt"), map_location=map_location))
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict(image_path):
    img = Image.open(image_path).convert("RGB")
    input_tensor = preprocess(img).unsqueeze(0).to(device)
    with torch.no_grad():
        logits = model(input_tensor)
        pred = logits.argmax(1).item()
        confidence = torch.softmax(logits, dim=1)[0, pred].item()
    return {"disease": class_names[pred], "confidence": confidence} 