from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import shutil
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the inference modules
from crop_rec.crop_recommendation_inference import predict_crop
from disease_detection.disease_detection_inference import predict

app = FastAPI(
    title="Smart Agriculture AI API",
    description="Unified API for crop recommendation and disease detection",
    version="1.0.0"
)

# Crop Recommendation Models
class CropRecRequest(BaseModel):
    features: List[float]  # [N, P, K, temperature, humidity, ph, rainfall]

class CropRecResponse(BaseModel):
    crop: str

@app.post("/crop_rec/predict", response_model=CropRecResponse)
def predict_crop_endpoint(request: CropRecRequest):
    """
    Get crop recommendations based on soil and weather parameters
    """
    try:
        crop = predict_crop(request.features)
        return {"crop": crop}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Disease Detection Models
@app.post("/disease_detection/predict")
async def predict_disease_endpoint(file: UploadFile = File(...)):
    """
    Detect plant diseases from uploaded images
    """
    temp_path = None
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save the uploaded file to a temporary location
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Predict disease
        result = predict(temp_path)
        
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# Health check endpoint
@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "models": {
            "crop_recommendation": "available",
            "disease_detection": "available"
        },
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "Smart Agriculture AI API",
        "endpoints": {
            "crop_recommendation": "/crop_rec/predict",
            "disease_detection": "/disease_detection/predict",
            "health": "/health"
        },
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 