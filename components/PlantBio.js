"use client";

import { motion } from "framer-motion";
import { calcAge, formatDate } from "@/lib/utils";

export default function PlantBio({ plant, lang }) {
  const isAr = lang === "ar";
  const name = isAr ? plant.plant_name : plant.plant_name_en;
  const { days, months } = calcAge(plant.creation_date);
  const createdDate = formatDate(plant.creation_date, lang);

  const ageLabel = isAr
    ? days < 30
      ? `${days} يوم`
      : months < 12
      ? `${months} شهراً و ${days % 30} يوم`
      : `${Math.floor(months / 12)} سنة`
    : days < 30
    ? `${days} day${days !== 1 ? "s" : ""}`
    : months < 12
    ? `${months}mo ${days % 30}d`
    : `${Math.floor(months / 12)} year${Math.floor(months / 12) !== 1 ? "s" : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mx-5 mb-5"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Glass Card */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 10px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* ── Header strip ── */}
        <div
          className="flex items-center gap-2.5 px-5 py-3.5"
          style={{
            background: "rgba(var(--primary-rgb),0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className="text-base">🌿</span>
          <span
            className="text-[11px] font-black tracking-[0.22em] uppercase"
            style={{ color: "rgba(var(--primary-rgb),0.85)", fontFamily: "Cairo, sans-serif" }}
          >
            {isAr ? "سيرة النبتة" : "Plant Bio"}
          </span>
          {/* Top-right shimmer accent */}
          <div
            className="ms-auto w-16 h-px rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.5))",
            }}
          />
        </div>

        {/* ── Plant Name ── */}
        <div className="px-5 pt-4 pb-3 text-center">
          <h2
            className="text-[20px] font-black text-white"
            style={{ fontFamily: "Cairo, sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            {name}
          </h2>
        </div>

        {/* ── Stats Grid ── */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-3">

          {/* Age stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-1 py-5 rounded-2xl text-center"
            style={{
              background: "rgba(var(--primary-rgb),0.07)",
              border: "1px solid rgba(var(--primary-rgb),0.18)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="text-2xl mb-1">🌱</span>
            <span
              className="text-[11px] uppercase tracking-widest font-bold"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Cairo, sans-serif" }}
            >
              {isAr ? "العمر" : "Age"}
            </span>
            <motion.span
              className="text-[36px] font-black leading-none"
              style={{
                color: "rgba(var(--primary-rgb),1)",
                fontFamily: "Cairo, sans-serif",
                textShadow: "0 0 30px rgba(var(--primary-rgb),0.4)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {days}
            </motion.span>
            <span
              className="text-[11px] font-medium"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Cairo, sans-serif" }}
            >
              {isAr ? "يوم" : "days old"}
            </span>
            <span
              className="text-[10px] mt-0.5 px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(var(--primary-rgb),0.1)",
                color: "rgba(var(--primary-rgb),0.7)",
                fontFamily: "Cairo, sans-serif",
              }}
            >
              {ageLabel}
            </span>
          </motion.div>

          {/* Founded stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28, type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-1 py-5 rounded-2xl text-center"
            style={{
              background: "rgba(var(--primary-rgb),0.07)",
              border: "1px solid rgba(var(--primary-rgb),0.18)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="text-2xl mb-1">📅</span>
            <span
              className="text-[11px] uppercase tracking-widest font-bold"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Cairo, sans-serif" }}
            >
              {isAr ? "تاريخ الزراعة" : "Planted On"}
            </span>
            <span
              className="text-[13px] font-black leading-snug mt-2 text-center px-2"
              style={{
                color: "rgba(255,255,255,0.8)",
                fontFamily: "Cairo, sans-serif",
                textShadow: "0 2px 10px rgba(0,0,0,0.4)",
              }}
            >
              {createdDate}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
