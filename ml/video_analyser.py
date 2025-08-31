import cv2
import numpy as np
from tensorflow.keras.models import load_model
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

# Categories → mapping to keys you want in final output
CATEGORY_KEYS = {
    "CommunityGuidelines": "communityGuidelines",
    "Education": "education",
    "Delivery": "delivery",
    "AudioVisual": "audioVisual",
    "Length": "length",
}

def analyze_video(video_path):
    if not os.path.exists(video_path):
        print(f"[ERROR] Video file not found: {video_path}")
        return None

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        return None

    frames = []
    frame_count = 0
    print(f"[INFO] Starting to read frames from video: {video_path}")
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        try:
            frame = cv2.resize(frame, (128, 128))
            frame = frame.astype(np.float32) / 255.0  # normalize
            frames.append(frame)
            if frame_count % 10 == 0:
                print(f"[INFO] Processed {frame_count} frames...")
        except Exception as e:
            print(f"[WARN] Skipping a frame due to error: {e}")
            continue

    cap.release()
    print(f"[INFO] Total frames processed: {len(frames)}")

    if len(frames) == 0:
        print("[ERROR] No valid frames found in video")
        return None

    frames = np.array(frames)

    # Predict per-frame scores
    try:
        print("[INFO] Running model predictions on frames...")
        scores = model.predict(frames, verbose=0)  # shape: (num_frames, num_categories)
        print(f"[INFO] Prediction complete. Shape: {scores.shape}")
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return None

    # Aggregate per category
    video_scores = scores.mean(axis=0)
    print(f"[INFO] Video scores (averaged per category): {video_scores}")

    # Build structured response
    result = {}
    for i, (cat, key) in enumerate(CATEGORY_KEYS.items()):
        if i >= len(video_scores):
            print(f"[WARN] Skipping {cat} because model only returned {len(video_scores)} outputs.")
            continue
        score = float(video_scores[i])
        feedback = (
        f"Excellent work on {cat}! Your performance here shows strong understanding and effort."
        if score >= 0.5 
        else f"There's room for improvement in {cat}. Consider focusing on this area to strengthen your skills."
        )
        result[key] = {
            "score": round(score * 100),
            "feedback": feedback
        }

    print(f"[INFO] Final structured result: {result}")
    return result

# Example usage:
if __name__ == "__main__":
    video_file = "../videos/sample_video.mp4"
    result = analyze_video(video_file)
    if result:
        print(result)
