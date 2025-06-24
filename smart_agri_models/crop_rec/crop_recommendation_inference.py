import os
from joblib import load
import numpy as np

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

LE_PATH = os.path.join(MODEL_DIR, 'label_encoder (1).joblib')
RF_PATH = os.path.join(MODEL_DIR, 'crop_recommendation_rf_model (1).joblib')

le = load(LE_PATH)
rf = load(RF_PATH)

def predict_crop(features):
    """
    features: list or array-like of shape (n_features,)
    Returns: predicted crop name (str)
    """
    X = np.array([features])
    pred = rf.predict(X)
    crop = le.inverse_transform(pred)[0]
    return crop 