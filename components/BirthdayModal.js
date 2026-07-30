"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BirthdayModal — Full-screen birthday popup
 * Shows if isBirthday=true, otherwise hides.
 * If hidden_gift.is_message_opened=false, shows gift button inside.
 */
export default function BirthdayModal({ plant, lang, onOpenGift, giftOpened }) {
  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const isAr = lang === "ar";
  const owner = isAr ? plant.owner_name : plant.owner_name_en;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      setShowConfetti(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setVisible(false);

  const confettiEmojis = ["🌿", "🎉", "🌱", "✨", "🎊", "🍃", "💚", "🎁"];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: "rgba(2, 10, 5, 0.97)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Confetti particles */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confettiEmojis.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  initial={{
                    x: `${Math.random() * 100}vw`,
                    y: -60,
                    opacity: 1,
                    rotate: 0,
                  }}
                  animate={{
                    y: "110vh",
                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 3,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 4,
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 180 }}
            className="relative mx-6 max-w-sm w-full rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #071A0F, #0D2B18)",
              border: "1px solid rgba(74,222,128,0.3)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(74,222,128,0.1), inset 0 1px 0 rgba(74,222,128,0.15)",
            }}
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Glow top bar */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, transparent, #4ADE80, #22C55E, transparent)" }}
            />

            <div className="p-8 text-center">
              {/* Emoji */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl mb-6 select-none"
              >
                🎂
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black mb-2"
                style={{
                  fontFamily: "Cairo, sans-serif",
                  background: "linear-gradient(135deg, #4ADE80, #86EFAC)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {isAr ? `عيد ميلاد سعيد يا ${owner}! 🌿` : `Happy Birthday ${owner}! 🌿`}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm leading-relaxed mb-6"
                style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Cairo, sans-serif" }}
              >
                {isAr
                  ? `"${plant.plant_name}" يُهنّئك بعيد ميلادك ويتمنى لك سنة مليئة بالنمو والازدهار مثله! 🌱`
                  : `"${plant.plant_name_en}" wishes you a birthday full of growth and beauty! 🌱`}
              </motion.p>

              {/* Gift Button */}
              {!giftOpened && !plant.hidden_gift.is_message_opened && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-5"
                >
                  <p
                    className="text-xs mb-3"
                    style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Cairo, sans-serif" }}
                  >
                    {isAr ? "لديك هدية مخفية! 🎁" : "You have a hidden gift! 🎁"}
                  </p>
                  <button
                    onClick={() => { onOpenGift(); }}
                    className="w-full py-3.5 rounded-2xl font-black text-sm transition-all duration-300 relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, #4ADE80, #16A34A)",
                      color: "#071A0F",
                      fontFamily: "Cairo, sans-serif",
                      boxShadow: "0 8px 24px rgba(74,222,128,0.4)",
                    }}
                  >
                    <span className="relative z-10">
                      {isAr ? "🎁 افتح هديتك" : "🎁 Open Your Gift"}
                    </span>
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "linear-gradient(135deg, #86EFAC, #4ADE80)" }}
                    />
                  </button>
                </motion.div>
              )}

              {/* Already opened */}
              {(giftOpened || plant.hidden_gift.is_message_opened) && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm mb-5 px-4 py-2 rounded-xl"
                  style={{
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    color: "#4ADE80",
                    fontFamily: "Cairo, sans-serif",
                  }}
                >
                  {isAr ? "✅ تم فتح الهدية مسبقاً" : "✅ Gift already opened"}
                </motion.p>
              )}

              {/* Close button */}
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: "Cairo, sans-serif",
                }}
              >
                {isAr ? "شكراً! 💚" : "Thanks! 💚"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
