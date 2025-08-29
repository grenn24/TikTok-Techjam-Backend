# utils.py
import numpy as np

def preprocess_features(features: list[float]) -> np.ndarray:
    """
    Preprocess input features for the ML model.

    Example preprocessing:
    - Convert list to numpy array
    - Normalize or scale if needed
    - Fill missing values (optional)
    """

    # Convert to numpy array
    x = np.array(features, dtype=np.float32)

    # Example: simple normalization to 0-1 range
    if np.max(x) > 0:
        x = x / np.max(x)

    return x
