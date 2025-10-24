import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    CreditCard,
    Tag,
    Receipt,
    FileText,
    BarChart3,
    Settings,
    Users,
    Menu,
    X
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { CompactLanguageSwitcher } from './CompactLanguageSwitcher';
import { OfflineIndicator } from './OfflineIndicator';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { t, isRTL } = useI18n();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: t('navigation.dashboard'), href: '/', icon: Home },
        { name: t('navigation.cards'), href: '/cards', icon: CreditCard },
        { name: t('navigation.categories'), href: '/categories', icon: Tag },
        { name: t('navigation.transactions'), href: '/transactions', icon: Receipt },
        { name: t('navigation.loans'), href: '/loans', icon: FileText },
        { name: t('navigation.friendLoans'), href: '/friend-loans', icon: Users },
        { name: t('navigation.analytics'), href: '/analytics', icon: BarChart3 },
        { name: t('navigation.settings'), href: '/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <OfflineIndicator />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isRTL()
                ? `right-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
                : `left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                }`}>
                <div className={`flex h-16 items-center justify-between px-6 border-b border-gray-200 ${isRTL() ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center ${isRTL() ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                        <h1 className="text-xl font-bold text-gray-900">MonEyn</h1>
                        <CompactLanguageSwitcher />
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            } ${isRTL() ? 'flex-row-reverse' : ''}`}
                                    >
                                        <item.icon className={`${isRTL() ? 'ml-3' : 'mr-3'} h-5 w-5`} />
                                        <span className={isRTL() ? 'text-right' : 'text-left'}>{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Main content */}
            <div className={'lg:pl-64'}>
                {/* Mobile header */}
                <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                    <div className={`flex items-center justify-between ${isRTL() ? 'flex-row-reverse' : ''}`}>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className={`flex items-center ${isRTL() ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            <h1 className="text-lg font-semibold text-gray-900">MonEyn</h1>
                            <CompactLanguageSwitcher />
                        </div>
                        <div className="w-6" /> {/* Spacer for centering */}
                    </div>
                </div>

                <main className="py-4 lg:py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
