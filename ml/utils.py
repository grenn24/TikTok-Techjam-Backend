import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib

# Example: preprocessor for numeric features
scaler = MinMaxScaler()

def fit_scaler(X):
    global scaler
    scaler.fit(X)
    joblib.dump(scaler, "model/scaler.pkl")

def preprocess_features(features: list):
    """
    Input: list of numeric features
    Output: scaled numpy array ready for ML
    """
    global scaler
    if not scaler:
        scaler = joblib.load("model/scaler.pkl")
    features = np.array(features, dtype=np.float32).reshape(1, -1)
    return scaler.transform(features)
