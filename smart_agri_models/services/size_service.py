from typing import Dict

# Placeholder size estimator; replace with your model logic later

def estimate(payload: Dict) -> Dict:
    # If you later provide an image, parse it similarly to disease_service
    # For now, return a fixed response
    return {
        "size": 7.2,
        "unit": "cm",
        "confidence": 0.65,
        "note": "Placeholder; plug in fruit_size_model.pt when available."
    }
