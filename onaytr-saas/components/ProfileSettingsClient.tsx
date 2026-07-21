"use client";

import { useState } from 'react';
import { ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/components/LanguageProvider';

export default function ProfileSettingsClient({ initialAutoFallback }: { initialAutoFallback: boolean }) {
  const [autoFallback, setAutoFallback] = useState(initialAutoFallback);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const handleToggle = async () => {
    setIsUpdating(true);
    const newValue = !autoFallback;
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoFallback: newValue })
      });

      if (res.ok) {
        setAutoFallback(newValue);
        showToast(
          newValue 
            ? (language === 'tr' ? 'Akıllı alternatif geçiş kilidi aktif!' : language === 'az' ? 'Ağıllı alternativ keçid kilidi aktivdir!' : 'Smart alternative route lock active!')
            : (language === 'tr' ? 'Alternatif geçiş devredışı bırakıldı.' : language === 'az' ? 'Alternativ keçid deaktiv edildi.' : 'Alternative route lock deactivated.'),
          "success"
        );
      } else {
        showToast(language === 'tr' ? 'Ayarlar güncellenirken hata oluştu.' : language === 'az' ? 'Parametrlər yenilənərkən xəta baş verdi.' : 'Error updating settings.', "error");
      }
    } catch (e) {
      showToast(language === 'tr' ? 'Bağlantı hatası.' : language === 'az' ? 'Bağlantı xətası.' : 'Connection error.', "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="glass-panel p-6 border border-white/60 relative overflow-hidden bg-white/40 shadow-xs rounded-2xl flex items-center justify-between gap-4 mt-6">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-slate-800 text-base display-font">
            {language === 'tr' ? 'Akıllı Alternatif Hat Kilidi' : language === 'az' ? 'Ağıllı Alternativ Xətt Kilidi' : 'Smart Alternative Route Lock'}
          </h3>
          <span className="text-[9px] font-black text-white bg-gradient-to-r from-teal-500 to-teal-400 px-2 py-0.5 rounded-full shadow-xs">
            {language === 'tr' ? 'ÖNERİLEN' : language === 'az' ? 'TÖVSİYƏ OLUNAN' : 'RECOMMENDED'}
          </span>
        </div>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
          {language === 'tr' ? 'Satın alma sırasında tercih ettiğiniz hat yoğun veya stoksuz olduğunda; sistem bakiyeniz dahilindeki en yakın fiyatlı alternatif hattan numarayı otomatik tahsis eder. Devredışı bırakırsanız, daha pahalı yedek hatlar için onayınız istenir.' : language === 'az' ? 'Satın alma zamanı üstünlük verdiyiniz xətt sıx və ya stoksuz olduqda; sistem balansınız daxilindəki ən yaxın qiymətli alternativ xətdən nömrəni avtomatik təyin edir. Deaktiv etsəniz, daha bahalı ehtiyat xətlər üçün təsdiqiniz istəniləcək.' : 'If your preferred route is busy or out of stock during purchase, the system automatically allocates the number from the closest-priced alternative route within your balance. If deactivated, your confirmation will be requested for more expensive backup routes.'}
        </p>
      </div>

      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className="shrink-0 p-1 rounded-full text-teal-600 hover:text-teal-500 transition-colors disabled:opacity-50"
        title={language === 'tr' ? 'Seçeneği Değiştir' : language === 'az' ? 'Seçimi Dəyiş' : 'Change Option'}
      >
        {isUpdating ? (
          <Loader2 className="h-9 w-9 animate-spin text-teal-600/70" />
        ) : autoFallback ? (
          <ToggleRight className="h-10 w-10 text-teal-600 cursor-pointer" />
        ) : (
          <ToggleLeft className="h-10 w-10 text-slate-400 cursor-pointer" />
        )}
      </button>
    </div>
  );
}
