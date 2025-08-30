import cv2
import os
from pathlib import Path

video_root = ""       # Folder containing videos per category
output_root = "frames"  # Folder to save extracted frames
categories = ["CommunityGuidelines", "Education", "Delivery", "AudioVisual"]
frame_interval = 10  # sample every 10 frames

# Create output directories
for cat in categories:
    os.makedirs(os.path.join(output_root, cat), exist_ok=True)

# Loop through categories
for cat in categories:
    cat_video_dir = os.path.join(video_root, cat)
    if not os.path.exists(cat_video_dir):
        print(f"[WARN] No folder for category {cat}, skipping.")
        continue

    video_files = [f for f in os.listdir(cat_video_dir) if f.endswith((".mp4", ".mov", ".avi"))]
    print(f"[INFO] Found {len(video_files)} videos for category {cat}")

    # Extract frames
    for video_file in video_files:
        video_path = os.path.join(cat_video_dir, video_file)
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"[ERROR] Could not open {video_path}")
            continue

        frame_count = 0
        saved_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                # Save frame
                frame_filename = f"{Path(video_file).stem}_frame{frame_count}.png"
                frame_path = os.path.join(output_root, cat, frame_filename)
                cv2.imwrite(frame_path, frame)
                saved_count += 1

            frame_count += 1

        cap.release()
        print(f"[INFO] Saved {saved_count} frames from {video_file} in category {cat}")

print("[DONE] Frame extraction complete.")
