import os
import json
import random
import matplotlib.pyplot as plt

def load_landmark_file(json_path):
    with open(json_path, 'r') as f:
        return json.load(f)

def overlay_n_random_landmarks(json_dir, n=10):
    # Collect all .json file paths
    all_json_files = []
    for root, _, files in os.walk(json_dir):
        for file in files:
            if file.endswith('.json'):
                all_json_files.append(os.path.join(root, file))

    # If fewer files than n, just use all
    selected_files = random.sample(all_json_files, min(n, len(all_json_files)))

    # Plot them
    plt.figure(figsize=(8, 8))
    for path in selected_files:
        landmarks = load_landmark_file(path)
        if landmarks:
            print(landmarks)
            x = [(point[0] if type(point) != float else point) for point in landmarks]
            y = [(point[1] if type(point) != float else point) for point in landmarks]
            plt.scatter(x, [-yi for yi in y], alpha=0.3, color='blue')

    plt.title(f"Overlay of {len(selected_files)} Random Facial Landmarks")
    plt.xlabel("X")
    plt.ylabel("Y (inverted)")
    plt.axis('equal')
    plt.grid(True)
    plt.show()

# Example usage
if __name__ == "__main__":
    landmark_root = r"C:\Users\awebb\Documents\Programming\BroncoHacks\BroncoHacks2025-CacheMeOutside\src\ds\facial_mappings_standard\non_drowsy"
    overlay_n_random_landmarks(landmark_root, n=20)  # Pick a random 20
