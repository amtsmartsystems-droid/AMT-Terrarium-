"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CareAccordion — Collapsible care instructions
 * Maps to care_instructions[] from JSON payload
 */
export default function CareAccordion({ instructions, lang }) {
  const [openId, setOpenId] = useState(null);
  const isAr = lang === "ar";

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="mx-5 mb-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div
          className="w-[3px] h-5 rounded-full"
          style={{ background: "rgba(var(--primary-rgb),1)", boxShadow: "0 0 10px rgba(var(--primary-rgb),0.6)" }}
        />
        <span
          className="text-[11px] font-black tracking-widest uppercase"
          style={{ color: "rgba(var(--primary-rgb),0.8)", fontFamily: "Cairo, sans-serif" }}
        >
          {isAr ? "تعليمات العناية" : "Care Instructions"}
        </span>
      </div>

      {/* Accordion Items */}
      <div className="flex flex-col gap-2">
        {instructions.map((item, i) => {
          const isOpen = openId === item.id;
          const label = isAr ? item.title : item.title_en;
          const detail = isAr ? item.detail : item.detail_en;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: isOpen
                  ? "rgba(var(--primary-rgb),0.06)"
                  : "rgba(255,255,255,0.03)",
                border: isOpen
                  ? "1px solid rgba(var(--primary-rgb),0.3)"
                  : "1px solid rgba(255,255,255,0.07)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Row */}
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl transition-all duration-300"
                  style={{
                    background: isOpen
                      ? "rgba(var(--primary-rgb),0.2)"
                      : "rgba(var(--primary-rgb),0.08)",
                    border: "1px solid rgba(var(--primary-rgb),0.2)",
                  }}
                >
                  {item.icon}
                </div>

                {/* Label */}
                <span
                  className="flex-1 font-bold text-[15px] text-white"
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  {label}
                </span>

                {/* Chevron */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ color: "rgba(var(--primary-rgb),0.6)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </button>

              {/* Expandable content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-5 pb-4 pt-1 text-[13px] leading-relaxed"
                      style={{
                        color: "rgba(255,255,255,0.65)",
                        fontFamily: "Cairo, sans-serif",
                        borderTop: "1px solid rgba(var(--primary-rgb),0.1)",
                      }}
                    >
                      {detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
