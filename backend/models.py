from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Plant(Base):
    __tablename__ = "plants"
    plant_id = Column(String, primary_key=True, index=True)
    plant_name = Column(String)
    plant_name_en = Column(String)
    tagline = Column(String)
    tagline_en = Column(String)
    creation_date = Column(String)
    owner_name = Column(String)
    owner_name_en = Column(String)
    owner_birthday = Column(String)
    profile_image = Column(String)
    primary_color = Column(String)
    bg_color = Column(String)
    
    is_message_opened = Column(Boolean, default=False)
    hidden_video_url = Column(String)
    gift_message = Column(String)
    gift_message_en = Column(String)
    
    care_instructions = relationship("CareInstruction", back_populates="plant")

class CareInstruction(Base):
    __tablename__ = "care_instructions"
    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(String, ForeignKey("plants.plant_id"))
    icon = Column(String)
    title = Column(String)
    title_en = Column(String)
    detail = Column(String)
    detail_en = Column(String)
    
    plant = relationship("Plant", back_populates="care_instructions")
