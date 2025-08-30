# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from utils import preprocess_features, analyse_video_frame
import logging
import joblib
import cv2
import os
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File
from enum import Enum
from datetime import datetime


class AuditLogAction(str, Enum):
    SUSPICIOUS_GIFTING = "SUSPICIOUS_GIFTING"
    SEND_GIFT = "SEND_GIFT"
    POTENTIAL_GAMING = "POTENTIAL_GAMING"

class AuditLogEntry(BaseModel):
    id: str
    userId: str
    action: AuditLogAction
    amount: Optional[float] = 0
    description: Optional[str] = ""
    prevHash: Optional[str] = ""
    hash: str
    createdAt: datetime

logger = logging.getLogger("uvicorn.error") 
app = FastAPI(title="Reward ML Service")

# Load the trained models once
try:
    content_quality_model = joblib.load("model/content_quality_model.pkl")
    anomaly_model = joblib.load("model/anomaly_detector_model.pkl")
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
    views: int

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

# Prediction endpoint
@app.post("/content/engagement-score")
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
            data.views
        ]

        # Preprocess and ensure 2D array for the model
        x = preprocess_features(features_list)
        x = np.array(x, dtype=np.float32).reshape(1, -1)  # shape (1, n_features)

        # Predict content quality / reward multiplier
        pred = model.predict(x)

        # LightGBM returns a scalar for single sample, convert directly
        quality_score = float(pred) * 100

        return {"engagementScore": quality_score}

    except Exception as e:
        logger.exception("Error during prediction")
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post("/content/compliance-score")
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
    




@app.post("/audit/anomaly-detection")
async def detect_anomalies(request: List[AuditLogEntry]):
    if anomaly_model is None:
        raise HTTPException(status_code=500, detail="Anomaly detection model not loaded")

    try:
        # Convert logs to feature matrix
        action_mapping = {
            "SEND_GIFT": 0,
            "SUSPICIOUS_GIFTING": 1,
            "POTENTIAL_GAMING": 2
        }
        features = []
        for log in request:
            features.append([
                log.amount or 0,
                hash(log.userId) % 1000,
                action_mapping.get(log.action, 0),
                log.createdAt.timestamp()
            ])
        X = np.array(features, dtype=np.float32)

        # Predict anomalies (1 = anomaly, 0 = normal)
        predictions = anomaly_model.predict(X)

        # Return flagged entries
        flagged = []
        for idx, pred in enumerate(predictions):
            if pred == 1:
                flagged.append(request[idx].model_dump())

        return {"total_logs": len(request), "anomalies_detected": len(flagged), "flagged_entries": flagged}

    except Exception as e:
        logger.exception("Error during anomaly detection")
        raise HTTPException(status_code=500, detail=str(e))