import sys
import os
import random
import string

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models

def generate_cryptic_code(length=5):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def seed_db():
    print("Dropping old tables...")
    models.Base.metadata.drop_all(bind=engine)
    
    print("Creating new tables...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Create a Default Company (for testing B2B functionality)
    default_company = models.Company(
        name="AMT HQ",
        pin="1234" # Default company pin
    )
    db.add(default_company)
    db.commit()
    db.refresh(default_company)
    print("Created default company (AMT HQ).")
    
    # 2. Create Base Plant
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
    print("Created Base Plant (Equatorial Forest).")
    
    # 3. Generate 500 stickers
    stickers_to_add = []
    for i in range(1, 501):
        code = generate_cryptic_code()
        # Note: In a loop of 500, collisions on a 5-char code are extremely rare, but we handle it just in case.
        while db.query(models.Sticker).filter(models.Sticker.cryptic_code == code).first() is not None or any(s.cryptic_code == code for s in stickers_to_add):
            code = generate_cryptic_code()
        
        # Assign first 50 stickers to the default company
        comp_id = default_company.id if i <= 50 else None
        
        sticker = models.Sticker(
            cryptic_code=code,
            serial_number=i,
            is_active=False,
            company_id=comp_id
        )
        stickers_to_add.append(sticker)
        
    db.add_all(stickers_to_add)
    db.commit()
    print("Generated 500 stickers (First 50 assigned to AMT HQ).")
    
    # 4. Activate sticker #1 for testing (TRM-102)
    sticker_1 = db.query(models.Sticker).filter(models.Sticker.serial_number == 1).first()
    if sticker_1:
        sticker_1.cryptic_code = "TRM-102"
        sticker_1.is_active = True
        sticker_1.activation_date = "2026-01-15"
        sticker_1.base_plant_id = base_plant.id
        sticker_1.scan_count = 12
        
        gift = models.GiftContent(
            owner_name="أحمد",
            owner_name_en="Ahmad",
            owner_birthday="07-30",
            profile_image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
            is_message_opened=False,
            hidden_video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            gift_message="هدية خاصة بمناسبة عيد ميلادك 🎁",
            gift_message_en="A special gift for your birthday 🎁",
            pet_name="نبتة السعادة",
            custom_theme_color="#000000"
        )
        db.add(gift)
        db.commit()
        db.refresh(gift)
        
        sticker_1.gift_content_id = gift.id
        db.commit()
        print("Activated Sticker 1 (TRM-102) for testing.")
        
    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_db()
