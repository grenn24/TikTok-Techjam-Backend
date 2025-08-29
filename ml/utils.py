import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib

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