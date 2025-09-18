import React, { ReactNode, useState, useEffect } from 'react';
import { LanguageContext, translations, type Language } from '@/hooks/useLanguage';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('appLanguage') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
      document.documentElement.lang = savedLanguage;
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const languageValue = { language, setLanguage, t };
  
  return (
    <LanguageContext.Provider value={languageValue}>
      {children}
    </LanguageContext.Provider>
  );
};