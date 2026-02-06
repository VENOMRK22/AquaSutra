import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Check } from 'lucide-react';

interface SoilTypeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const SoilTypeSelector: React.FC<SoilTypeSelectorProps> = ({ value, onChange }) => {
    const { t } = useLanguage();

    const soilTypes = [
        { id: 'Clay', label: t('farm.soil_clay'), icon: '🟤', color: 'bg-stone-100 border-stone-200' },
        { id: 'Black', label: t('farm.soil_black'), icon: '⚫', color: 'bg-gray-100 border-gray-200' },
        { id: 'Loamy', label: t('farm.soil_loamy'), icon: '🟠', color: 'bg-orange-50 border-orange-200' },
        { id: 'Sandy', label: t('farm.soil_sandy'), icon: '🟡', color: 'bg-yellow-50 border-yellow-200' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 w-full">
            {soilTypes.map((type) => {
                const isSelected = value === type.id;
                return (
                    <button
                        key={type.id}
                        onClick={() => onChange(type.id)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 min-h-[100px]
                            ${isSelected
                                ? 'border-green-500 bg-green-50 shadow-md ring-1 ring-green-500'
                                : `${type.color} border-transparent hover:border-gray-300`
                            }`}
                    >
                        {isSelected && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
                                <Check size={12} strokeWidth={4} />
                            </div>
                        )}
                        <span className="text-3xl mb-2 filter drop-shadow-sm">{type.icon}</span>
                        <span className={`text-sm font-bold leading-tight px-1 ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>
                            {type.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default SoilTypeSelector;
