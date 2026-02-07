/**
 * VoiceMicButton.tsx
 * 
 * Floating Action Button for Voice Control.
 * Provides Push-to-Talk interface with live transcript feedback.
 * Uses Hindi (hi-IN) by default for best Hinglish code-switching support.
 */

import { Mic, Loader2, Check, X, Volume2 } from 'lucide-react';
import { useVoice } from '../contexts/VoiceControlContext';

interface VoiceMicButtonProps {
    className?: string;
}

export function VoiceMicButton({ className = '' }: VoiceMicButtonProps) {
    const {
        status,
        transcript,
        errorMessage,
        isSupported,
        toggleListening,
    } = useVoice();

    if (!isSupported) {
        return null; // Don't render if not supported
    }

    const getStatusConfig = () => {
        switch (status) {
            case 'listening':
                return {
                    bg: 'bg-gradient-to-br from-red-500 to-red-600',
                    icon: <Volume2 className="w-6 h-6 text-white animate-pulse" />,
                    ring: 'ring-4 ring-red-400/50',
                    pulse: true,
                };
            case 'processing':
                return {
                    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    icon: <Loader2 className="w-6 h-6 text-white animate-spin" />,
                    ring: '',
                    pulse: false,
                };
            case 'success':
                return {
                    bg: 'bg-gradient-to-br from-green-500 to-green-600',
                    icon: <Check className="w-6 h-6 text-white" />,
                    ring: 'ring-4 ring-green-400/50',
                    pulse: false,
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
                    icon: <X className="w-6 h-6 text-white" />,
                    ring: 'ring-4 ring-orange-400/50',
                    pulse: false,
                };
            default:
                return {
                    bg: 'bg-gradient-to-br from-blue-600 to-blue-700',
                    icon: <Mic className="w-6 h-6 text-white" />,
                    ring: 'ring-2 ring-blue-400/30',
                    pulse: false,
                };
        }
    };

    const config = getStatusConfig();
    const showTranscript = transcript && (status === 'listening' || status === 'processing');
    const showError = errorMessage && status === 'error';

    return (
        <div className={`absolute bottom-24 right-3 z-[100] flex flex-col items-end gap-2 pointer-events-auto ${className}`}>
            {/* Transcript Bubble */}
            {(showTranscript || showError) && (
                <div
                    className={`
                        max-w-[260px] px-4 py-2 rounded-2xl shadow-lg 
                        animate-in slide-in-from-bottom-2 fade-in duration-200
                        ${showError
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-white/95 backdrop-blur-sm text-gray-800 border border-gray-200'
                        }
                    `}
                >
                    {status === 'listening' && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Listening...</span>
                        </div>
                    )}
                    <p className="text-sm font-medium">
                        {showError ? errorMessage : `"${transcript}"`}
                    </p>
                </div>
            )}

            {/* Mic FAB - Simple single button */}
            <button
                onClick={toggleListening}
                disabled={status === 'processing'}
                className={`
                    relative w-14 h-14 rounded-full shadow-xl 
                    flex items-center justify-center
                    transition-all duration-300 transform
                    hover:scale-105 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${config.bg} ${config.ring}
                `}
                aria-label={status === 'listening' ? 'Stop listening' : 'Start voice command'}
            >
                {/* Pulse Ring Animation */}
                {config.pulse && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"></span>
                        <span className="absolute inset-[-4px] rounded-full border-2 border-red-400 animate-pulse opacity-40"></span>
                    </>
                )}

                {/* Icon */}
                {config.icon}
            </button>
        </div>
    );
}

export default VoiceMicButton;

