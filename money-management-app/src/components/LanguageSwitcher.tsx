import React from 'react';
import { Select } from './Select';
import { useI18n } from '../hooks/useI18n';

export const LanguageSwitcher: React.FC = () => {
    const { changeLanguage, currentLanguage, isRTL } = useI18n();

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'fa', label: 'فارسی' },
    ];

    return (
        <div className={`flex items-center ${isRTL() ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            <label className={`text-sm font-medium text-gray-700 ${isRTL() ? 'text-right' : 'text-left'}`}>
                {isRTL() ? 'زبان / Language:' : 'Language / زبان:'}
            </label>
            <Select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                options={languages}
                className={`w-32 ${isRTL() ? 'text-right' : 'text-left'}`}
            />
        </div>
    );
};
