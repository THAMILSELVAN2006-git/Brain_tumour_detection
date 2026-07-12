# Brain Tumor ML Microservice

This microservice wraps a ResNet50 deep learning model for classification of Brain MRI scans into four classes: Glioma, Meningioma, Pituitary, and No Tumor.

## Setup Instructions

1. **Prerequisites:** Ensure Python 3.9+ is installed.
2. **Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/Scripts/activate # On Windows: venv\Scripts\activate
   ```
3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Configuration:**
   Copy or configure `.env` (already done by the builder):
   ```env
   PORT=5001
   MODEL_PATH=../best_brain_tumor_model.keras
   ```
5. **Run the Server:**
   ```bash
   python app.py
   ```
   The service will run at `http://127.0.0.1:5001`. You can view Swagger documentation at `http://127.0.0.1:5001/docs`.
