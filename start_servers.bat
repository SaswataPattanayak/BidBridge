@echo off
echo Starting BidBridge Backend...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn server:fastapi_app --reload --port 8000"

echo Starting BidBridge Frontend...
start cmd /k "cd frontend && npm start"

echo Both servers are starting in new windows!
