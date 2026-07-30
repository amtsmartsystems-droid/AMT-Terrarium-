"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseVideoUrl } from "@/lib/utils";

export default function HiddenGift({ gift, lang, externalOpen, onOpen }) {
  const [opened, setOpened] = useState(externalOpen || gift.is_message_opened);
  const [showVideo, setShowVideo] = useState(false);
  const isAr = lang === "ar";
  const parsed = parseVideoUrl(gift.hidden_video_url);

  const handleOpen = () => {
    setOpened(true);
    setShowVideo(true);
    if (onOpen) onOpen();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.3 }}
      className="mx-5 mb-5"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Section label */}
      <div className="flex items-center justify-center gap-3 mb-4 px-2">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.3))" }} />
        <div className="flex items-center gap-2">
          <span className="text-sm">🎁</span>
          <span className="text-[11px] font-black tracking-[0.22em] uppercase"
            style={{ color: "rgba(var(--primary-rgb),0.75)", fontFamily: "Cairo, sans-serif" }}>
            {isAr ? "هديتك المخفية" : "Your Hidden Gift"}
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(var(--primary-rgb),0.3), transparent)" }} />
      </div>

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
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="gift-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-5 select-none"
              >
                🎁
              </motion.div>
              <p className="text-[13px] mb-6 max-w-[220px]"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Cairo, sans-serif", lineHeight: 1.7 }}>
                {isAr ? gift.gift_message || "رسالة مخفية خاصة بك بانتظارك!" : gift.gift_message_en || "A hidden message is waiting for you!"}
              </p>

              {/* Gift Button */}
              <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full max-w-[260px] py-4 rounded-2xl font-black text-[14px] relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.9) 0%, rgba(var(--primary-rgb),0.6) 100%)",
                  color: "#071A0F",
                  fontFamily: "Cairo, sans-serif",
                  boxShadow: "0 8px 32px rgba(var(--primary-rgb),0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 opacity-40"
                  style={{ background: "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.6) 50%, transparent 65%)", backgroundSize: "200% 100%" }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                />
                <span className="relative z-10">
                  {isAr ? "🎁 افتح الهدية" : "🎁 Open Gift"}
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="gift-opened"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 18, stiffness: 160 }}
            >
              {showVideo && parsed ? (
                <>
                  {parsed.type === "youtube" && (
                    <div className="aspect-video w-full">
                      <iframe
                        src={parsed.embedUrl}
                        title="Gift"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {parsed.type === "instagram" && (
                    <div className="aspect-square w-full">
                      <iframe src={parsed.embedUrl} title="Gift" className="w-full h-full" scrolling="no" allowTransparency allowFullScreen />
                    </div>
                  )}
                  <div className="py-3 text-center text-[12px]"
                    style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Cairo, sans-serif" }}>
                    {isAr ? "🎉 استمتع بهديتك!" : "🎉 Enjoy your gift!"}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Cairo, sans-serif" }}>
                    {isAr ? "تم فتح الهدية مسبقاً" : "Gift already opened"}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
