"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Droplet, Palette } from "lucide-react";

const COLORS = [
  { name: "Forest", value: "#071A0F" },
  { name: "Ocean", value: "#0F1A24" },
  { name: "Berry", value: "#1A0F15" },
  { name: "Midnight", value: "#09090B" },
  { name: "Earth", value: "#1A150F" }
];

export default function CustomizationModal({ isOpen, onClose, plant, onSave, isAr }) {
  const [petName, setPetName] = useState(plant.pet_name || "");
  const [themeColor, setThemeColor] = useState(plant.custom_theme_color || plant.bg_color || COLORS[0].value);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    await onSave({ pet_name: petName, custom_theme_color: themeColor });
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl overflow-hidden"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-green-400" />
              {isAr ? "تخصيص نبتتك" : "Customize Plant"}
            </h3>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Pet Name */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {isAr ? "اسم النبتة (اللقب)" : "Plant Pet Name"}
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder={isAr ? "مثال: نبتة السعادة" : "e.g. My Happy Plant"}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-green-400 transition"
              />
            </div>

            {/* Theme Color */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-1">
                <Droplet className="w-4 h-4" /> {isAr ? "لون الخلفية المفضل" : "Background Theme Color"}
              </label>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setThemeColor(color.value)}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: color.value, border: "2px solid rgba(255,255,255,0.2)" }}
                  >
                    {themeColor === color.value && (
                      <Check className="w-6 h-6 text-white drop-shadow-md absolute" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all flex justify-center items-center gap-2"
            >
              {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Changes")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
