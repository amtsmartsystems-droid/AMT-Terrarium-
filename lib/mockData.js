// lib/mockData.js
export const MOCK_PLANT = {
  plant_id: "TRM-102",
  plant_name: "غابة الاستوائية",
  plant_name_en: "Equatorial Forest",
  tagline: "نضع سحر الطبيعة بين يديك",
  tagline_en: "We bring nature's magic to your hands",
  creation_date: "2026-01-15",
  owner_name: "أحمد",
  owner_name_en: "Ahmad",
  owner_birthday: "07-30",
  profile_image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  primary_color: "#4ADE80",
  bg_color: "#071A0F",
  care_instructions: [
    {
      id: 1,
      icon: "💧",
      title: "الري",
      title_en: "Watering",
      detail: "رشّ جدران الزجاج من الداخل كل أسبوعين تقريباً. لا تُفرط في الري — التربة يجب أن تبقى رطبة وليس مُشبعة بالماء.",
      detail_en: "Mist the inner glass walls every 2 weeks. Do not overwater — soil should stay moist, not saturated.",
    },
    {
      id: 2,
      icon: "☀️",
      title: "الإضاءة",
      title_en: "Light",
      detail: "ضع التراريوم في مكان يصله ضوء طبيعي غير مباشر. تجنّب أشعة الشمس المباشرة التي قد تُحترق بها النباتات.",
      detail_en: "Place in a spot with bright indirect light. Avoid direct sunlight which can scorch the plants.",
    },
    {
      id: 3,
      icon: "🌡️",
      title: "درجة الحرارة",
      title_en: "Temperature",
      detail: "تعمل النباتات بشكل مثالي بين 18 و 24 درجة مئوية. تجنّب الأماكن شديدة البرودة أو القريبة من مصادر الحرارة.",
      detail_en: "Plants thrive between 18-24°C. Avoid cold drafts or placing near heat sources.",
    },
    {
      id: 4,
      icon: "✂️",
      title: "التقليم",
      title_en: "Pruning",
      detail: "قلّم أي ورقة صفراء أو جافة بمقص نظيف للحفاظ على الشكل الجمالي وصحة التراريوم.",
      detail_en: "Trim any yellow or dry leaves with clean scissors to maintain aesthetics and plant health.",
    },
  ],
  hidden_gift: {
    is_message_opened: false,
    hidden_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    gift_message: "هدية خاصة بمناسبة عيد ميلادك 🎁",
    gift_message_en: "A special gift for your birthday 🎁",
  },
};

export async function fetchPlant(plant_id) {
  await new Promise(r => setTimeout(r, 0));
  if (plant_id === MOCK_PLANT.plant_id || plant_id === "SMARTTERRARIUM") {
    return MOCK_PLANT;
  }
  return null;
}
