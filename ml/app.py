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
class ContentFeatures(BaseModel):
    likes: int
    shares: int
    comments: int
    watchTime: float  # in seconds
    contentLength: float  # in seconds
    creatorReputation: float  # e.g., 0-1

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

# Prediction endpoint
@app.post("/content-quality")
def predict(data: ContentFeatures):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Convert to feature vector
        features_list = [
            data.likes,
            data.shares,
            data.comments,
            data.watchTime,
            data.contentLength,
            data.creatorReputation,
        ]
        x = preprocess_features(features_list)
        x = np.array([x], dtype=np.float32)

        # Predict content quality / reward multiplier
        pred = model.predict(x)
        quality_score = float(pred[0][0])

        return {"quality_score": quality_score}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))