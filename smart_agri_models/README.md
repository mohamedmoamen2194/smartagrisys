# SmartAgriSys MCB (Model Control Bridge)

## Overview
The MCB is an intelligent model selection and execution layer that bridges frontend requests with AI models for crop recommendation and disease detection.

## Features
- 🧠 **LLM-powered model selection** using Groq API
- 🌱 **Crop recommendation** using trained Random Forest model
- 🔍 **Disease detection** using trained MobileNetV2 model
- 📝 **Human-readable text responses** (not just JSON)
- 🚀 **Vercel deployment ready**

## Project Structure
```
smart_agri_models/
├── mcb/                    # MCB core system
│   ├── mcb_api.py         # FastAPI endpoints
│   ├── decision_engine.py # LLM model selection
│   ├── model_executor.py  # Model execution
│   └── model_registry.py  # Model metadata
├── crop_rec/              # Crop recommendation model
│   ├── crop_recommendation_inference.py
│   └── crop_recommendation_rf_model (1).joblib
├── disease_detection/     # Disease detection model
│   ├── disease_detection_inference.py
│   └── mobilenet_plant_weights.pt
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## API Endpoints

### Text-Based Endpoints (Human-readable)
- `POST /mcb/ask` - Ask questions, get text responses
- `POST /mcb/diagnose-image` - Upload image for disease diagnosis
- `GET /mcb/help` - Get help information

### JSON Endpoints (Technical)
- `POST /mcb/analyze` - Analyze query and select model
- `POST /mcb/execute` - Execute specific model
- `GET /mcb/models` - List available models
- `GET /mcb/health` - Health check
- `GET /mcb/stats` - System statistics

## Environment Variables
Create a `.env` file with:
```bash
# LLM Configuration
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

# MCB Settings
MCB_USE_LLM=true
MCB_DYNAMIC_EXTRACTION=true
MCB_DYNAMIC_TREATMENTS=true

# Model Paths (optional)
CROP_MODEL_PATH=./crop_rec/crop_recommendation_rf_model (1).joblib
DISEASE_MODEL_PATH=./disease_detection/mobilenet_plant_weights.pt
```

## Local Development

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start Server
```bash
python -m uvicorn mcb.mcb_api:app --host 127.0.0.1 --port 8001 --reload
```

### 3. Test Endpoints
```bash
# Get help
curl http://127.0.0.1:8001/mcb/help

# Ask a question
curl -X POST http://127.0.0.1:8001/mcb/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "What crop should I plant?", "user_id": "farmer1", "user_type": "farmer"}'
```

## Deployment

### Vercel Deployment
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Vercel
- `LLM_PROVIDER=groq`
- `GROQ_API_KEY=your_key`
- `MCB_USE_LLM=true`
- `MCB_DYNAMIC_EXTRACTION=true`
- `MCB_DYNAMIC_TREATMENTS=true`

## Model Information

### Crop Recommendation Model
- **Type**: Random Forest Classifier
- **Input**: 7 features [N, P, K, temperature, humidity, pH, rainfall]
- **Output**: Recommended crop name
- **Accuracy**: ~92%

### Disease Detection Model
- **Type**: MobileNetV2 CNN
- **Input**: Plant leaf images (224x224)
- **Output**: Disease classification
- **Accuracy**: ~89%

## Usage Examples

### Text Response (User-friendly)
```python
import requests

response = requests.post("http://127.0.0.1:8001/mcb/ask", json={
    "message": "What crop should I plant with nitrogen 25?",
    "user_id": "farmer123",
    "user_type": "farmer"
})

print(response.text)
# Output: "🌱 CROP RECOMMENDATION\nRECOMMENDED CROP: RICE\nConfidence: 85%..."
```

### JSON Response (Technical)
```python
response = requests.post("http://127.0.0.1:8001/mcb/execute", json={
    "model_id": "crop_recommendation_v1",
    "session_id": "session123",
    "inputs": {"features": [25, 20, 30, 26, 65, 6.7, 120]}
})

data = response.json()
print(data["result"]["crop"])  # "rice"
```

## Support
- **Documentation**: Visit `/docs` for interactive API documentation
- **Health Check**: Visit `/mcb/health` to verify system status
- **Help**: Visit `/mcb/help` for user-friendly guidance

## License
Part of SmartAgriSys - AI-powered agriculture platform
