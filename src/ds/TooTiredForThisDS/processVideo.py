import cv2
import os

def extract_frames(video_path, desired_fps):
    # Get video name without extension
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    output_dir = os.path.join(os.path.dirname(video_path), video_name)
    print(output_dir)
    os.makedirs(output_dir, exist_ok=True)

    # Open the video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ Error: Could not open video {video_path}")
        return

    # Get original FPS
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    if original_fps == 0:
        print(f"⚠️ Warning: FPS is 0 for {video_path}. Skipping.")
        return

    frame_interval = int(original_fps / desired_fps)
    if frame_interval < 1:
        frame_interval = 1

    print(f"🎥 Processing '{video_path}'")
    print(f"Original FPS: {original_fps:.2f}, saving every {frame_interval}th frame")

    frame_count = 0
    saved_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            frame_filename = os.path.join(output_dir, f"frame_{saved_count:05d}.jpg")
            success = cv2.imwrite(frame_filename, frame)
            if success:
                saved_count += 1
            else:
                print(f"❌ Failed to save {frame_filename}")

        frame_count += 1

    cap.release()
    print(f"✅ Done: Saved {saved_count} frames to '{output_dir}'")

if __name__ == "__main__":
    desired_fps = 10.0
    working_dir = r"C:\Users\awebb\Documents\Programming\BroncoHacks\BroncoHacks2025-CacheMeOutside\src\ds\TooTiredForThisDS"
    mp4_files = [f for f in os.listdir(working_dir) if f.lower().endswith(".mp4")]
    print(os.listdir(working_dir))

    if not mp4_files:
        print("No .mp4 files found in the current directory.")
    else:
        for file in mp4_files:
            video_path = os.path.join(working_dir, file)
            extract_frames(video_path, desired_fps)
