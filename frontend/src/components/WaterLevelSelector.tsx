import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Check, Droplets } from 'lucide-react';

interface WaterLevelSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const WaterLevelSelector: React.FC<WaterLevelSelectorProps> = ({ value, onChange }) => {
    const { t } = useLanguage();

    const levels = [
        {
            id: 'Low',
            label: t('farm.water_low'),
            drops: 1,
            bg: 'bg-sky-50',
            border: 'border-sky-200',
            fill: 'text-sky-400'
        },
        {
            id: 'Medium',
            label: t('farm.water_medium'),
            drops: 2,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            fill: 'text-blue-500'
        },
        {
            id: 'High',
            label: t('farm.water_high'),
            drops: 3,
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            fill: 'text-indigo-600'
        },
    ];

    return (
        <div className="flex gap-2 w-full">
            {levels.map((level) => {
                const isSelected = value === level.id;
                return (
                    <button
                        key={level.id}
                        onClick={() => onChange(level.id)}
                        className={`relative flex flex-col items-center justify-center py-4 px-2 flex-1 rounded-2xl border-2 transition-all active:scale-95 min-h-[90px]
                            ${isSelected
                                ? 'border-green-500 bg-green-50 shadow-md ring-1 ring-green-500'
                                : `${level.bg} ${level.border}`
                            }`}
                    >
                        {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-green-500 text-white rounded-full p-0.5">
                                <Check size={10} strokeWidth={4} />
                            </div>
                        )}

                        <div className="flex gap-0.5 mb-2">
                            {[...Array(level.drops)].map((_, i) => (
                                <Droplets
                                    key={i}
                                    size={16}
                                    className={`fill-current ${level.fill}`}
                                    strokeWidth={0}
                                />
                            ))}
                        </div>

                        <span className={`text-xs font-bold ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>
                            {level.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default WaterLevelSelector;
