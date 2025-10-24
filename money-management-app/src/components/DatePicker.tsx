import React from 'react';
import { format } from 'date-fns';

interface DatePickerProps {
    label?: string;
    value: number | null; // Unix timestamp
    onChange: (timestamp: number | null) => void;
    error?: string;
    helperText?: string;
    className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    label,
    value,
    onChange,
    error,
    helperText,
    className = '',
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (dateValue) {
            onChange(new Date(dateValue).getTime());
        } else {
            onChange(null);
        }
    };

    const inputValue = value ? format(new Date(value), 'yyyy-MM-dd') : '';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                type="date"
                value={inputValue}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'
                    } ${className}`}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};
