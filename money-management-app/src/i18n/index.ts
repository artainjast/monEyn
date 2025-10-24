import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fa from './locales/fa.json';

const resources = {
    en: {
        translation: en,
    },
    fa: {
        translation: fa,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
        },

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
