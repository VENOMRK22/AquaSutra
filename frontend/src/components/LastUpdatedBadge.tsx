
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useConnectivity } from '../contexts/ConnectivityContext';

interface LastUpdatedBadgeProps {
    timestamp: Date | null;
    className?: string;
}

const LastUpdatedBadge: React.FC<LastUpdatedBadgeProps> = ({ timestamp, className = '' }) => {
    const { t } = useLanguage();
    const { isOnline } = useConnectivity();
    const [timeString, setTimeString] = useState<string>('');
    const [statusColor, setStatusColor] = useState<string>('bg-gray-300');

    const updateTime = () => {
        if (!timestamp) {
            setTimeString('');
            return;
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);

        // Status Color Logic
        if (!isOnline) {
            setStatusColor('bg-amber-500'); // Offline -> Amber/Red attention
        } else if (diffInMinutes < 5) {
            setStatusColor('bg-green-500'); // Fresh
        } else if (diffInMinutes < 60) {
            setStatusColor('bg-yellow-500'); // Stale
        } else {
            setStatusColor('bg-orange-500'); // Old
        }

        // Time String Logic
        if (diffInSeconds < 60) {
            setTimeString(t('connectivity.just_now'));
        } else if (diffInMinutes < 60) {
            setTimeString(`${diffInMinutes} ${t('connectivity.minutes_ago')}`);
        } else if (diffInMinutes < 1440) { // < 24 hours
            const hours = Math.floor(diffInMinutes / 60);
            setTimeString(`${hours} ${t('connectivity.hours_ago')}`);
        } else {
            const date = new Date(timestamp);
            setTimeString(`${date.getDate()}/${date.getMonth() + 1}`);
        }
    };

    useEffect(() => {
        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [timestamp, isOnline, t]);

    if (!timestamp) return null;

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span className={`w-2 h-2 rounded-full ${statusColor} ${!isOnline ? 'animate-pulse' : ''}`} />
            <span className={`text-[10px] font-medium ${!isOnline ? 'text-amber-700' : 'text-gray-400'}`}>
                {t('connectivity.last_updated')}: {timeString}
            </span>
        </div>
    );
};

export default LastUpdatedBadge;
