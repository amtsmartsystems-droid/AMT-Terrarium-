from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
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

SUPER_ADMIN_PIN = "7070"  # Master PIN

# --- Pydantic Models ---

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

class CompanyCreate(BaseModel):
    name: str
    pin: str

class AllocateStickers(BaseModel):
    company_id: int
    start_serial: int
    end_serial: int

class CustomizePlant(BaseModel):
    pet_name: Optional[str]
    custom_theme_color: Optional[str]

import os
import uuid
from fastapi import File, UploadFile, Form
from supabase import create_client, Client

# Initialize Supabase client for storage
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
supabase_client: Optional[Client] = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")

@app.post("/plants/{cryptic_code}/diary")
async def add_diary(
    cryptic_code: str, 
    note: str = Form(""), 
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db)
):
    sticker = db.query(models.Sticker).filter(models.Sticker.cryptic_code == cryptic_code).first()
    if not sticker:
        raise HTTPException(status_code=404, detail="Plant not found")
        
    image_url = ""
    if supabase_client:
        try:
            file_ext = file.filename.split(".")[-1]
            file_name = f"{cryptic_code}_{uuid.uuid4()}.{file_ext}"
            file_bytes = await file.read()
            
            # Upload to 'plant-diaries' bucket
            res = supabase_client.storage.from_("plant-diaries").upload(file_name, file_bytes)
            
            # Get public URL
            public_url = supabase_client.storage.from_("plant-diaries").get_public_url(file_name)
            image_url = public_url
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
    else:
        # Fallback if supabase is not configured
        image_url = "https://via.placeholder.com/400?text=No+Storage+Configured"
    
    diary = models.PlantDiary(
        sticker_id=cryptic_code,
        image_url=image_url,
        note=note,
        date_added=datetime.date.today().strftime("%Y-%m-%d")
    )
    db.add(diary)
    db.commit()
    db.refresh(diary)
    return {"status": "success", "diary_id": diary.id, "image_url": image_url}

# --- Auth Dependency ---
def verify_role(x_pin: str = Header(...), db: Session = Depends(database.get_db)):
    if x_pin == SUPER_ADMIN_PIN:
        return {"role": "SUPER_ADMIN", "company_id": None}
    
    company = db.query(models.Company).filter(models.Company.pin == x_pin).first()
    if company:
        return {"role": "COMPANY", "company_id": company.id}
        
    raise HTTPException(status_code=401, detail="Unauthorized")

# --- Public Endpoints (Customer Facing) ---

@app.get("/plants/{cryptic_code}")
def get_plant(cryptic_code: str, db: Session = Depends(database.get_db)):
    sticker = db.query(models.Sticker).filter(models.Sticker.cryptic_code == cryptic_code, models.Sticker.is_active == True).first()
    if not sticker or not sticker.base_plant or not sticker.gift_content:
        raise HTTPException(status_code=404, detail="Plant not found")
        
    diaries = db.query(models.PlantDiary).filter(models.PlantDiary.sticker_id == cryptic_code).all()
        
    return {
        "plant_id": sticker.cryptic_code,
        "plant_name": sticker.base_plant.plant_name,
        "plant_name_en": sticker.base_plant.plant_name_en,
        "tagline": sticker.base_plant.tagline,
        "tagline_en": sticker.base_plant.tagline_en,
        "creation_date": sticker.activation_date,
        "scan_count": sticker.scan_count,
        "owner_name": sticker.gift_content.owner_name,
        "owner_name_en": sticker.gift_content.owner_name_en,
        "owner_birthday": sticker.gift_content.owner_birthday,
        "profile_image": sticker.gift_content.profile_image,
        "primary_color": sticker.base_plant.primary_color,
        "bg_color": sticker.base_plant.bg_color,
        "pet_name": sticker.gift_content.pet_name,
        "custom_theme_color": sticker.gift_content.custom_theme_color,
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
        },
        "diaries": [
            {
                "id": d.id,
                "date_added": d.date_added,
                "image_url": d.image_url,
                "note": d.note
            } for d in diaries
        ]
    }

@app.post("/plants/{cryptic_code}/scan")
def track_scan(cryptic_code: str, db: Session = Depends(database.get_db)):
    sticker = db.query(models.Sticker).filter(models.Sticker.cryptic_code == cryptic_code).first()
    if not sticker:
        raise HTTPException(status_code=404, detail="Plant not found")
    sticker.scan_count += 1
    db.commit()
    return {"scan_count": sticker.scan_count}

