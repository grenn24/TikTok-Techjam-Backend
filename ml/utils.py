import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib
import cv2

try:
    compliance_model = joblib.load("model/compliance_model.h5")
except Exception as e:
    print("Error loading model:", e)
    compliance_model = None

# This will be loaded from disk if not already in memory
scaler = None

def fit_scaler(X):
    global scaler
    scaler = MinMaxScaler()
    scaler.fit(X)
    joblib.dump(scaler, "model/scaler.pkl")

def preprocess_features(features: list):
    """
    Input: list of numeric features
    Output: scaled numpy array ready for ML
    """
    global scaler
    if scaler is None:
        scaler = joblib.load("model/scaler.pkl")
    features = np.array(features, dtype=np.float32).reshape(1, -1)
    return scaler.transform(features)

def analyse_video_frame(frame):
    # Resize and normalize
    img = cv2.resize(frame, (128, 128))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)  # batch dimension
    score = compliance_model.predict(img)[0][0]
    return score
