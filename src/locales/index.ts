import { zh } from './zh';
import { en } from './en';

export type Language = 'zh' | 'en';

export const languages: Record<Language, any> = {
  zh,
  en,
};

export const defaultLanguage: Language = 'zh';
