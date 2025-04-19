import os
import json
import numpy as np
import joblib

def load_json_features(json_path):
    """Loads a single facial landmark JSON and flattens it."""
    with open(json_path, 'r') as f:
        landmarks = json.load(f)

    if not landmarks:
        return None

    feature_vector = []
    for lm in landmarks:
        feature_vector.extend([lm['x'], lm['y'], lm['z']])
    return np.array(feature_vector)

def load_test_data(test_dir):
    """Loads test features and labels from directory structure."""
    X_test = []
    y_test = []
    file_paths = []

    for root, _, files in os.walk(test_dir):
        label = os.path.basename(root)
        for file in files:
            if file.endswith('.json'):
                path = os.path.join(root, file)
                features = load_json_features(path)
                if features is not None:
                    X_test.append(features)
                    y_test.append(label)
                    file_paths.append(path)
    
    return np.array(X_test), np.array(y_test), file_paths

def run_test(model_path, test_data_dir):
    print("Loading model...")
    clf = joblib.load(model_path)

    print("Loading test data...")
    X_test, y_test, file_paths = load_test_data(test_data_dir)

    if len(X_test) == 0:
        print("No valid test data found.")
        return

    print("Running predictions...")
    y_pred = clf.predict(X_test)

    print("\nResults:")
    for path, true_label, pred_label in zip(file_paths, y_test, y_pred):
        print(f"{os.path.basename(path)} | True: {true_label} | Predicted: {pred_label}")

    from sklearn.metrics import classification_report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

if __name__ == "__main__":
    model_file = "face_classifier.pkl"
    test_dir = r"C:\Users\awebb\Documents\Programming\BroncoHacks\BroncoHacks2025-CacheMeOutside\src\ds\facial_mappings_standard"  # <-- Adjust path to your test data
    run_test(model_file, test_dir)
