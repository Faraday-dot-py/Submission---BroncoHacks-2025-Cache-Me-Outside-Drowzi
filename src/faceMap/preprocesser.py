import os
import cv2
import json
import re
import random
import math
import mediapipe as mp
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm

import os
from absl import logging

# Optional: also try this before any MediaPipe imports
os.environ["GLOG_minloglevel"] = "2"

# Suppress absl logs
logging.set_verbosity(logging.ERROR)





# Define only the relevant facial feature connections
CONNECTIONS = {
    'lips': [
        (61, 146), (146, 91), (91, 181), (181, 84), (84, 17),
        (17, 314), (314, 405), (405, 321), (321, 375), (375, 291),
        (61, 185), (185, 40), (40, 39), (39, 37), (37, 0), (0, 267),
        (267, 269), (269, 270), (270, 409), (409, 291),
        (78, 95), (95, 88), (88, 178), (178, 87), (87, 14),
        (14, 317), (317, 402), (402, 318), (318, 324), (324, 308),
        (78, 191), (191, 80), (80, 81), (81, 82), (82, 13),
        (13, 312), (312, 311), (311, 310), (310, 415), (415, 308)
    ],
    'left_eye': [(263, 249), (249, 390), (390, 373), (373, 374),
        (374, 380), (380, 381), (381, 382), (382, 362),
        (263, 466), (466, 388), (388, 387), (387, 386),
        (386, 385), (385, 384), (384, 398), (398, 362)],
    'left_eyebrow': [(276, 283), (283, 282), (282, 295),
                                   (295, 285), (300, 293), (293, 334),
                                   (334, 296), (296, 336)],
    'right_eye': [(33, 7), (7, 163), (163, 144), (144, 145),
                                (145, 153), (153, 154), (154, 155), (155, 133),
                                (33, 246), (246, 161), (161, 160), (160, 159),
                                (159, 158), (158, 157), (157, 173), (173, 133)],
    'right_eyebrow': [(46, 53), (53, 52), (52, 65), (65, 55),
                                    (70, 63), (63, 105), (105, 66), (66, 107)],
}

# Flatten connections into a single list
ALL_CONNECTIONS = []
for conns in CONNECTIONS.values():
    ALL_CONNECTIONS.extend(conns)

def extract_facial_distances(image_path):
    mp_face_mesh = mp.solutions.face_mesh
    with mp_face_mesh.FaceMesh(static_image_mode=True) as face_mesh:
        img = cv2.imread(image_path)
        if img is None:
            return None
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_img)

        if not results.multi_face_landmarks:
            return None

        face_landmarks = results.multi_face_landmarks[0]
        raw_landmarks = np.array([[lm.x, lm.y, lm.z] for lm in face_landmarks.landmark])

        # Normalize landmarks
        centroid = np.mean(raw_landmarks, axis=0)
        centered = raw_landmarks - centroid
        scale = np.linalg.norm(centered, axis=1).max()
        if scale > 0:
            normalized = centered / scale
        else:
            normalized = centered

        # Compute distances between connected points
        distances = []
        for i, j in ALL_CONNECTIONS:
            dist = np.linalg.norm(normalized[i] - normalized[j])
            distances.append(dist)
        return distances

def save_distances(distances, output_path):
    with open(output_path, 'w') as f:
        json.dump(distances, f, indent=2)

def process_image(input_path, output_path):
    distances = extract_facial_distances(input_path)
    if distances:
        save_distances(distances, output_path)
    else:
        print(f"  → No face found in {input_path}")

def process_directory(input_dir, output_dir, max_files_per_class=10, group_by_prefix=True, max_threads=8, max_files=math.inf):
    for root, dirs, files in os.walk(input_dir):
        filesSetToProcess = 0
        rel_path = os.path.relpath(root, input_dir)
        image_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if not image_files:
            continue

        sampled = []

        if group_by_prefix:
            groups = {}
            for fname in image_files:
                m = re.match(r'^([A-Za-z]{1,2})\d+', fname)
                if not m:
                    continue
                pid = m.group(1).upper()
                groups.setdefault(pid, []).append(fname)

            for pid, flist in groups.items():
                sampled.extend(flist if len(flist) <= max_files_per_class else random.sample(flist, max_files_per_class))
        else:
            sampled = image_files if len(image_files) <= max_files_per_class else random.sample(image_files, max_files_per_class)

        output_subdir = os.path.join(output_dir, rel_path)
        os.makedirs(output_subdir, exist_ok=True)

        with ThreadPoolExecutor(max_threads) as executor:
            futures = []
            for fname in tqdm(sampled, desc=f"Processing {rel_path}"):
                if filesSetToProcess >= max_files:
                    break
                filesSetToProcess += 1
                input_path = os.path.join(root, fname)
                out_fname = os.path.splitext(fname)[0] + '.json'
                output_path = os.path.join(output_subdir, out_fname)
                futures.append(executor.submit(process_image, input_path, output_path))

            for future in futures:
                future.result()

if __name__ == "__main__":
    input_root = r"C:\Users\awebb\Documents\Programming\BroncoHacks\BroncoHacks2025-CacheMeOutside\src\ds\TooTiredForThisDS\ds"
    output_root = r"C:\Users\awebb\Documents\Programming\BroncoHacks\BroncoHacks2025-CacheMeOutside\src\ds\facial_mappings_standard"
    use_grouping = not "TooTiredForThisDS" in input_root
    process_directory(input_root, output_root, max_files_per_class=100, group_by_prefix=use_grouping, max_threads=8, max_files=2000)
