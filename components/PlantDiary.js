"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Loader2, Calendar } from "lucide-react";
import { addPlantDiary } from "@/lib/api";

export default function PlantDiary({ plantId, diaries = [], isAr }) {
  const [localDiaries, setLocalDiaries] = useState(diaries);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("note", isAr ? "تحديث جديد" : "New update"); // Minimal note

    const newDiary = await addPlantDiary(plantId, formData);
    if (newDiary) {
      // Append optimistically
      setLocalDiaries(prev => [...prev, {
        id: newDiary.diary_id,
        image_url: newDiary.image_url,
        date_added: new Date().toISOString().split("T")[0],
        note: isAr ? "تحديث جديد" : "New update"
      }]);
    } else {
      alert(isAr ? "فشل رفع الصورة، تأكد من الإعدادات." : "Failed to upload image. Check settings.");
    }
    setIsUploading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-5 py-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-white/90 flex items-center gap-2" style={{ fontFamily: "Cairo, sans-serif" }}>
          <Camera className="w-5 h-5 text-green-400" />
          {isAr ? "يوميات النبتة" : "Plant Diary"}
        </h3>
        
        {/* Upload Button */}
        <div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-green-400" />
            ) : (
              <ImagePlus className="w-4 h-4 text-green-400" />
            )}
            {isAr ? "صورة جديدة" : "New Photo"}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-white/10 pl-6 rtl:pl-0 rtl:pr-6 rtl:border-l-0 rtl:border-r-2 space-y-8">
        {localDiaries.length === 0 && (
          <p className="text-white/40 text-sm text-center py-10 italic">
            {isAr ? "لا توجد صور بعد، التقط أول صورة لنبتتك!" : "No photos yet, capture the first one!"}
          </p>
        )}
        
        {localDiaries.map((diary, i) => (
          <motion.div
            key={diary.id || i}
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Timeline Dot */}
            <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[33px] rtl:-left-auto rtl:-right-[33px] top-1 border-4 border-[#071A0F] shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2 text-xs text-white/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>{diary.date_added}</span>
              </div>
              {diary.image_url && (
                <div className="w-full aspect-square bg-black/40">
                  <img src={diary.image_url} alt="Plant update" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
