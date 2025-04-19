import cv2
import numpy as np
import mediapipe as mp
import joblib
import os
import base64
from flask import Flask, request, render_template_string, jsonify

# ----------------------------
# FaceClassifier Definition
# ----------------------------
class FaceClassifier:
    def __init__(self, model_path):
        # Load trained classifier
        self.model = joblib.load(model_path)
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(static_image_mode=True)

    def _extract_landmarks(self, image):
        """Extracts facial landmarks as a flat numpy vector."""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_image)
        if not results.multi_face_landmarks:
            return None

        # Take first detected face
        landmarks = []
        for lm in results.multi_face_landmarks[0].landmark:
            landmarks.extend([lm.x, lm.y, lm.z])
        return np.array(landmarks)

    def draw_landmarks(self, image, landmarks):
        """Draws landmarks onto the image for debugging/visualization."""
        h, w = image.shape[:2]
        for i in range(0, len(landmarks), 3):
            x = int(landmarks[i] * w)
            y = int(landmarks[i+1] * h)
            cv2.circle(image, (x, y), 1, (0, 255, 0), -1)
        return image

    def predict_from_image(self, image):
        """Predicts class label and confidence from a BGR image."""
        features = self._extract_landmarks(image)
        if features is None:
            return None, None, image

        # Predict label
        label = self.model.predict([features])[0]
        # Predict probability if supported
        if hasattr(self.model, 'predict_proba'):
            probs = self.model.predict_proba([features])[0]
            confidence = float(np.max(probs))
        else:
            confidence = None

        # Annotate image with landmarks and label
        annotated = image.copy()
        annotated = self.draw_landmarks(annotated, features)
        text = f"{label}" + (f" ({confidence*100:.1f}%)" if confidence is not None else "")
        cv2.putText(annotated, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        return label, confidence, annotated

# ----------------------------
# Flask Web App for Live Camera
# ----------------------------
app = Flask(__name__)
clf_web = FaceClassifier('face_classifier.pkl')

HTML_TEMPLATE = '''
<!doctype html>
<html>
<head>
  <title>Live Face Classifier</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; color: #333; text-align: center; }
    #container { display: flex; justify-content: center; align-items: flex-start; gap: 20px; margin-top: 20px; }
    video, img { border: 2px solid #ccc; border-radius: 8px; }
    #controls { margin-top: 15px; }
    button { padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer; background: #007bff; color: #fff; }
    button:hover { background: #0056b3; }
    #result img { width: 500px; height: auto; }
  </style>
</head>
<body>
  <h1>Live Camera Face Classification</h1>
  <div id="container">
    <video id="video" width="500" height="500" autoplay muted></video>
    <div id="result"></div>
  </div>
  <div id="controls">
    <button id="snap">Capture & Predict</button>
  </div>
  <script>
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { video.srcObject = stream; })
      .catch(err => console.error("Error accessing camera: ", err));

    document.getElementById('snap').addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      fetch('/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataURL })
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById('result').innerHTML =
          `<h2>Prediction: ${data.label}${data.confidence ? ' (' + (data.confidence*100).toFixed(1) + '%)' : ''}</h2>` +
          `<img src="${data.image_data}" />`;
      })
      .catch(err => console.error(err));
    });
  </script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/capture', methods=['POST'])
def capture():
    content = request.get_json()
    if not content or 'image' not in content:
        return jsonify(error='No image provided'), 400

    # Decode base64 image
    img_b64 = content['image'].split(',')[1]
    img_bytes = base64.b64decode(img_b64)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Predict and annotate
    label, confidence, annotated = clf_web.predict_from_image(img)

    # Encode annotated image back to base64
    _, buffer = cv2.imencode('.jpg', annotated)
    ann_b64 = base64.b64encode(buffer).decode()

    return jsonify(
        label=label,
        confidence=confidence,
        image_data='data:image/jpeg;base64,' + ann_b64
    )

# ----------------------------
# Entry Point
# ----------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
