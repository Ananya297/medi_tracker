# -----------------------------------------------------------------------------
# Module Imports
# Import uvicorn server runner and environment settings
# -----------------------------------------------------------------------------
import uvicorn
import os

# -----------------------------------------------------------------------------
# Server Entrypoint
# Starts local FastAPI development server on port 8000 with hot reloading
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting MedTracker Backend on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
