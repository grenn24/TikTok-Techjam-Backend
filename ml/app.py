# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from utils import preprocess_features
import logging
import joblib
import requests
import os
from typing import List, Optional
from fastapi import FastAPI
from enum import Enum
from datetime import datetime
from video_analyser import analyze_video


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
    engagement_model = joblib.load("model/engagement_model.pkl")
    anomaly_model = joblib.load("model/anomaly_detector_model.pkl")
    content_quality_score = joblib.load("model/content_quality_model.pkl")
except Exception as e:
    print("Error loading model:", e)

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
    return {"status": "ok", "model_loaded":  engagement_model is not None and anomaly_model is not None and content_quality_score is not None}



# Engagement Score
@app.post("/content/engagement-score")
def getEngagementScore(data: ContentFeatures):
    if engagement_model is None:
        raise HTTPException(status_code=500, detail="Content quality model not loaded")

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
        pred = engagement_model.predict(x)

        # LightGBM returns a scalar for single sample, convert directly
        quality_score = float(pred) * 100

        return {"engagementScore": quality_score}

    except Exception as e:
        logger.exception("Error during prediction")
        raise HTTPException(status_code=400, detail=str(e))
    

class QualityScoreRequest(BaseModel):
    url: str
@app.post("/content/quality-score")
async def getQualityScore(request: QualityScoreRequest):
    url = request.url
    print(f"[Step 1] Received video URL: {url}")

    try:
        # Step 2: Download video
        tmp_path = "tmp_video.mp4"
        print(f"[Step 2] Downloading video to temporary path: {tmp_path}")
        resp = requests.get(url, stream=True)
        if resp.status_code != 200:
            print(f"[Error] Failed to download video, status code: {resp.status_code}")
            raise HTTPException(status_code=400, detail="Failed to download video")

        with open(tmp_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"[Step 2] Download complete")

        # Step 3: Analyze video
        print(f"[Step 3] Starting video analysis")
        result = analyze_video(tmp_path)
        print(f"[Step 3] Video analysis complete")

        # Step 4: Clean up temp file
        os.remove(tmp_path)
        print(f"[Step 4] Temporary file removed")

        return result

    except Exception as e:
        print(f"[Error] Exception occurred: {e}")
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
                log.createdAt.timestamp() / 86400
            ])
        X = np.array(features, dtype=np.float32)
        # Predict anomalies (1 = anomaly, 0 = normal)
        predictions = anomaly_model.predict(X)

        # Return flagged entries
        flagged = []
        for idx, pred in enumerate(predictions):
            print(pred)
            if pred == -1:  # anomaly
                flagged.append(request[idx].model_dump())

        return {"count": len(request), "anomalies_detected": len(flagged), "flagged_logs": flagged}

    except Exception as e:
        logger.exception("Error during anomaly detection")
        raise HTTPException(status_code=500, detail=str(e))