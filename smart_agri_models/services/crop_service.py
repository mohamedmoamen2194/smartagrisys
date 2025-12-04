from typing import Dict, Any, List
from smart_agri_models.crop_rec.crop_recommendation_inference import predict_crop

ORDER: List[str] = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


def recommend(features: Dict[str, Any]) -> Dict[str, Any]:
    if isinstance(features, dict):
        try:
            X = [float(features.get(k, 0)) for k in ORDER]
        except Exception:
            X = [features.get(k, 0) for k in ORDER]
    else:
        X = list(features)
    crop = predict_crop(X)
    return {"crop": crop}
