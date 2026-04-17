from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from contextlib import asynccontextmanager

from database import engine, get_db, init_db
import models
import schemas

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the DB and seed if necessary
    init_db()
    yield

app = FastAPI(title="Moths Database", lifespan=lifespan)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/moths", response_model=List[schemas.MothDescription])
def read_moths(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    moths = db.query(models.Moth).offset(skip).limit(limit).all()
    return moths

@app.get("/moths/{moth_id}", response_model=schemas.MothDescription)
def read_moth(moth_id: int, db: Session = Depends(get_db)):
    moth = db.query(models.Moth).filter(models.Moth.id == moth_id).first()
    if moth is None:
        raise HTTPException(status_code=404, detail="Moth not found")
    return moth

@app.get("/search", response_model=List[schemas.MothDescription])
def search_moths(query: str = Query(..., description="Search by common_name, scientific_name, or family_name"), db: Session = Depends(get_db)):
    search_pattern = f"%{query}%"
    moths = db.query(models.Moth).filter(
        models.Moth.common_name.ilike(search_pattern) |
        models.Moth.scientific_name.ilike(search_pattern) |
        models.Moth.family_name.ilike(search_pattern) |
        models.Moth.description.ilike(search_pattern)
    ).all()
    return moths

@app.post("/moths", response_model=schemas.MothDescription)
def create_moth(moth: schemas.MothDescriptionCreate, db: Session = Depends(get_db)):
    db_moth = models.Moth(
        common_name=moth.common_name,
        scientific_name=moth.scientific_name,
        family_name=moth.family_name,
        image_url=moth.image_url,
        description=moth.description,
        damage_caused=moth.damage_caused,
        link=moth.link
    )
    db.add(db_moth)
    db.commit()
    db.refresh(db_moth)
    
    for dist in moth.distributions:
        db_dist = models.Distribution(
            moth_id=db_moth.id,
            moth_name=dist.moth_name,
            description=dist.description,
            distribution_file_url=dist.distribution_file_url
        )
        db.add(db_dist)
    db.commit()
    db.refresh(db_moth)
    return db_moth

import os
from fastapi.staticfiles import StaticFiles

frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
