"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hexToRgbStr, isBirthdayToday } from "@/lib/utils";
import { openHiddenGift, trackScan, customizePlant } from "@/lib/api";
import BirthdayModal from "@/components/BirthdayModal";
import PlantBio from "@/components/PlantBio";
import CareAccordion from "@/components/CareAccordion";
import HiddenGift from "@/components/HiddenGift";
import CustomizationModal from "@/components/CustomizationModal";
import PlantDiary from "@/components/PlantDiary";
import { Settings, CalendarPlus, Heart } from "lucide-react";

export default function TerrariumViewer({ plant: initialPlant }) {
  const [lang, setLang] = useState("ar");
  const [plant, setPlant] = useState(initialPlant);
  const [giftOpened, setGiftOpened] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScanThanks, setShowScanThanks] = useState(false);
  
  const isAr = lang === "ar";
  const isBirthday = isBirthdayToday(plant.owner_birthday);

  const handleOpenGift = async () => {
    setGiftOpened(true);
    await openHiddenGift(plant.plant_id);
  };

  // Track scan and handle Analytics Feature
  useEffect(() => {
    const registerScan = async () => {
      const data = await trackScan(plant.plant_id);
      if (data && data.scan_count) {
        setPlant(prev => ({ ...prev, scan_count: data.scan_count }));
        // Show sweet popup exactly at 50 scans (or 100, 150)
        if (data.scan_count % 50 === 0) {
          setShowScanThanks(true);
          setTimeout(() => setShowScanThanks(false), 5000);
        }
      }
    };
    registerScan();
  }, [plant.plant_id]);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--primary-color", plant.primary_color || "#4ADE80");
    root.setProperty("--primary-rgb", hexToRgbStr(plant.primary_color || "#4ADE80"));
    root.setProperty("--bg-color", plant.custom_theme_color || plant.bg_color || "#071A0F");
  }, [plant]);

  const handleSaveCustomization = async (data) => {
    const success = await customizePlant(plant.plant_id, data);
    if (success) {
      setPlant(prev => ({ ...prev, ...data }));
    }
  };

  const handleDownloadCalendar = () => {
    // Generate a simple ICS file for bi-weekly watering
    const event = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AMT//Terrarium Reminder//EN
BEGIN:VEVENT
SUMMARY:${isAr ? "ري نبتتي (التراريوم)" : "Water my Terrarium"}
DESCRIPTION:${isAr ? "وقت رش جدران الزجاج من الداخل!" : "Time to mist the inner glass walls!"}
RRULE:FREQ=WEEKLY;INTERVAL=2
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'terrarium-watering.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="min-h-[100dvh] text-white relative overflow-x-hidden no-scrollbar"
      style={{ background: "var(--bg-color, #071A0F)", transition: "background 0.5s ease" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ══ LAYERED BACKGROUND ══ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img src={plant.profile_image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.06, filter: "blur(60px) saturate(1.5)" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2" style={{ width: 700, height: 700, background: "radial-gradient(ellipse at center, rgba(var(--primary-rgb),0.14) 0%, transparent 65%)" }} />
      </div>

      {/* ══ HEADER ACTIONS ══ */}
      <div className={`absolute top-5 ${isAr ? "left-5" : "right-5"} z-50 flex gap-2`}>
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}
        >
          <Settings className="w-5 h-5 text-white/80" />
        </button>
        {/* Lang Toggle */}
        <button
          onClick={() => setLang(l => (l === "ar" ? "en" : "ar"))}
          className="w-10 h-10 rounded-xl text-[12px] font-black tracking-widest transition-all duration-300 flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", color: "rgba(var(--primary-rgb),0.9)" }}
        >
          {lang === "ar" ? "EN" : "ع"}
        </button>
      </div>

      {/* ══ MODALS ══ */}
      {isBirthday && <BirthdayModal plant={plant} lang={lang} giftOpened={giftOpened} onOpenGift={handleOpenGift} />}
      <CustomizationModal isOpen={showSettings} onClose={() => setShowSettings(false)} plant={plant} onSave={handleSaveCustomization} isAr={isAr} />

      {/* ══ SCAN THANKS POPUP ══ */}
      <AnimatePresence>
        {showScanThanks && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-full shadow-2xl flex items-center gap-3"
          >
            <Heart className="w-6 h-6 text-red-400 fill-current" />
            <p className="font-bold text-white text-sm whitespace-nowrap">
              {isAr ? `شكراً لاهتمامك الدائم بي! لقد تفقدتني ${plant.scan_count} مرة حتى الآن 💚` : `Thanks for caring! You've checked on me ${plant.scan_count} times 💚`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MAIN CONTENT ══ */}
      <div className="relative z-10 pb-20">

        {/* ── HEADER ── */}
        <div className="flex flex-col items-center pt-20 pb-8 px-5">
          <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative mb-7">
            <div className="w-32 h-32 rounded-full overflow-hidden" style={{ border: "2.5px solid rgba(var(--primary-rgb),0.5)", boxShadow: "0 0 50px rgba(var(--primary-rgb),0.3)" }}>
              <img src={plant.profile_image} alt={plant.plant_name} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[34px] font-black tracking-wide text-center mb-1" style={{ fontFamily: "Cairo, sans-serif" }}>
            {plant.pet_name || (isAr ? plant.plant_name : plant.plant_name_en)}
          </motion.h1>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-white/40 text-sm font-medium mb-4 flex gap-2">
            <span>{isAr ? "نوعها:" : "Type:"} {isAr ? plant.plant_name : plant.plant_name_en}</span>
            <span>•</span>
            <span>{isAr ? "الزيارات:" : "Scans:"} {plant.scan_count}</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="px-5 py-2 rounded-full text-[13px] font-semibold mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(var(--primary-rgb),0.25)", color: "rgba(var(--primary-rgb),0.85)", backdropFilter: "blur(20px)" }}>
            {isAr ? plant.tagline : plant.tagline_en}
          </motion.div>

          {/* ADD TO CALENDAR BUTTON */}
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            onClick={handleDownloadCalendar}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 px-6 py-3 rounded-2xl text-green-300 font-bold text-sm transition-all"
          >
            <CalendarPlus className="w-5 h-5" />
            {isAr ? "أضف جدول الري لهاتفي" : "Add Watering to Calendar"}
          </motion.button>
        </div>

        {/* Divider */}
        <div className="mx-10 mb-8" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.35), transparent)" }} />

        {/* ── BLOCKS ── */}
        <PlantBio plant={plant} lang={lang} />
        <CareAccordion instructions={plant.care_instructions} lang={lang} />
        <HiddenGift gift={plant.hidden_gift} lang={lang} externalOpen={giftOpened} onOpen={() => handleOpenGift()} />
        
        {/* Divider */}
        <div className="mx-10 my-8" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.35), transparent)" }} />

        {/* ── PLANT DIARY (TIMELINE) ── */}
        <PlantDiary plantId={plant.plant_id} diaries={plant.diaries} isAr={isAr} />

        {/* ── WATERMARK ── */}
        <div className="text-center pt-10">
          <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "Cairo, sans-serif" }}>
            Powered by AMT Smart Systems
          </p>
        </div>
      </div>
    </div>
  );
}
