# Modal Deployment Guide for SmartAgriSys

This directory contains Modal deployments for the AI models, preserving the exact architecture and functionality.

## Prerequisites

1. **Install Modal**
```bash
pip install modal
```

2. **Authenticate with Modal**
```bash
modal token new
```

## Model Files Required

### Disease Detection Model
- `mobilenet_plant_weights.pt` (PyTorch weights)
- `class_names.json` (38 disease classes)

### Crop Recommendation Model
- `crop_recommendation_rf_model (1).joblib` (Random Forest model)
- `label_encoder (1).joblib` (Label encoder)

## Deployment Steps

### Step 1: Upload Model Files to Modal Volumes

**For Disease Detection:**
```bash
cd smart_agri_models/modal_deploy

# Upload model files to Modal volume
modal volume put disease-model-volume ../disease_detection/mobilenet_plant_weights.pt /mobilenet_plant_weights.pt
modal volume put disease-model-volume ../disease_detection/class_names.json /class_names.json
```

**For Crop Recommendation:**
```bash
# Upload model files to Modal volume
modal volume put crop-model-volume "../crop_rec/crop_recommendation_rf_model (1).joblib" "/crop_recommendation_rf_model (1).joblib"
modal volume put crop-model-volume "../crop_rec/label_encoder (1).joblib" "/label_encoder (1).joblib"
```

### Step 2: Deploy the Functions

**Deploy Disease Detection:**
```bash
modal deploy disease_detection_modal.py
```

**Deploy Crop Recommendation:**
```bash
modal deploy crop_recommendation_modal.py
```

After deployment, Modal will provide URLs like:
```
✓ Created web function predict_disease_endpoint => https://your-username--smartagrisys-disease-detection-predict-disease-endpoint.modal.run
✓ Created web function predict_crop_endpoint => https://your-username--smartagrisys-crop-recommendation-predict-crop-endpoint.modal.run
```

### Step 3: Test the Deployments

**Test Disease Detection Locally:**
```bash
modal run disease_detection_modal.py --test-image-path ../disease_detection/test_image.jpg
```

**Test Crop Recommendation Locally:**
```bash
modal run crop_recommendation_modal.py --n 90 --p 42 --k 43 --temperature 20.87 --humidity 82 --ph 6.5 --rainfall 202.93
```

**Test via HTTP:**
```bash
# Disease Detection
curl -X POST https://your-url.modal.run \
  -H "Content-Type: application/octet-stream" \
  --data-binary @test_image.jpg

# Crop Recommendation
curl -X POST https://your-url.modal.run \
  -H "Content-Type: application/json" \
  -d '{"features": [90, 42, 43, 20.87, 82.0, 6.5, 202.93]}'
```

## Architecture Preservation

### Disease Detection
- ✅ **Model**: MobileNetV2 (exact same architecture)
- ✅ **Preprocessing**: Same transforms (224x224, normalization)
- ✅ **Classes**: Same 38 plant disease classes
- ✅ **Output**: `{"disease": str, "confidence": float}`

### Crop Recommendation
- ✅ **Model**: Random Forest (same trained model)
- ✅ **Input**: 7 features [N, P, K, temp, humidity, pH, rainfall]
- ✅ **Label Encoder**: Same encoding
- ✅ **Output**: `{"crop": str, "confidence": float}`

## Configuration

### GPU Usage
- **Disease Detection**: Uses T4 GPU (faster inference)
- **Crop Recommendation**: CPU only (Random Forest is fast enough)

### Container Settings
- **Idle Timeout**: 180 seconds (3 minutes)
- **No keep_warm**: Only pay when used
- **Timeout**: 60s for disease, 30s for crop

## Cost Estimates

With default settings (no keep_warm):
- **Idle**: $0/month
- **Low traffic** (<1000 requests): ~$0-5/month
- **Medium traffic** (~10,000 requests): ~$20-50/month

## Next Steps

After deployment, update your Next.js API route with the Modal URLs:

```typescript
// .env.local
MODAL_DISEASE_URL=https://your-username--smartagrisys-disease-detection-predict-disease-endpoint.modal.run
MODAL_CROP_URL=https://your-username--smartagrisys-crop-recommendation-predict-crop-endpoint.modal.run
```

## Troubleshooting

**Volume not found:**
```bash
modal volume create disease-model-volume
modal volume create crop-model-volume
```

**Check volume contents:**
```bash
modal volume ls disease-model-volume
modal volume ls crop-model-volume
```

**View logs:**
```bash
modal app logs smartagrisys-disease-detection
modal app logs smartagrisys-crop-recommendation
```