@app.post("/plants/{cryptic_code}/gift/open")
def open_gift(cryptic_code: str, db: Session = Depends(database.get_db)):
    sticker = db.query(models.Sticker).filter(models.Sticker.cryptic_code == cryptic_code).first()
    if not sticker or not sticker.gift_content:
        raise HTTPException(status_code=404, detail="Plant not found")
    sticker.gift_content.is_message_opened = True
    db.commit()
    return {"status": "success"}

@app.put("/plants/{cryptic_code}/customize")
def customize_plant(cryptic_code: str, data: CustomizePlant, db: Session = Depends(database.get_db)):
    sticker = db.query(models.Sticker).filter(models.Sticker.cryptic_code == cryptic_code).first()
    if not sticker or not sticker.gift_content:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    if data.pet_name is not None:
        sticker.gift_content.pet_name = data.pet_name
    if data.custom_theme_color is not None:
        sticker.gift_content.custom_theme_color = data.custom_theme_color
        
    db.commit()
    return {"status": "success"}



# --- Super Admin & Company Endpoints (Nabatarium Portal) ---

@app.get("/admin/me")
def get_me(user: dict = Depends(verify_role), db: Session = Depends(database.get_db)):
    if user["role"] == "SUPER_ADMIN":
        return {"role": "SUPER_ADMIN", "name": "AMT Master Admin"}
    else:
        company = db.query(models.Company).filter(models.Company.id == user["company_id"]).first()
        return {"role": "COMPANY", "name": company.name, "company_id": company.id}

@app.post("/admin/companies")
def create_company(data: CompanyCreate, user: dict = Depends(verify_role), db: Session = Depends(database.get_db)):
    if user["role"] != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Super Admin only")
    
    if db.query(models.Company).filter(models.Company.pin == data.pin).first():
        raise HTTPException(status_code=400, detail="PIN already in use")
        
    company = models.Company(name=data.name, pin=data.pin)
    db.add(company)
    db.commit()
    db.refresh(company)
    return {"status": "success", "company_id": company.id}

@app.post("/admin/allocate")
def allocate_stickers(data: AllocateStickers, user: dict = Depends(verify_role), db: Session = Depends(database.get_db)):
    if user["role"] != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Super Admin only")
        
    stickers = db.query(models.Sticker).filter(
        models.Sticker.serial_number >= data.start_serial,
        models.Sticker.serial_number <= data.end_serial
    ).all()
    
    count = 0
    for s in stickers:
        s.company_id = data.company_id
        count += 1
    db.commit()
    return {"status": "success", "allocated": count}

@app.post("/admin/activate/single")
def activate_single(data: SingleActivation, user: dict = Depends(verify_role), db: Session = Depends(database.get_db)):
    sticker = db.query(models.Sticker).filter(models.Sticker.serial_number == data.serial_number).first()
    if not sticker:
        raise HTTPException(status_code=404, detail=f"Sticker {data.serial_number} not found")
        
    # Check permissions
    if user["role"] == "COMPANY" and sticker.company_id != user["company_id"]:
        raise HTTPException(status_code=403, detail="Sticker does not belong to your company")
        
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
def activate_batch(data: BatchActivation, user: dict = Depends(verify_role), db: Session = Depends(database.get_db)):
    if data.start_serial > data.end_serial:
        raise HTTPException(status_code=400, detail="Start serial must be <= end serial")
        
    stickers = db.query(models.Sticker).filter(
        models.Sticker.serial_number >= data.start_serial,
        models.Sticker.serial_number <= data.end_serial
    ).all()
    
    if not stickers:
        raise HTTPException(status_code=404, detail="No stickers found in this range")
        
    # Check permissions for all stickers
    if user["role"] == "COMPANY":
        for s in stickers:
            if s.company_id != user["company_id"]:
                raise HTTPException(status_code=403, detail=f"Sticker {s.serial_number} does not belong to your company")
        
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
def get_base_plants(user: dict = Depends(verify_role), db: Session = Depends(database.get_db)):
    plants = db.query(models.BasePlant).all()
    return [{"id": p.id, "plant_name": p.plant_name, "plant_name_en": p.plant_name_en} for p in plants]
