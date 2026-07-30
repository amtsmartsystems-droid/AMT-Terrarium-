"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CareAccordion({ instructions, lang }) {
  const [openId, setOpenId] = useState(null);
  const isAr = lang === "ar";

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2 }}
      className="mx-5 mb-5"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── Section label ── */}
      <div className="flex items-center justify-center gap-3 mb-4 px-2">
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.3))" }}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm">🌿</span>
          <span
            className="text-[11px] font-black tracking-[0.22em] uppercase"
            style={{ color: "rgba(var(--primary-rgb),0.75)", fontFamily: "Cairo, sans-serif" }}
          >
            {isAr ? "تعليمات العناية" : "Care Instructions"}
          </span>
        </div>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, rgba(var(--primary-rgb),0.3), transparent)" }}
        />
      </div>

      {/* ── Accordion Glass Card ── */}
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
        {instructions.map((item, i) => {
          const isOpen = openId === item.id;
          const isLast = i === instructions.length - 1;
          const label = isAr ? item.title : item.title_en;
          const detail = isAr ? item.detail : item.detail_en;

          return (
            <div key={item.id}>
              {/* Row */}
              <motion.button
                onClick={() => toggle(item.id)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                className="w-full flex items-center gap-4 px-5 py-4 transition-all duration-300 text-center"
                style={{
                  background: isOpen ? "rgba(var(--primary-rgb),0.07)" : "transparent",
                  cursor: "pointer",
                }}
              >
                {/* Icon bubble */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl transition-all duration-300"
                  style={{
                    background: isOpen
                      ? "rgba(var(--primary-rgb),0.2)"
                      : "rgba(255,255,255,0.06)",
                    border: isOpen
                      ? "1px solid rgba(var(--primary-rgb),0.35)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isOpen ? `0 0 20px rgba(var(--primary-rgb),0.2)` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {item.icon}
                </div>

                {/* Centered label */}
                <span
                  className="flex-1 font-bold text-[15px] text-center"
                  style={{
                    color: isOpen ? "rgba(var(--primary-rgb),0.95)" : "rgba(255,255,255,0.85)",
                    fontFamily: "Cairo, sans-serif",
                    transition: "color 0.3s",
                  }}
                >
                  {label}
                </span>

                {/* Chevron */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ color: isOpen ? "rgba(var(--primary-rgb),0.8)" : "rgba(255,255,255,0.25)" }}
                  className="flex-shrink-0"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M5 7l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </motion.button>

              {/* Expandable detail */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-6 pb-5 pt-2 text-[13px] leading-relaxed text-center"
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "Cairo, sans-serif",
                        borderTop: "1px solid rgba(var(--primary-rgb),0.1)",
                      }}
                    >
                      {detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Separator */}
              {!isLast && (
                <div
                  className="mx-5"
                  style={{ height: 1, background: "rgba(255,255,255,0.05)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
