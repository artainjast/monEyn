import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineFallbackProps {
    onRetry?: () => void;
}

export const OfflineFallback: React.FC<OfflineFallbackProps> = ({ onRetry }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        You're Offline
                    </h1>
                    <p className="text-gray-600 mb-6">
                        It looks like you're not connected to the internet.
                        Some features may not be available, but you can still
                        view your cached data.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={onRetry}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </button>

                    <p className="text-sm text-gray-500">
                        The app will automatically sync when you're back online
                    </p>
                </div>
            </div>
        </div>
    );
};
