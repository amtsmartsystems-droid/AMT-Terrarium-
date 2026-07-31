"use client";
import { useState, useEffect } from "react";
import { Lock, Smartphone, Layers, CheckCircle2, AlertCircle, Loader2, Users, Tag } from "lucide-react";
import api from "../../lib/api"; 

export default function Portal() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'SUPER_ADMIN' or 'COMPANY'
  const [userName, setUserName] = useState("");
  const [basePlants, setBasePlants] = useState([]);
  
  // Tabs: 'single', 'batch', 'companies' (Super Admin), 'allocate' (Super Admin)
  const [activeTab, setActiveTab] = useState("single"); 
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Form State for Activation
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

  // Form State for Companies (Super Admin)
  const [companyData, setCompanyData] = useState({ name: "", pin: "" });
  const [allocateData, setAllocateData] = useState({ company_id: "", start_serial: "", end_serial: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Authenticate and get role
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/me`, {
        headers: { "x-pin": pin }
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
        setUserName(data.name);
        
        // 2. Fetch base plants for the dropdown
        const plantsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/base-plants`, {
          headers: { "x-pin": pin }
        });
        const plantsData = await plantsRes.json();
        setBasePlants(plantsData);
        if (plantsData.length > 0) {
          setFormData(prev => ({ ...prev, base_plant_id: plantsData[0].id }));
        }
        
        setIsAuthenticated(true);
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

  const handleActivationSubmit = async (e) => {
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
      const endpoint = activeTab === "single" ? "/admin/activate/single" : "/admin/activate/batch";
      const payload = activeTab === "single" 
        ? { serial_number: parseInt(formData.serial_number), content }
        : { start_serial: parseInt(formData.start_serial), end_serial: parseInt(formData.end_serial), content };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pin": pin },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        if(activeTab === "single") {
          setMessage({ type: "success", text: `تم تفعيل الستيكر رقم ${data.serial_number} بنجاح!` });
          setFormData(prev => ({ ...prev, serial_number: "" }));
        } else {
          setMessage({ type: "success", text: `تم تفعيل ${data.activated_count} ستيكر بنجاح!` });
          setFormData(prev => ({ ...prev, start_serial: "", end_serial: "" }));
        }
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.detail || "حدث خطأ أثناء التفعيل" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "فشل الاتصال بالخادم" });
    }
    setLoading(false);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pin": pin },
        body: JSON.stringify(companyData)
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({ type: "success", text: `تم إنشاء الشركة بنجاح (رقمها: ${data.company_id})` });
        setCompanyData({ name: "", pin: "" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.detail || "حدث خطأ أثناء إنشاء الشركة" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "فشل الاتصال بالخادم" });
    }
    setLoading(false);
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pin": pin },
        body: JSON.stringify({
          company_id: parseInt(allocateData.company_id),
          start_serial: parseInt(allocateData.start_serial),
          end_serial: parseInt(allocateData.end_serial)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({ type: "success", text: `تم تخصيص ${data.allocated} ستيكر للشركة بنجاح!` });
        setAllocateData({ company_id: "", start_serial: "", end_serial: "" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.detail || "حدث خطأ أثناء التخصيص" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "فشل الاتصال بالخادم" });
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 space-y-6 border-t-4 border-green-600">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AMT Terrarium B2B</h1>
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
              className="w-full bg-green-700 text-white font-bold py-4 rounded-xl hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "دخول النظام"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl text-green-900 flex items-center gap-2">
            🌿 {userName}
            {userRole === "SUPER_ADMIN" && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200">الإدارة العليا</span>}
          </h1>
          <button onClick={() => {setIsAuthenticated(false); setPin("");}} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
            تسجيل خروج
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Tabs */}
        <div className="flex bg-gray-200 p-1 rounded-xl overflow-x-auto hide-scrollbar">
          <button
            onClick={() => { setActiveTab("single"); setMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "single" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Smartphone className="w-4 h-4" /> تفعيل فردي
          </button>
          <button
            onClick={() => { setActiveTab("batch"); setMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "batch" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers className="w-4 h-4" /> تفعيل مجموعة
          </button>
          
          {userRole === "SUPER_ADMIN" && (
            <>
              <button
                onClick={() => { setActiveTab("companies"); setMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === "companies" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-4 h-4" /> إنشاء شركة
              </button>
              <button
                onClick={() => { setActiveTab("allocate"); setMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === "allocate" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Tag className="w-4 h-4" /> تخصيص للشركات
              </button>
              <button
                onClick={() => { setActiveTab("database"); setMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === "database" ? "bg-white text-red-700 shadow-sm" : "text-gray-500 hover:text-red-600"
                }`}
              >
                <AlertCircle className="w-4 h-4" /> قاعدة البيانات
              </button>
            </>
          )}
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

        {/* Dynamic Forms based on Tab */}
        
        {/* TABS: single or batch (Activation) */}
        {(activeTab === "single" || activeTab === "batch") && (
          <form onSubmit={handleActivationSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">1. تحديد الستيكرات</h2>
              {activeTab === "single" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرقم التسلسلي (المطبوع خلف الستيكر)</label>
                  <input
                    type="number" name="serial_number" value={formData.serial_number} onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-lg text-center"
                    placeholder="مثال: 12" required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">من الستيكر رقم:</label>
                    <input type="number" name="start_serial" value={formData.start_serial} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-lg text-center" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">إلى الستيكر رقم:</label>
                    <input type="number" name="end_serial" value={formData.end_serial} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-lg text-center" required />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">2. نوع التراريوم</h2>
              <select name="base_plant_id" value={formData.base_plant_id} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white" required>
                {basePlants.map(plant => (
                  <option key={plant.id} value={plant.id}>{plant.plant_name} - {plant.plant_name_en}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">3. بيانات الهدية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستلم (عربي)</label>
                  <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستلم (انجليزي)</label>
                  <input type="text" name="owner_name_en" value={formData.owner_name_en} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-left" dir="ltr" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الفيديو (YouTube)</label>
                <input type="url" name="hidden_video_url" value={formData.hidden_video_url} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-left" dir="ltr" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رسالة التهنئة (عربي)</label>
                <textarea name="gift_message" value={formData.gift_message} onChange={handleChange} rows={2} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رسالة التهنئة (انجليزي)</label>
                <textarea name="gift_message_en" value={formData.gift_message_en} onChange={handleChange} rows={2} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-left resize-none" dir="ltr" required />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full bg-green-700 text-white font-bold py-4 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 text-lg">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (activeTab === "single" ? "تفعيل الستيكر الآن" : "تفعيل المجموعة بالكامل")}
              </button>
            </div>
          </form>
        )}

        {/* TAB: Create Company */}
        {activeTab === "companies" && userRole === "SUPER_ADMIN" && (
          <form onSubmit={handleCreateCompany} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">إضافة شركة / موزع جديد</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشركة</label>
              <input type="text" value={companyData.name} onChange={(e) => setCompanyData({...companyData, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رمز الدخول السري (PIN)</label>
              <input type="text" value={companyData.pin} onChange={(e) => setCompanyData({...companyData, pin: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "حفظ الشركة"}
            </button>
          </form>
        )}

        {/* TAB: Allocate Stickers */}
        {activeTab === "allocate" && userRole === "SUPER_ADMIN" && (
          <form onSubmit={handleAllocate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">تخصيص ستيكرات لشركة</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الشركة (ID)</label>
              <input type="number" value={allocateData.company_id} onChange={(e) => setAllocateData({...allocateData, company_id: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-center" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من الستيكر رقم:</label>
                <input type="number" value={allocateData.start_serial} onChange={(e) => setAllocateData({...allocateData, start_serial: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-center" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى الستيكر رقم:</label>
                <input type="number" value={allocateData.end_serial} onChange={(e) => setAllocateData({...allocateData, end_serial: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-center" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-colors shadow-lg">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "تخصيص المجموعة"}
            </button>
          </form>
        )}

        {/* TAB: Database Seed (Super Admin Only) */}
        {activeTab === "database" && userRole === "SUPER_ADMIN" && (
          <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-red-800 border-b border-red-200 pb-2">منطقة الخطر: إعادة بناء قاعدة البيانات</h2>
            <p className="text-red-700 text-sm leading-relaxed">
              تحذير: الضغط على هذا الزر سيقوم بمسح جميع الجداول الحالية وإعادة بناء قاعدة البيانات من الصفر، وتوليد 500 ستيكر جديد، وإضافة شركة اختبارية. لا تفعل هذا إلا في بيئة التطوير أو إذا كنت تنوي تصفير النظام!
            </p>
            <button
              onClick={async () => {
                if(!confirm("هل أنت متأكد بنسبة 100% أنك تريد مسح كل شيء وإعادة توليد الستيكرات؟")) return;
                setLoading(true);
                setMessage(null);
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/seed-database`, {
                    method: "POST",
                    headers: { "x-pin": pin }
                  });
                  if(res.ok) {
                    const data = await res.json();
                    setMessage({ type: "success", text: data.message });
                  } else {
                    setMessage({ type: "error", text: "فشلت عملية البناء" });
                  }
                } catch(e) {
                  setMessage({ type: "error", text: "خطأ في الاتصال بالخادم" });
                }
                setLoading(false);
              }}
              disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "⚠️ تنفيذ مسح وإعادة بناء شامل (Seed)"}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
