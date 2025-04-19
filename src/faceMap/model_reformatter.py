
from tensorflow.keras.models import load_model
model = load_model("classifier_model.keras")
model.save("model_saved.tf")
