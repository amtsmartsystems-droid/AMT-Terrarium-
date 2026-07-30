"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hexToRgbStr, isBirthdayToday } from "@/lib/utils";
import { openHiddenGift } from "@/lib/api";
import BirthdayModal from "@/components/BirthdayModal";
import PlantBio from "@/components/PlantBio";
import CareAccordion from "@/components/CareAccordion";
import HiddenGift from "@/components/HiddenGift";

export default function TerrariumViewer({ plant }) {
  const [lang, setLang] = useState("ar");
  const [giftOpened, setGiftOpened] = useState(false);
  const isAr = lang === "ar";
  const isBirthday = isBirthdayToday(plant.owner_birthday);

  const handleOpenGift = async () => {
    setGiftOpened(true);
    await openHiddenGift(plant.plant_id);
  };

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--primary-color", plant.primary_color || "#4ADE80");
    root.setProperty("--primary-rgb", hexToRgbStr(plant.primary_color || "#4ADE80"));
    root.setProperty("--bg-color", plant.bg_color || "#071A0F");
  }, [plant]);

  return (
    <div
      className="min-h-[100dvh] text-white relative overflow-x-hidden no-scrollbar"
      style={{ background: "var(--bg-color, #071A0F)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ══ LAYERED BACKGROUND ══ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Blurred ambient image */}
        <img
          src={plant.profile_image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.06, filter: "blur(60px) saturate(1.5)" }}
        />
        {/* Deep dark gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(4,14,8,0.92) 0%, rgba(7,26,15,0.96) 35%, #071A0F 100%)",
          }}
        />
        {/* Primary radial glow — top center */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2"
          style={{
            width: 700,
            height: 700,
            background:
              "radial-gradient(ellipse at center, rgba(var(--primary-rgb),0.14) 0%, transparent 65%)",
          }}
        />
        {/* Secondary soft glow — bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 500,
            height: 400,
            background:
              "radial-gradient(ellipse at center, rgba(var(--primary-rgb),0.06) 0%, transparent 70%)",
          }}
        />
        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "180px",
          }}
        />
      </div>

      {/* ══ LANG TOGGLE ══ */}
      <div className={`absolute top-5 ${isAr ? "left-5" : "right-5"} z-50`}>
        <button
          onClick={() => setLang(l => (l === "ar" ? "en" : "ar"))}
          className="px-3.5 py-1.5 rounded-xl text-[11px] font-black tracking-widest transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "rgba(var(--primary-rgb),0.9)",
            fontFamily: "Cairo, sans-serif",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {lang === "ar" ? "EN" : "ع"}
        </button>
      </div>

      {/* ══ BIRTHDAY MODAL ══ */}
      {isBirthday && (
        <BirthdayModal
          plant={plant}
          lang={lang}
          giftOpened={giftOpened}
          onOpenGift={handleOpenGift}
        />
      )}

      {/* ══ MAIN CONTENT ══ */}
      <div className="relative z-10 pb-20">

        {/* ── HEADER ── */}
        <div className="flex flex-col items-center pt-14 pb-8 px-5">

          {/* Avatar with pulse rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-7"
          >
            {[1, 2, 3].map(ring => (
              <motion.div
                key={ring}
                className="absolute rounded-full"
                style={{
                  inset: -(ring * 12),
                  border: "1px solid rgba(var(--primary-rgb),0.2)",
                }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 3,
                  delay: ring * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            <div
              className="w-32 h-32 rounded-full overflow-hidden"
              style={{
                border: "2.5px solid rgba(var(--primary-rgb),0.5)",
                boxShadow: "0 0 50px rgba(var(--primary-rgb),0.3), 0 0 0 6px rgba(var(--primary-rgb),0.06)",
              }}
            >
              <img
                src={plant.profile_image}
                alt={plant.plant_name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Plant Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[34px] font-black tracking-wide uppercase text-center mb-3"
            style={{ fontFamily: "Cairo, sans-serif", letterSpacing: "0.06em" }}
          >
            {isAr ? plant.plant_name : plant.plant_name_en}
          </motion.h1>

          {/* Tagline pill — glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="px-5 py-2 rounded-full text-[13px] font-semibold"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(var(--primary-rgb),0.25)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              color: "rgba(var(--primary-rgb),0.85)",
              fontFamily: "Cairo, sans-serif",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {isAr ? plant.tagline : plant.tagline_en}
          </motion.div>

          {/* Birthday Badge */}
          {isBirthday && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="mt-4 px-5 py-2 rounded-full text-[13px] font-black"
              style={{
                background: "linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,197,94,0.1))",
                border: "1px solid rgba(74,222,128,0.4)",
                backdropFilter: "blur(20px)",
                color: "#4ADE80",
                fontFamily: "Cairo, sans-serif",
                boxShadow: "0 0 30px rgba(74,222,128,0.15)",
              }}
            >
              🎂{" "}
              {isAr
                ? `عيد ميلاد سعيد يا ${plant.owner_name}!`
                : `Happy Birthday ${plant.owner_name_en}!`}
            </motion.div>
          )}
        </div>

        {/* Divider */}
        <div
          className="mx-10 mb-8"
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.35), transparent)",
          }}
        />

        {/* ── BLOCKS ── */}
        <PlantBio plant={plant} lang={lang} />
        <CareAccordion instructions={plant.care_instructions} lang={lang} />
        <HiddenGift
          gift={plant.hidden_gift}
          lang={lang}
          externalOpen={giftOpened}
          onOpen={() => handleOpenGift()}
        />

        {/* ── WATERMARK ── */}
        <div className="text-center pt-6">
          <p
            className="text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.15)", fontFamily: "Cairo, sans-serif" }}
          >
            Powered by AMYT Smart Systems
          </p>
        </div>
      </div>
    </div>
  );
}
