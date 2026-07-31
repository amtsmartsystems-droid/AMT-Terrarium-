from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    pin = Column(String)  # PIN code for company login
    
    stickers = relationship("Sticker", back_populates="company")

class BasePlant(Base):
    __tablename__ = "base_plants"
    id = Column(Integer, primary_key=True, index=True)
    plant_name = Column(String)
    plant_name_en = Column(String)
    tagline = Column(String)
    tagline_en = Column(String)
    primary_color = Column(String)
    bg_color = Column(String)
    
    care_instructions = relationship("CareInstruction", back_populates="base_plant")

class CareInstruction(Base):
    __tablename__ = "care_instructions"
    id = Column(Integer, primary_key=True, index=True)
    base_plant_id = Column(Integer, ForeignKey("base_plants.id"))
    icon = Column(String)
    title = Column(String)
    title_en = Column(String)
    detail = Column(String)
    detail_en = Column(String)
    
    base_plant = relationship("BasePlant", back_populates="care_instructions")

class GiftContent(Base):
    __tablename__ = "gift_contents"
    id = Column(Integer, primary_key=True, index=True)
    owner_name = Column(String)
    owner_name_en = Column(String)
    owner_birthday = Column(String)
    profile_image = Column(String)
    
    is_message_opened = Column(Boolean, default=False)
    hidden_video_url = Column(String)
    gift_message = Column(String)
    gift_message_en = Column(String)
    
    # Customization features
    pet_name = Column(String, nullable=True)
    custom_theme_color = Column(String, nullable=True)

class Sticker(Base):
    __tablename__ = "stickers"
    cryptic_code = Column(String, primary_key=True, index=True) # e.g., X9A2K
    serial_number = Column(Integer, unique=True, index=True) # e.g., 1 to 500
    is_active = Column(Boolean, default=False)
    activation_date = Column(String, nullable=True) # Format: YYYY-MM-DD
    scan_count = Column(Integer, default=0) # Analytics feature
    
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    base_plant_id = Column(Integer, ForeignKey("base_plants.id"), nullable=True)
    gift_content_id = Column(Integer, ForeignKey("gift_contents.id"), nullable=True)
    
    company = relationship("Company", back_populates="stickers")
    base_plant = relationship("BasePlant")
    gift_content = relationship("GiftContent")
    diaries = relationship("PlantDiary", back_populates="sticker")

class PlantDiary(Base):
    __tablename__ = "plant_diaries"
    id = Column(Integer, primary_key=True, index=True)
    sticker_id = Column(String, ForeignKey("stickers.cryptic_code"))
    image_url = Column(String)
    date_added = Column(String) # Format: YYYY-MM-DD
    note = Column(String, nullable=True)
    
    sticker = relationship("Sticker", back_populates="diaries")
