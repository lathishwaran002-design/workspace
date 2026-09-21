# PredictiveEats 🍽️

A full-stack **Just-In-Time Predictive Food Ordering** web application.

The system uses ML-simulated prep time prediction and ETA calculation to tell the kitchen **exactly** when to start cooking — so your food is hot and ready the moment you arrive.

---

## 🚀 Quick Start

### Option A: One-Click (Windows)
Double-click **`run_all.bat`** in the workspace root. Two terminal windows will open — one for the backend, one for the frontend.

### Option B: Manual

**Backend** (FastAPI — Python)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
# Running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

**Frontend** (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

---

## 📱 App Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign In / Register screen |
| `/home` | Restaurant discovery with search, filters & menu modal |
| `/track` | Live order tracking with JIT timeline & real-time kitchen sync |
| `/kitchen` | 🍳 Live Kitchen Priority Queue Dashboard |

---

## 🧠 How the Predictive JIT Engine Works

1. **Customer places order** from the menu modal.
2. **Backend calculates ETA** (distance + simulated traffic ML).
3. **ML predicts prep time** (items × kitchen load factor).
4. **Priority Queue sorts orders** by `target_start_time = now + (ETA - prep_time)`.
5. Kitchen starts cooking at the **exact right moment** — food is ready as you arrive.

---

## 🗂️ Project Structure

```
workspace/
├── backend/
│   ├── main.py          # FastAPI app entrypoint
│   ├── auth.py          # Register & Login endpoints
│   ├── restaurants.py   # Nearby restaurants with rich menus
│   ├── orders.py        # JIT Priority Queue engine
│   ├── reviews.py       # Rating & review system
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── pages/
│           ├── Login.jsx          # Auth UI
│           ├── Home.jsx           # Discovery + Menu Modal + Cart
│           ├── OrderTracking.jsx  # Live tracking + status sync
│           └── KitchenDashboard.jsx # Live kitchen queue panel
│
└── run_all.bat          # Start both services
```

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/restaurants/nearby` | Get nearby restaurants with menus |
| POST | `/api/orders/create` | Place an order (triggers JIT engine) |
| GET | `/api/orders/queue` | View live priority queue |
| GET | `/api/orders/status/{order_id}` | Get specific order status |
| POST | `/api/orders/update-status` | Update order status (kitchen use) |
| POST | `/api/reviews/add` | Submit rating & review |
