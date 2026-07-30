import sys
import os
import random
import string
import datetime

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models

# Ensure tables are created
models.Base.metadata.drop_all(bind=engine) # Drop to recreate schema for this new architecture
models.Base.metadata.create_all(bind=engine)

def generate_cryptic_code(length=5):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def seed_db():
    db = SessionLocal()
    
    # 1. Create Base Plant (Equatorial Forest)
    base_plant = models.BasePlant(
        plant_name="غابة الاستوائية",
        plant_name_en="Equatorial Forest",
        tagline="نضع سحر الطبيعة بين يديك",
        tagline_en="We bring nature's magic to your hands",
        primary_color="#4ADE80",
        bg_color="#071A0F"
    )
    
    care_instructions = [
        models.CareInstruction(
            icon="💧",
            title="الري",
            title_en="Watering",
            detail="رشّ جدران الزجاج من الداخل كل أسبوعين تقريباً. لا تُفرط في الري — التربة يجب أن تبقى رطبة وليس مُشبعة بالماء.",
            detail_en="Mist the inner glass walls every 2 weeks. Do not overwater — soil should stay moist, not saturated."
        ),
        models.CareInstruction(
            icon="☀️",
            title="الإضاءة",
            title_en="Light",
            detail="ضع التراريوم في مكان يصله ضوء طبيعي غير مباشر. تجنّب أشعة الشمس المباشرة التي قد تُحترق بها النباتات.",
            detail_en="Place in a spot with bright indirect light. Avoid direct sunlight which can scorch the plants."
        ),
        models.CareInstruction(
            icon="🌡️",
            title="درجة الحرارة",
            title_en="Temperature",
            detail="تعمل النباتات بشكل مثالي بين 18 و 24 درجة مئوية. تجنّب الأماكن شديدة البرودة أو القريبة من مصادر الحرارة.",
            detail_en="Plants thrive between 18-24°C. Avoid cold drafts or placing near heat sources."
        ),
        models.CareInstruction(
            icon="✂️",
            title="التقليم",
            title_en="Pruning",
            detail="قلّم أي ورقة صفراء أو جافة بمقص نظيف للحفاظ على الشكل الجمالي وصحة التراريوم.",
            detail_en="Trim any yellow or dry leaves with clean scissors to maintain aesthetics and plant health."
        )
    ]
    
    base_plant.care_instructions.extend(care_instructions)
    db.add(base_plant)
    db.commit()
    db.refresh(base_plant)
    
    # 2. Pre-generate 500 stickers
    existing_stickers = db.query(models.Sticker).count()
    if existing_stickers == 0:
        stickers_to_add = []
        for i in range(1, 501):
            # Ensure unique cryptic code
            code = generate_cryptic_code()
            while db.query(models.Sticker).filter(models.Sticker.cryptic_code == code).first() is not None:
                code = generate_cryptic_code()
            
            sticker = models.Sticker(
                cryptic_code=code,
                serial_number=i,
                is_active=False
            )
            stickers_to_add.append(sticker)
            
        db.add_all(stickers_to_add)
        db.commit()
        print("Generated 500 inactive stickers.")
    
    # 3. Simulate activation for sticker #12 (TRM-102 equivalent) for testing purposes
    # Since the old frontend expects the URL /plants/TRM-102, let's hardcode sticker 1 to TRM-102 for backward compatibility during testing
    # Or actually, we should just update the frontend to use the cryptic code.
    # We will set cryptic_code "TRM-102" to sticker #1 so the frontend works immediately!
    sticker_1 = db.query(models.Sticker).filter(models.Sticker.serial_number == 1).first()
    if sticker_1:
        sticker_1.cryptic_code = "TRM-102"
        sticker_1.is_active = True
        sticker_1.activation_date = "2026-01-15"
        sticker_1.base_plant_id = base_plant.id
        
        gift = models.GiftContent(
            owner_name="أحمد",
            owner_name_en="Ahmad",
            owner_birthday="07-30",
            profile_image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
            is_message_opened=False,
            hidden_video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            gift_message="هدية خاصة بمناسبة عيد ميلادك 🎁",
            gift_message_en="A special gift for your birthday 🎁"
        )
        db.add(gift)
        db.commit()
        db.refresh(gift)
        
        sticker_1.gift_content_id = gift.id
        db.commit()
        
    db.close()
    print("Successfully seeded Base Plant and 500 stickers!")

if __name__ == "__main__":
    seed_db()
