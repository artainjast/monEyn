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

interface LayoutProps {
    children: React.ReactNode;
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Cards', href: '/cards', icon: CreditCard },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Loans', href: '/loans', icon: FileText },
    { name: 'Friend Loans', href: '/friend-loans', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Money Manager</h1>
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
                                            }`}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Mobile header */}
                <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Money Manager</h1>
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
