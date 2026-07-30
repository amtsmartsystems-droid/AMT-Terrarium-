"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseVideoUrl } from "@/lib/utils";

/**
 * HiddenGift — Gift button or "already opened" state
 * Controls: hidden_gift.is_message_opened + hidden_video_url
 */
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
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
          {isAr ? "هديتك المخفية" : "Your Hidden Gift"}
        </span>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(var(--primary-rgb),0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <AnimatePresence mode="wait">
          {!opened ? (
            /* ── UNOPENED STATE ── */
            <motion.div
              key="unopened"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 text-center"
            >
              {/* Animated Gift Box */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4 select-none"
              >
                🎁
              </motion.div>

              <p
                className="text-[13px] mb-5"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Cairo, sans-serif" }}
              >
                {isAr
                  ? gift.gift_message || "لديك رسالة مخفية بانتظارك!"
                  : gift.gift_message_en || "You have a hidden message waiting!"}
              </p>

              {/* Open Gift Button */}
              <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-black text-sm relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.9), rgba(var(--primary-rgb),0.6))",
                  color: "#071A0F",
                  fontFamily: "Cairo, sans-serif",
                  boxShadow: "0 8px 30px rgba(var(--primary-rgb),0.35)",
                }}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative z-10">
                  {isAr ? "🎁 افتح الهدية" : "🎁 Open Gift"}
                </span>
              </motion.button>
            </motion.div>
          ) : (
            /* ── OPENED STATE ── */
            <motion.div
              key="opened"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 18, stiffness: 160 }}
            >
              {showVideo && parsed ? (
                <>
                  {/* Video Player */}
                  {parsed.type === "youtube" && (
                    <div className="aspect-video w-full">
                      <iframe
                        src={parsed.embedUrl}
                        title="Gift Video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {parsed.type === "instagram" && (
                    <div className="aspect-square w-full">
                      <iframe
                        src={parsed.embedUrl}
                        title="Gift Video"
                        className="w-full h-full"
                        scrolling="no"
                        allowTransparency
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div
                    className="px-5 py-3 text-center text-xs"
                    style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Cairo, sans-serif" }}
                  >
                    {isAr ? "🎉 استمتع بهديتك!" : "🎉 Enjoy your gift!"}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <div className="text-5xl mb-3">✅</div>
                  <p
                    className="text-[13px]"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Cairo, sans-serif" }}
                  >
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
