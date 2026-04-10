import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith('zh') ? 'zh' : 'en';

  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return {
    language,
    t,
    switchLanguage,
  };
};
