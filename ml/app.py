from fastapi import FastAPI
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
from utils import preprocess_features

app = FastAPI()

# Load the trained model
model = tf.keras.models.load_model("model/reward_model.h5")

# Define input schema
class Features(BaseModel):
    features: list[float]

@app.post("/predict")
def predict(data: Features):
    # Preprocess features if needed
    x = preprocess_features(data.features)
    x = np.array([x], dtype=np.float32)

    # Make prediction
    pred = model.predict(x)
    reward_multiplier = float(pred[0][0])

    return {"reward_multiplier": reward_multiplier}