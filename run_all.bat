@echo off
echo Starting PredictiveEats Backend...
start cmd /k "cd backend && pip install -r requirements.txt && python -m uvicorn main:app --reload"

echo Starting PredictiveEats Frontend...
start cmd /k "cd frontend && npm install && npm run dev"

echo Both services are starting up!
