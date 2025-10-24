import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();
    const [isVisible, setIsVisible] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setIsVisible(true);
            setWasOffline(true);
        } else if (wasOffline) {
            // Show "back online" message briefly
            setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        }
    }, [isOnline, wasOffline]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isOnline
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white'
            }`}>
            <div className="flex items-center justify-between px-4 py-2 text-sm">
                <div className="flex items-center gap-2">
                    {isOnline ? (
                        <>
                            <Wifi className="w-4 h-4" />
                            <span>You're back online! Data will sync automatically.</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4" />
                            <span>You're offline. App works with cached data.</span>
                        </>
                    )}
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-4 hover:bg-black hover:bg-opacity-20 rounded p-1"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
