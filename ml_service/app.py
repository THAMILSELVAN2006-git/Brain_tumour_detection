import os
import io
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet50 import preprocess_input
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MastishkNetra ML Microservice", version="1.0")

# Enable CORS for connection with the Node backend and other clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths and settings
MODEL_PATH = os.getenv("MODEL_PATH", "../best_brain_tumor_model.keras")
CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]
model = None

@app.on_event("startup")
def load_ml_model():
    global model
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at path: {MODEL_PATH}")
        # Try parent directory relative fallback if executed inside ml_service folder
        fallback_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "best_brain_tumor_model.keras"))
        if os.path.exists(fallback_path):
            print(f"Loading fallback model from: {fallback_path}")
            model = load_model(fallback_path)
            return
        raise RuntimeError(f"Could not locate the trained model at {MODEL_PATH} or {fallback_path}")
    print(f"Loading Keras model from: {MODEL_PATH}")
    model = load_model(MODEL_PATH)
    print("Model loaded successfully!")

@app.get("/health")
def health_check():
    if model is None:
        return {"status": "unhealthy", "message": "Model not loaded"}
    return {"status": "healthy", "message": "ML service is running, model loaded"}

@app.post("/predict")
async def predict_mri(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="ML Model not loaded on server yet")
    
    # Verify file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image")

    try:
        # Read file contents and open image
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")
        
        # Resize to ResNet50 requirement (224x224)
        image = image.resize((224, 224))
        
        # Convert image to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Expand dims to batch size 1 (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Preprocess using ResNet50 criteria (BGR conversion & mean subtraction)
        preprocessed_img = preprocess_input(img_array)
        
        # Predict using ResNet50
        predictions = model.predict(preprocessed_img)
        probabilities = predictions[0]
        
        predicted_idx = int(np.argmax(probabilities))
        predicted_class = CLASS_NAMES[predicted_idx]
        
        confidence_scores = {
            CLASS_NAMES[i]: float(probabilities[i]) for i in range(len(CLASS_NAMES))
        }
        
        return {
            "predictedClass": predicted_class,
            "confidenceScores": confidence_scores,
            "modelVersion": "ResNet50-Transfer-v1.0"
        }
    except Exception as e:
        print(f"Inference Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference processing failed: {str(e)}")

@app.get("/model-info")
def get_model_info():
    """
    Returns metrics calculated during the test evaluation pipeline 
    to drive the admin dashboard diagrams.
    """
    return {
        "accuracy": 0.92,
        "classificationReport": {
            "glioma": {"precision": 0.97, "recall": 0.73, "f1-score": 0.84, "support": 400},
            "meningioma": {"precision": 0.82, "recall": 0.95, "f1-score": 0.88, "support": 400},
            "notumor": {"precision": 0.95, "recall": 1.00, "f1-score": 0.97, "support": 400},
            "pituitary": {"precision": 0.97, "recall": 0.99, "f1-score": 0.98, "support": 400}
        },
        "confusionMatrix": [
            [292, 98, 4, 6],
            [5, 380, 11, 4],
            [0, 0, 400, 0],
            [3, 0, 1, 396]
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=5001, reload=True)
