# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from utils import preprocess_features, analyse_video_frame
import logging
import joblib
import cv2
import os


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
    
@app.post("/compliance-score")
async def compliance_score(video: UploadFile = File(...)):
    """
    Upload a video and get a compliance score (0-100).
    """
    try:
        # Save uploaded file temporarily
        tmp_path = f"tmp_{video.filename}"
        with open(tmp_path, "wb") as f:
            f.write(await video.read())

        # Open video with OpenCV
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video")

        frame_scores = []
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Sample every 10th frame for speed
            if frame_count % 10 == 0:
                score = analyse_video_frame(frame)
                frame_scores.append(score)

            frame_count += 1

        cap.release()
        os.remove(tmp_path)

        if not frame_scores:
            raise HTTPException(status_code=400, detail="No frames analyzed")

        # Average score across frames and convert to 0-100
        compliance_score = float(np.mean(frame_scores) * 100)

        return {"complianceScore": compliance_score}

    except Exception as e:
        logger.exception("Error during compliance scoring")
        raise HTTPException(status_code=500, detail=str(e))