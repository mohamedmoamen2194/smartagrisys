from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from crop_recommendation_inference import predict_crop

app = FastAPI()

class CropRecRequest(BaseModel):
    features: List[float]  # [N, P, K, temperature, humidity, ph, rainfall]

class CropRecResponse(BaseModel):
    crop: str

@app.post("/predict", response_model=CropRecResponse)
def predict(request: CropRecRequest):
    try:
        crop = predict_crop(request.features)
        return {"crop": crop}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 