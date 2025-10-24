import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const useI18n = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
        // Update document direction for RTL languages
        const isRTL = language === 'fa';
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        // Add/remove RTL class to body for additional styling
        if (isRTL) {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    };

    // Apply RTL on mount based on current language
    useEffect(() => {
        const isRTL = i18n.language === 'fa';
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;

        if (isRTL) {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }, [i18n.language]);

    const getCurrentLanguage = () => i18n.language;

    const isRTL = () => i18n.language === 'fa';

    return {
        t,
        changeLanguage,
        getCurrentLanguage,
        isRTL,
        currentLanguage: i18n.language,
    };
};
