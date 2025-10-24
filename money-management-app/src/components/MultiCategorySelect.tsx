import React, { useState } from 'react';
import { Category } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { X, ChevronDown } from 'lucide-react';

interface MultiCategorySelectProps {
    label?: string;
    categories: Category[];
    selectedCategoryIds: string[];
    onChange: (categoryIds: string[]) => void;
    placeholder?: string;
    required?: boolean;
}

export const MultiCategorySelect: React.FC<MultiCategorySelectProps> = ({
    label,
    categories,
    selectedCategoryIds,
    onChange,
    placeholder = 'Select categories',
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedCategories = categories.filter(cat =>
        selectedCategoryIds.includes(cat.id)
    );

    const handleCategoryToggle = (categoryId: string) => {
        const newSelectedIds = selectedCategoryIds.includes(categoryId)
            ? selectedCategoryIds.filter(id => id !== categoryId)
            : [...selectedCategoryIds, categoryId];
        onChange(newSelectedIds);
    };

    const handleRemoveCategory = (categoryId: string) => {
        const newSelectedIds = selectedCategoryIds.filter(id => id !== categoryId);
        onChange(newSelectedIds);
    };

    const getDisplayText = () => {
        if (selectedCategories.length === 0) {
            return placeholder;
        }
        if (selectedCategories.length === 1) {
            return selectedCategories[0].name;
        }
        return `${selectedCategories.length} categories selected`;
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {/* Selected Categories Display */}
                {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCategories.map(category => (
                            <div
                                key={category.id}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 rounded-full text-sm"
                            >
                                <DynamicIcon
                                    name={category.icon}
                                    className="w-3 h-3"
                                />
                                <span>{category.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCategory(category.id)}
                                    className="ml-1 hover:text-primary-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Dropdown Trigger */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                    <div className="flex items-center justify-between">
                        <span className={selectedCategories.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}>
                            {getDisplayText()}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {categories.length === 0 ? (
                            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                                No categories available
                            </div>
                        ) : (
                            categories.map(category => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleCategoryToggle(category.id)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategoryIds.includes(category.id)}
                                        onChange={() => { }} // Handled by button click
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <DynamicIcon
                                        name={category.icon}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-900">{category.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
