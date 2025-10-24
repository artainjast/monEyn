import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100" />
            ) : (
                <Sun className="h-5 w-5 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100" />
            )}
        </button>
    );
};
