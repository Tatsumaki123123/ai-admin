import { useState, useEffect } from 'react';
import { Language, languages, defaultLanguage } from '../locales';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    // 从localStorage读取保存的语言设置，默认为中文
    const saved = localStorage.getItem('app-language') as Language | null;
    return saved || defaultLanguage;
  });

  // 保存语言设置到localStorage
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  // 根据当前语言获取翻译对象
  const t = languages[language];

  const switchLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return {
    language,
    t,
    switchLanguage,
  };
};
