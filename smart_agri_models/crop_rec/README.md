# Crop Recommendation API

This directory contains the crop recommendation model and a FastAPI service for inference.

## Files
- `crop_recommendation_rf_model (1).joblib`: Trained RandomForest model
- `label_encoder (1).joblib`: Label encoder for crop names
- `crop_recommendation_inference.py`: Model loading and prediction logic
- `crop_rec_api.py`: FastAPI app exposing a /predict endpoint
- `requirements.txt`: Python dependencies

## Running the API

1. **Install dependencies**

```bash
pip install -r requirements.txt
```

2. **Start the FastAPI server**

```bash
uvicorn crop_rec_api:app --reload
```

3. **Send a prediction request**

Example using `curl`:

```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"features": [19, 65, 25, 18.879744, 18, 5.5, 144]}'
```

**Response:**
```json
{"crop": "rice"}
```

## Input Format
- `features`: List of 7 numbers in the order:
  - N (Nitrogen)
  - P (Phosphorus)
  - K (Potassium)
  - temperature (°C)
  - humidity (%)
  - ph
  - rainfall (mm) 