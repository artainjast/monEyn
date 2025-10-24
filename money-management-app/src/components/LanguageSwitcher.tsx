import React from 'react';
import { Select } from './Select';
import { useI18n } from '../hooks/useI18n';

export const LanguageSwitcher: React.FC = () => {
    const { changeLanguage, currentLanguage } = useI18n();

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'fa', label: 'فارسی' },
    ];

    return (
        <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Language / زبان:</label>
            <Select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                options={languages}
                className="w-32"
            />
        </div>
    );
};
