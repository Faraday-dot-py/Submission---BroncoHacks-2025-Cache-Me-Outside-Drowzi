import os
import cv2
import numpy as np
import tensorflow as tf

# ----------------------------
# FaceClassifier for Keras Image Model
# ----------------------------
class FaceClassifier:
    def __init__(self, model_path, class_names, target_size=(128, 128)):
        self.model = tf.keras.models.load_model(model_path)
        self.class_names = class_names
        self.target_size = target_size

    def preprocess_image(self, image):
        """Resize and normalize image for model input."""
        img_resized = cv2.resize(image, self.target_size)
        img_array = tf.keras.utils.img_to_array(img_resized)
        img_array = img_array / 255.0  # Normalize
        return np.expand_dims(img_array, axis=0)

    def predict_from_image(self, image):
        input_tensor = self.preprocess_image(image)
        predictions = self.model.predict(input_tensor)[0]
        predicted_index = np.argmax(predictions)
        label = self.class_names[predicted_index]
        confidence = float(np.max(predictions))
        return label, confidence, image
    

classifier = FaceClassifier('classifier_model.keras', ['Drowsy', 'Non Drowsy'])

# Load image
image_path = r'C:\Users\awebb\Documents\Programming\BroncoHacks\BroncoHacks2025-CacheMeOutside\src\ds\TooTiredForThisDS\ds\non_drowsy\frame_00000.jpg'
image = cv2.imread(image_path)

# Check if image was loaded successfully
if image is None:
    print(f"Error: Could not load image from {image_path}")
    print("Please verify the file path is correct and the file exists.")
    exit(1)

image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
label, confidence, image = classifier.predict_from_image(image)
print(f"Predicted label: {label}, Confidence: {confidence:.2f}")
