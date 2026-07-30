from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import datetime
import models, database

app = FastAPI(title="AMT Terrarium API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://amt-terrarium.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

ADMIN_PIN = "7070"  # Simple PIN for Nabatarium Portal

# --- Public Endpoints (Customer Facing) ---

@app.get("/plants/{cryptic_code}")
def get_plant(cryptic_code: str, db: Session = Depends(database.get_db)):
    sticker = db.query(models.Sticker).filter(models.Sticker.cryptic_code == cryptic_code, models.Sticker.is_active == True).first()
    if not sticker or not sticker.base_plant or not sticker.gift_content:
        raise HTTPException(status_code=404, detail="Plant not found")
        
    return {
        "plant_id": sticker.cryptic_code,
        "plant_name": sticker.base_plant.plant_name,
        "plant_name_en": sticker.base_plant.plant_name_en,
        "tagline": sticker.base_plant.tagline,
        "tagline_en": sticker.base_plant.tagline_en,
        "creation_date": sticker.activation_date,
        "owner_name": sticker.gift_content.owner_name,
        "owner_name_en": sticker.gift_content.owner_name_en,
        "owner_birthday": sticker.gift_content.owner_birthday,
        "profile_image": sticker.gift_content.profile_image,
        "primary_color": sticker.base_plant.primary_color,
        "bg_color": sticker.base_plant.bg_color,
        "care_instructions": [
            {
                "id": care.id,
                "icon": care.icon,
                "title": care.title,
                "title_en": care.title_en,
                "detail": care.detail,
                "detail_en": care.detail_en
            } for care in sticker.base_plant.care_instructions
        ],
        "hidden_gift": {
            "is_message_opened": sticker.gift_content.is_message_opened,
            "hidden_video_url": sticker.gift_content.hidden_video_url,
            "gift_message": sticker.gift_content.gift_message,
            "gift_message_en": sticker.gift_content.gift_message_en
        }
    }

@app.post("/plants/{cryptic_code}/gift/open")
def open_gift(cryptic_code: str, db: Session = Depends(database.get_db)):
    sticker = db.query(models.Sticker).filter(models.Sticker.cryptic_code == cryptic_code).first()
    if not sticker or not sticker.gift_content:
        raise HTTPException(status_code=404, detail="Plant not found")
    sticker.gift_content.is_message_opened = True
    db.commit()
    return {"status": "success"}

# --- Admin Endpoints (Nabatarium Portal) ---

class GiftContentCreate(BaseModel):
    owner_name: str
    owner_name_en: str
    owner_birthday: Optional[str] = None
    profile_image: Optional[str] = None
    hidden_video_url: str
    gift_message: str
    gift_message_en: str
    base_plant_id: int

class SingleActivation(BaseModel):
    serial_number: int
    content: GiftContentCreate

class BatchActivation(BaseModel):
    start_serial: int
    end_serial: int
    content: GiftContentCreate

def verify_admin(x_pin: str = Header(...)):
    if x_pin != ADMIN_PIN:
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.post("/admin/activate/single")
def activate_single(data: SingleActivation, db: Session = Depends(database.get_db), x_pin: str = Header(...)):
    verify_admin(x_pin)
    
    sticker = db.query(models.Sticker).filter(models.Sticker.serial_number == data.serial_number).first()
    if not sticker:
        raise HTTPException(status_code=404, detail=f"Sticker {data.serial_number} not found")
        
    gift = models.GiftContent(**data.content.dict())
    db.add(gift)
    db.commit()
    db.refresh(gift)
    
    sticker.is_active = True
    sticker.activation_date = datetime.date.today().strftime("%Y-%m-%d")
    sticker.base_plant_id = data.content.base_plant_id
    sticker.gift_content_id = gift.id
    db.commit()
    
    return {"status": "success", "cryptic_code": sticker.cryptic_code, "serial_number": sticker.serial_number}

@app.post("/admin/activate/batch")
def activate_batch(data: BatchActivation, db: Session = Depends(database.get_db), x_pin: str = Header(...)):
    verify_admin(x_pin)
    
    if data.start_serial > data.end_serial:
        raise HTTPException(status_code=400, detail="Start serial must be <= end serial")
        
    stickers = db.query(models.Sticker).filter(
        models.Sticker.serial_number >= data.start_serial,
        models.Sticker.serial_number <= data.end_serial
    ).all()
    
    if not stickers:
        raise HTTPException(status_code=404, detail="No stickers found in this range")
        
    # Create one shared gift content
    gift = models.GiftContent(**data.content.dict())
    db.add(gift)
    db.commit()
    db.refresh(gift)
    
    activated_count = 0
    today = datetime.date.today().strftime("%Y-%m-%d")
    for sticker in stickers:
        sticker.is_active = True
        sticker.activation_date = today
        sticker.base_plant_id = data.content.base_plant_id
        sticker.gift_content_id = gift.id
        activated_count += 1
        
    db.commit()
    
    return {"status": "success", "activated_count": activated_count}

@app.get("/admin/base-plants")
def get_base_plants(db: Session = Depends(database.get_db), x_pin: str = Header(...)):
    verify_admin(x_pin)
    plants = db.query(models.BasePlant).all()
    return [{"id": p.id, "plant_name": p.plant_name, "plant_name_en": p.plant_name_en} for p in plants]
