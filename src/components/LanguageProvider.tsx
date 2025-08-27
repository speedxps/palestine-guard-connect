import React, { ReactNode } from 'react';
import { LanguageContext, useLanguage } from '@/hooks/useLanguage';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const languageValue = useLanguage();
  
  return (
    <LanguageContext.Provider value={languageValue}>
      {children}
    </LanguageContext.Provider>
  );
};