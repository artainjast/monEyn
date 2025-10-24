import React from 'react';
import { useI18n } from '../hooks/useI18n';

export const CompactLanguageSwitcher: React.FC = () => {
    const { changeLanguage, currentLanguage, isRTL } = useI18n();

    const languages = [
        { value: 'en', label: 'EN' },
        { value: 'fa', label: 'فا' },
    ];

    return (
        <div className={`flex items-center ${isRTL() ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
            {languages.map((lang) => (
                <button
                    key={lang.value}
                    onClick={() => changeLanguage(lang.value)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${currentLanguage === lang.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        } ${isRTL() ? 'text-right' : 'text-left'}`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};
