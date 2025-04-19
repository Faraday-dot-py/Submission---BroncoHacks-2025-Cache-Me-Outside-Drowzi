import os
import cv2
import numpy as np
import base64
import tensorflow as tf
from flask import Flask, request, jsonify
from functools import wraps
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS

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
        return label, confidence

# ----------------------------
# Load Classes and Create App
# ----------------------------
dataset_path = os.getenv('DATASET_PATH', r'C:\Users\awebb\Documents\Programming\BroncoHacks\BroncoHacks2025-CacheMeOutside\src\ds\facial_mappings_standard')
classes = sorted([d for d in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, d))])

app = Flask(__name__)
clf = FaceClassifier(os.getenv('MODEL_PATH', 'classifier_model.keras'), classes)

# ----------------------------
# Security & Rate Limiting
# ----------------------------
API_KEYS = os.getenv('API_KEYS', '').split(',')

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per minute"]
)

CORS(app)  # Enable CORS if needed

def require_api_key(view_func):
    @wraps(view_func)
    def decorated(*args, **kwargs):
        provided_key = request.headers.get('X-API-Key')
        if not API_KEYS or provided_key in API_KEYS:
            return view_func(*args, **kwargs)
        return jsonify(status='error', message='Unauthorized'), 401
    return decorated

# ----------------------------
# API Endpoints
# ----------------------------
@app.route('/predict', methods=['POST'])
@require_api_key
@limiter.limit("10 per minute")
def predict():
    # Handle image from different sources
    img = None
    if 'image' in request.files:
        file = request.files['image']
        img_bytes = file.read()
        img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
    elif request.is_json:
        data = request.get_json()
        if 'image' not in data:
            return jsonify(status='error', message='Missing image data'), 400
        try:
            img_str = data['image'].split(',')[-1]  # Handle data URL
            img_bytes = base64.b64decode(img_str)
            img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        except Exception as e:
            return jsonify(status='error', message=f'Invalid image: {str(e)}'), 400
    
    if img is None:
        return jsonify(status='error', message='No valid image provided'), 400

    # Perform prediction
    try:
        label, confidence = clf.predict_from_image(img)
    except Exception as e:
        return jsonify(status='error', message=str(e)), 500

    # Build response
    response = {
        'status': 'success',
        'data': {
            'label': label,
            'confidence': confidence
        }
    }

    # Optional: include processed image
    if request.args.get('include_image', '').lower() == 'true':
        _, buffer = cv2.imencode('.jpg', img)
        response['data']['image'] = 'data:image/jpeg;base64,' + base64.b64encode(buffer).decode()

    return jsonify(response)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify(status='success', message='API operational')

# ----------------------------
# Entry Point
# ----------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)