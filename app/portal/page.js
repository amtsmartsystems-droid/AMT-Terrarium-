"use client";
import { useState, useEffect } from "react";
import { Lock, Smartphone, Layers, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from "../../lib/api"; // Wait, we might need to update lib/api.js

export default function Portal() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [basePlants, setBasePlants] = useState([]);
  const [activeTab, setActiveTab] = useState("single"); // 'single' or 'batch'
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Form State
  const [formData, setFormData] = useState({
    serial_number: "",
    start_serial: "",
    end_serial: "",
    owner_name: "",
    owner_name_en: "",
    gift_message: "",
    gift_message_en: "",
    hidden_video_url: "",
    base_plant_id: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Test the PIN by fetching base plants
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/base-plants`, {
        headers: { "x-pin": pin }
      });
      if (res.ok) {
        const data = await res.json();
        setBasePlants(data);
        setIsAuthenticated(true);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, base_plant_id: data[0].id }));
        }
      } else {
        setMessage({ type: "error", text: "رمز المرور غير صحيح" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "فشل الاتصال بالخادم" });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const content = {
      owner_name: formData.owner_name,
      owner_name_en: formData.owner_name_en,
      gift_message: formData.gift_message,
      gift_message_en: formData.gift_message_en,
      hidden_video_url: formData.hidden_video_url,
      base_plant_id: parseInt(formData.base_plant_id)
    };

    try {
      if (activeTab === "single") {
        const payload = {
          serial_number: parseInt(formData.serial_number),
          content
        };
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/activate/single`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-pin": pin },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          const data = await res.json();
          setMessage({ type: "success", text: `تم تفعيل الستيكر رقم ${data.serial_number} بنجاح!` });
          setFormData(prev => ({ ...prev, serial_number: "" })); // Reset just serial
        } else {
          const err = await res.json();
          setMessage({ type: "error", text: err.detail || "حدث خطأ أثناء التفعيل" });
        }
      } else {
        const payload = {
          start_serial: parseInt(formData.start_serial),
          end_serial: parseInt(formData.end_serial),
          content
        };
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/activate/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-pin": pin },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          const data = await res.json();
          setMessage({ type: "success", text: `تم تفعيل ${data.activated_count} ستيكر بنجاح دفعة واحدة!` });
          setFormData(prev => ({ ...prev, start_serial: "", end_serial: "" })); // Reset serials
        } else {
          const err = await res.json();
          setMessage({ type: "error", text: err.detail || "حدث خطأ أثناء التفعيل" });
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "فشل الاتصال بالخادم" });
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 space-y-6">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Nabatarium Portal</h1>
            <p className="text-gray-500 mt-2">يرجى إدخال رمز المرور السري</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center text-3xl tracking-[1em] p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-mono"
                placeholder="****"
                maxLength={4}
                required
              />
            </div>
            {message && message.type === "error" && (
              <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "دخول"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl text-green-900 flex items-center gap-2">
            🌿 Nabatarium Portal
          </h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
            تسجيل خروج
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Tabs */}
        <div className="flex bg-gray-200 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab("single"); setMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
              activeTab === "single" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Smartphone className="w-4 h-4" /> تفعيل فردي
          </button>
          <button
            onClick={() => { setActiveTab("batch"); setMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
              activeTab === "batch" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers className="w-4 h-4" /> تفعيل مجموعة
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-xl flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
          
          {/* Numbers Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">1. الترقيم (الستيكر)</h2>
            {activeTab === "single" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرقم التسلسلي (المطبوع خلف الستيكر)</label>
                <input
                  type="number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg text-center"
                  placeholder="مثال: 12"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">من الستيكر رقم:</label>
                  <input
                    type="number"
                    name="start_serial"
                    value={formData.start_serial}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg text-center"
                    placeholder="مثال: 50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">إلى الستيكر رقم:</label>
                  <input
                    type="number"
                    name="end_serial"
                    value={formData.end_serial}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg text-center"
                    placeholder="مثال: 80"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Plant Type Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">2. نوع التراريوم</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اختر نوع النبتة</label>
              <select
                name="base_plant_id"
                value={formData.base_plant_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
                required
              >
                {basePlants.map(plant => (
                  <option key={plant.id} value={plant.id}>{plant.plant_name} - {plant.plant_name_en}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Content Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">3. بيانات العميل والهدية</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل (عربي)</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="مثال: أحمد"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل (انجليزي)</label>
                <input
                  type="text"
                  name="owner_name_en"
                  value={formData.owner_name_en}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-left"
                  placeholder="Example: Ahmad"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رابط فيديو الهدية (YouTube/Drive)</label>
              <input
                type="url"
                name="hidden_video_url"
                value={formData.hidden_video_url}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-left"
                placeholder="https://..."
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رسالة الهدية (عربي)</label>
              <textarea
                name="gift_message"
                value={formData.gift_message}
                onChange={handleChange}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
                placeholder="اكتب رسالة التهنئة هنا..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رسالة الهدية (انجليزي)</label>
              <textarea
                name="gift_message_en"
                value={formData.gift_message_en}
                onChange={handleChange}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-left resize-none"
                placeholder="Write the greeting message here..."
                dir="ltr"
                required
              />
            </div>
            
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-900 text-white font-bold py-4 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                activeTab === "single" ? "تفعيل الستيكر الآن" : "تفعيل المجموعة بالكامل"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
