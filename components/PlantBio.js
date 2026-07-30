"use client";

import { motion } from "framer-motion";
import { calcAge, formatDate } from "@/lib/utils";

/**
 * PlantBio — Shows plant name, age counter, and creation date
 */
export default function PlantBio({ plant, lang }) {
  const isAr = lang === "ar";
  const name = isAr ? plant.plant_name : plant.plant_name_en;
  const { days, months, weeks } = calcAge(plant.creation_date);
  const createdDate = formatDate(plant.creation_date, lang);

  // Age label
  const ageLabel = isAr
    ? days < 30
      ? `${days} يوم`
      : months < 12
      ? `${months} شهر و ${days % 30} يوم`
      : `${Math.floor(months / 12)} سنة`
    : days < 30
    ? `${days} day${days !== 1 ? "s" : ""}`
    : months < 12
    ? `${months} mo, ${days % 30}d`
    : `${Math.floor(months / 12)} year${Math.floor(months / 12) !== 1 ? "s" : ""}`;

  const stats = [
    {
      icon: "🌱",
      label: isAr ? "العمر" : "Age",
      value: days,
      suffix: isAr ? "يوم" : "days",
      sublabel: ageLabel,
    },
    {
      icon: "📅",
      label: isAr ? "تاريخ الزراعة" : "Planted On",
      value: null,
      sublabel: createdDate,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mx-5 mb-6 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(var(--primary-rgb),0.2)",
        backdropFilter: "blur(12px)",
      }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{
          background: "rgba(var(--primary-rgb),0.08)",
          borderBottom: "1px solid rgba(var(--primary-rgb),0.15)",
        }}
      >
        <span className="text-sm">🌿</span>
        <span
          className="text-[11px] font-black tracking-widest uppercase"
          style={{ color: "rgba(var(--primary-rgb),1)", fontFamily: "Cairo, sans-serif" }}
        >
          {isAr ? "سيرة النبتة" : "Plant Bio"}
        </span>
      </div>

      {/* Plant Name */}
      <div className="px-5 pt-4 pb-2">
        <h2
          className="text-[18px] font-black text-white"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          {name}
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="px-5 pb-5 grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex flex-col gap-1 px-4 py-3.5 rounded-xl"
            style={{
              background: "rgba(var(--primary-rgb),0.07)",
              border: "1px solid rgba(var(--primary-rgb),0.15)",
            }}
          >
            {/* Label */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{stat.icon}</span>
              <span
                className="text-[10px] uppercase tracking-wider font-bold"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Cairo, sans-serif" }}
              >
                {stat.label}
              </span>
            </div>

            {/* Value */}
            {stat.value !== null ? (
              <motion.span
                className="text-[28px] font-black leading-none"
                style={{
                  color: "rgba(var(--primary-rgb),1)",
                  fontFamily: "Cairo, sans-serif",
                  fontVariantNumeric: "tabular-nums",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                {stat.value}
              </motion.span>
            ) : null}

            {/* Sub-label */}
            <span
              className="text-[11px] leading-snug"
              style={{
                color: stat.value !== null ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)",
                fontFamily: "Cairo, sans-serif",
                marginTop: stat.value === null ? 4 : 0,
                fontWeight: stat.value === null ? 600 : 400,
              }}
            >
              {stat.sublabel}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
