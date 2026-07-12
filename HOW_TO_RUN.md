# Deploy & Run Guide — MastishkNetra AI

Follow these instructions to start all three services in your development environment.

---

## 1. System Requirements
- **MongoDB:** Ensure MongoDB is running locally at `mongodb://127.0.0.1:27017` or configured in `backend/.env`.
- **Node.js:** version 18+ (verified on Node 22).
- **Python:** version 3.9+ (verified on Python 3.12).

---

## 2. Startup Pipeline

### Step A: Run the Python ML Service
In your terminal, navigate to `ml_service` and run:
```bash
cd ml_service
# Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Start the FastAPI model server
python app.py
```
*The ML microservice will load `best_brain_tumor_model.keras` and run on `http://127.0.0.1:5001`.*

### Step B: Run the Node.js Backend Gateway
In a separate terminal, navigate to `backend` and run:
```bash
cd backend
# Install dependencies
npm install

# Seed default doctor/admin login credentials and sample patient records
npm run seed

# Start Express server in development mode
npm run dev
```
*The API gateway will listen on port `5000`.*

### Step C: Run the React Frontend Portal
In a third terminal, navigate to `frontend` and run:
```bash
cd frontend
# Install dependencies
npm install

# Start the Vite developer server
npm run dev
```
*Vite compiles resources and hosts the portal at `http://localhost:5173`.*

---

## 3. Pre-Seeded Clinical Accounts

Once the servers are running, open `http://localhost:5173` in your browser and use these default accounts:

### 🩺 Doctor / Radiologist Portal
- **Email:** `doctor@mastishk.net`
- **Password:** `password123`
*Privileges: Create patients, upload MRI slices for classification, and write findings.*

### 🛡️ System Control Administrator
- **Email:** `admin@mastishk.net`
- **Password:** `password123`
*Privileges: Monitor ML server health, inspect clinical audit logs, activate/deactivate physician accounts.*
