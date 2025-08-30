import cv2
import numpy as np
from tensorflow.python.keras.models import load_model
import os
import sys
import tensorflow as tf

print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))

# Load trained model with error handling
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model/content_quality_model.h5")
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    model = load_model(MODEL_PATH)
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    sys.exit(1)

# Categories
CATEGORIES = ["CommunityGuidelines", "Engagement", "Education", "Delivery", "AudioVisual"]

def analyze_video(video_path):
    """
    Analyze a video frame by frame and return category scores and feedback.
    """
    if not os.path.exists(video_path):
        print(f"[ERROR] Video file not found: {video_path}")
        return None

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        return None

    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        try:
            frame = cv2.resize(frame, (128,128))
            frame = frame.astype(np.float32) / 255.0  # normalize
            frames.append(frame)
        except Exception as e:
            print(f"[WARN] Skipping a frame due to error: {e}")
            continue

    cap.release()

    if len(frames) == 0:
        print("[ERROR] No valid frames found in video")
        return None

    frames = np.array(frames)

    # Predict per-frame scores
    try:
        scores = model.predict(frames, verbose=0)  # shape: (num_frames, num_categories)
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return None

    # Aggregate per category
    video_scores = scores.mean(axis=0)

    # Generate targeted feedback
    feedback = {}
    for i, category in enumerate(CATEGORIES):
        score = video_scores[i]
        if score < 0.5:
            feedback[category] = f"Needs improvement in {category}."
        else:
            feedback[category] = f"Good {category}."

    return {
        "scores": dict(zip(CATEGORIES, video_scores.tolist())),
        "feedback": feedback
    }

# Example usage:
if __name__ == "__main__":
    video_file = "../videos/sample_video.mp4"
    result = analyze_video(video_file)
    if result:
        print(result)
