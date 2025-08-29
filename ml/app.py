# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
from utils import preprocess_features
import logging
import joblib

logger = logging.getLogger("uvicorn.error") 

app = FastAPI(title="Reward ML Service")

# Load the trained model once at startup
try:
    model = joblib.load("model/content_quality_model.pkl")
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

        # Preprocess and ensure 2D array for the model
        x = preprocess_features(features_list)
        x = np.array(x, dtype=np.float32).reshape(1, -1)  # shape (1, n_features)

        # Predict content quality / reward multiplier
        pred = model.predict(x)

        # LightGBM returns a scalar for single sample, convert directly
        quality_score = float(pred) * 100

        return {"qualityScore": quality_score}

    except Exception as e:
        logger.exception("Error during prediction")
        raise HTTPException(status_code=400, detail=str(e))