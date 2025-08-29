# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
from utils import preprocess_features

app = FastAPI(title="Reward ML Service")

# Load the trained model once at startup
try:
    model = tf.keras.models.load_model("model/reward_model.h5")
except Exception as e:
    print("Error loading model:", e)
    model = None

# Input schema
class Features(BaseModel):
    features: list[float]

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

# Prediction endpoint
@app.post("/predict")
def predict(data: Features):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Preprocess features
        x = preprocess_features(data.features)
        x = np.array([x], dtype=np.float32)

        # Make prediction
        pred = model.predict(x)
        reward_multiplier = float(pred[0][0])

        return {"reward_multiplier": reward_multiplier}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))