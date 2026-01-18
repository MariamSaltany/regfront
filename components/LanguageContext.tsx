
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    app_name: 'Madrasati',
    schools: 'Schools',
    my_reviews: 'My Reviews',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    verification: 'Verification',
    profile: 'School Profile',
    moderation: 'Moderation',
    reports: 'Reports',
    users: 'Users',
    view_school: 'View School',
    hygiene: 'Hygiene',
    management: 'Management',
    edu_quality: 'Education Quality',
    communication: 'Communication',
    report: 'Report',
    approve: 'Approve',
    reject: 'Reject',
  },
  ar: {
    app_name: 'مدرستي',
    schools: 'المدارس',
    my_reviews: 'تقييماتي',
    login: 'تسجيل الدخول',
    register: 'تسجيل جديد',
    logout: 'خروج',
    verification: 'التحقق',
    profile: 'ملف المدرسة',
    moderation: 'الرقابة',
    reports: 'البلاغات',
    users: 'المستخدمين',
    view_school: 'عرض المدرسة',
    hygiene: 'النظافة',
    management: 'الإدارة',
    edu_quality: 'جودة التعليم',
    communication: 'التواصل',
    report: 'تبليغ',
    approve: 'موافقة',
    reject: 'رفض',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRtl: lang === 'ar', t }}>
      <div className={lang === 'ar' ? 'rtl' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};
