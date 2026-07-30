from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database

app = FastAPI(title="AMT Terrarium API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

@app.get("/plants/{plant_id}")
def get_plant(plant_id: str, db: Session = Depends(database.get_db)):
    plant = db.query(models.Plant).filter(models.Plant.plant_id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    return {
        "plant_id": plant.plant_id,
        "plant_name": plant.plant_name,
        "plant_name_en": plant.plant_name_en,
        "tagline": plant.tagline,
        "tagline_en": plant.tagline_en,
        "creation_date": plant.creation_date,
        "owner_name": plant.owner_name,
        "owner_name_en": plant.owner_name_en,
        "owner_birthday": plant.owner_birthday,
        "profile_image": plant.profile_image,
        "primary_color": plant.primary_color,
        "bg_color": plant.bg_color,
        "care_instructions": [
            {
                "id": care.id,
                "icon": care.icon,
                "title": care.title,
                "title_en": care.title_en,
                "detail": care.detail,
                "detail_en": care.detail_en
            } for care in plant.care_instructions
        ],
        "hidden_gift": {
            "is_message_opened": plant.is_message_opened,
            "hidden_video_url": plant.hidden_video_url,
            "gift_message": plant.gift_message,
            "gift_message_en": plant.gift_message_en
        }
    }

@app.post("/plants/{plant_id}/gift/open")
def open_gift(plant_id: str, db: Session = Depends(database.get_db)):
    plant = db.query(models.Plant).filter(models.Plant.plant_id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    plant.is_message_opened = True
    db.commit()
    return {"status": "success"}
