import React, { useState, useEffect } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    formatNumber?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    formatNumber = false,
    type,
    value,
    onChange,
    ...props
}) => {
    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        if (formatNumber && type === 'number' && value) {
            const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
            if (!isNaN(numValue)) {
                setDisplayValue(numValue.toLocaleString('en-US'));
            } else {
                setDisplayValue(value.toString());
            }
        } else {
            setDisplayValue(value?.toString() || '');
        }
    }, [value, formatNumber, type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        if (formatNumber && type === 'number') {
            // Remove commas and non-numeric characters except decimal point
            const cleanValue = inputValue.replace(/[^\d.]/g, '');

            // Allow only one decimal point
            const parts = cleanValue.split('.');
            const formattedValue = parts.length > 2
                ? parts[0] + '.' + parts.slice(1).join('')
                : cleanValue;

            // Update display value with commas
            if (formattedValue && !isNaN(parseFloat(formattedValue))) {
                const numValue = parseFloat(formattedValue);
                setDisplayValue(numValue.toLocaleString('en-US'));

                // Call onChange with the clean numeric value
                if (onChange) {
                    const syntheticEvent = {
                        ...e,
                        target: {
                            ...e.target,
                            value: formattedValue
                        }
                    };
                    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
                }
            } else if (formattedValue === '') {
                setDisplayValue('');
                if (onChange) {
                    const syntheticEvent = {
                        ...e,
                        target: {
                            ...e.target,
                            value: ''
                        }
                    };
                    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
                }
            }
        } else {
            setDisplayValue(inputValue);
            if (onChange) {
                onChange(e);
            }
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (formatNumber && type === 'number' && displayValue) {
            // Ensure the value is properly formatted on blur
            const cleanValue = displayValue.replace(/[^\d.]/g, '');
            if (cleanValue && !isNaN(parseFloat(cleanValue))) {
                const numValue = parseFloat(cleanValue);
                setDisplayValue(numValue.toLocaleString('en-US'));
            }
        }
        if (props.onBlur) {
            props.onBlur(e);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'
                    } ${className}`}
                type={formatNumber && type === 'number' ? 'text' : type}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                {...props}
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
