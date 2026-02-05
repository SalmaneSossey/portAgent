"""
Upload Router - File upload handling
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import uuid
import aiofiles

from database import get_db
from models import Dossier, Facture, Document

router = APIRouter()

UPLOAD_DIR = "uploads"


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    dossier_id: str = Form(...),
    category: str = Form("facture"),  # "facture" or "document"
    db: Session = Depends(get_db)
):
    """Upload a file (invoice or document) for a dossier"""
    # Validate dossier exists
    try:
        dossier_uuid = uuid.UUID(dossier_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de dossier invalide")
    
    dossier = db.query(Dossier).filter(Dossier.id == dossier_uuid).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Create database record
    if category == "facture":
        record = Facture(
            dossier_id=dossier_uuid,
            file_path=file_path,
            reference=file.filename
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = str(record.id)
    else:
        record = Document(
            dossier_id=dossier_uuid,
            file_path=file_path,
            description=file.filename
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = str(record.id)
    
    return {
        "status": "success",
        "file_id": record_id,
        "file_path": file_path,
        "category": category,
        "filename": file.filename
    }
