"""
PortAgent Trade Copilot - FastAPI Backend
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import dossiers, upload, extraction, tijaria, judge, autopilot, submit, chat

# Create FastAPI app
app = FastAPI(
    title="PortAgent API",
    description="API pour le Copilote d'Exécution PortAgent",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(dossiers.router, prefix="/api", tags=["Dossiers"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(extraction.router, prefix="/api", tags=["Extraction"])
app.include_router(tijaria.router, prefix="/api", tags=["TijarIA"])
app.include_router(judge.router, prefix="/api", tags=["Validation"])
app.include_router(autopilot.router, prefix="/api", tags=["Autopilot"])
app.include_router(submit.router, prefix="/api", tags=["Soumission"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])


@app.get("/")
async def root():
    """Root endpoint - API welcome message"""
    return {
        "service": "PortAgent Trade Copilot API",
        "version": "2.0.0",
        "documentation": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "PortAgent API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
