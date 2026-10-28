import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import knTranslations from '../locales/kn.json';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('catchtrace_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('catchtrace_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'kn' : 'en'));
  };

  const t = (path, fallbackStr = '') => {
    if (!path) return fallbackStr || '';
    const keys = path.split('.');
    const dict = lang === 'kn' ? knTranslations : enTranslations;
    
    let current = dict;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if key missing in Kannada
        let fallback = enTranslations;
        for (const k of keys) {
          if (fallback && typeof fallback === 'object' && k in fallback) {
            fallback = fallback[k];
          } else {
            return fallbackStr || path;
          }
        }
        return fallback || fallbackStr || path;
      }
    }
    return current || fallbackStr || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
