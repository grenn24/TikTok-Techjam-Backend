import cv2
import numpy as np
from tensorflow.python.keras.models import load_model
import os

# Load trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model/content_quality_model.h5")
model = load_model(MODEL_PATH)

# Categories
CATEGORIES = ["CommunityGuidelines", "Engagement", "Education", "Delivery", "AudioVisual"]

def analyze_video(video_path):
    """
    Analyze a video frame by frame and return category scores and feedback.
    """
    cap = cv2.VideoCapture(video_path)
    frames = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.resize(frame, (128,128))
        frame = frame.astype(np.float32) / 255.0  # normalize
        frames.append(frame)

    cap.release()
    frames = np.array(frames)

    # Predict per-frame scores
    scores = model.predict(frames)  # shape: (num_frames, num_categories)

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
    print(result)
