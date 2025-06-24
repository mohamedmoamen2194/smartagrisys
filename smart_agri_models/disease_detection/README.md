# Disease Detection API

This directory contains the disease detection model and a FastAPI service for inference.

## Files
- `mobilenet_plant_weights.pt`: Trained MobileNetV2 model weights
- `class_names.json`: List of disease class names
- `disease_detection_inference.py`: Model loading and prediction logic
- `disease_detection_api.py`: FastAPI app exposing a /predict endpoint
- `requirements.txt`: Python dependencies

## Running the API

1. **Install dependencies**

```bash
pip install -r requirements.txt
```

2. **Start the FastAPI server**

```bash
uvicorn disease_detection_api:app --reload
```

3. **Send a prediction request**

Example using `curl`:

```bash
curl -X POST "http://localhost:8000/predict" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@/path/to/your/image.jpg"
```

**Response:**
```json
{"disease": "Potato___Late_blight", "confidence": 0.98}
```

## Input Format
- `file`: Image file (JPG, PNG, etc.) 