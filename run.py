import subprocess
import sys
import os
import time

print("Starting PredictiveEats Backend and Frontend...")

# Start the FastAPI backend using the current Python environment
backend_process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
)

# Give the backend a few seconds to start up before starting the frontend
time.sleep(3)

# Start the Vite React frontend
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
frontend_process = subprocess.Popen(
    "npm run dev", 
    cwd=frontend_dir, 
    shell=True
)

try:
    backend_process.wait()
    frontend_process.wait()
except KeyboardInterrupt:
    print("\nShutting down servers...")
    backend_process.terminate()
    frontend_process.terminate()
