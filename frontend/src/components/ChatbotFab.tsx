import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const ChatbotFab: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your Aqua Sutra assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [farmContext, setFarmContext] = useState<any>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    console.log('[Chatbot] Fetching context for user:', user.id);
                    
                    // Fetch Farm Data
                    let farmData = {};
                    try {
                        const farmRes = await fetch(`http://localhost:3000/api/farm?userId=${user.id}`);
                        farmData = await farmRes.json();
                    } catch (e) { console.warn('Farm fetch failed', e); }
                    
                    // Fetch Profile via backend API
                    let profile = {};
                    try {
                        const profileRes = await fetch(`http://localhost:3000/api/profile?userId=${user.id}`);
                        const profileData = await profileRes.json();
                        if (profileData.profile) {
                            profile = profileData.profile;
                        }
                    } catch (profileErr) {
                        console.warn('[Chatbot] Profile fetch failed', profileErr);
                    }
                    
                    // Fetch Leaderboard (Score)
                    let rank = {};
                    try {
                        const scoreRes = await fetch(`http://localhost:3000/api/leaderboard?userId=${user.id}`);
                        const scoreData = await scoreRes.json();
                        rank = scoreData.rankings?.[0] || {};
                    } catch (scoreErr) { console.warn('Leaderboard fetch failed', scoreErr); }

                    // Fetch Market Snapshot
                    let marketTrending = [];
                    try {
                        const marketRes = await fetch(`http://localhost:3000/api/market/snapshot`);
                        const marketData = await marketRes.json();
                        if (marketData.success) {
                            marketTrending = marketData.data.trending?.slice(0, 3) || [];
                        }
                    } catch (mErr) { console.warn("Market fetch failed", mErr); }

                    const contextData = {
                        user: { id: user.id },
                        profile: profile || {},
                        farm: (farmData as any).farm || {},
                        crops: (farmData as any).crops || [],
                        score: (rank as any).score,
                        rank: (rank as any).rank,
                        market: marketTrending,
                        clientTimestamp: new Date().toISOString(),
                        clientLocale: Intl.DateTimeFormat().resolvedOptions().locale,
                        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    };
                    
                    console.log('[Chatbot] Full context:', contextData);
                    setFarmContext(contextData);
                }
            } catch (err) {
                console.error("[Chatbot] Failed to fetch chatbot context", err);
            }
        };
        fetchContext();

        // Listen for location updates
        const handleLocationUpdate = () => {
            console.log('[Chatbot] Location updated, refreshing context...');
            fetchContext();
        };
        window.addEventListener('location-updated', handleLocationUpdate);
        return () => window.removeEventListener('location-updated', handleLocationUpdate);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await fetch('http://localhost:3000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMessage, 
                    history,
                    context: farmContext
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            
            if (data.reply) {
                 setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }

            if (data.action) {
                console.log("AI Action Triggered:", data.action, data.action_param);
                switch(data.action) {
                    case 'NAVIGATE_FARM': navigate('/farm'); break;
                    case 'NAVIGATE_MARKET': 
                        if (data.action_param) navigate(`/market?q=${encodeURIComponent(data.action_param)}`);
                        else navigate('/market'); 
                        break;
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-4 p-4 rounded-full shadow-lg z-[100] transition-all duration-300 ${
                    isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-emerald-500/30'
                }`}
            >
                <MessageSquare className="w-6 h-6" />
            </button>

            {/* Chat Window */}
            <div
                className={`fixed inset-0 z-[100] flex flex-col bg-white sm:inset-auto sm:bottom-24 sm:right-4 sm:w-96 sm:h-[600px] sm:rounded-2xl sm:shadow-2xl transition-all duration-300 transform ${
                    isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Aqua Sutra AI</h3>
                            <p className="text-xs text-emerald-100">
                                {farmContext?.profile?.village ? 
                                    `📍 ${farmContext.profile.village}` : 
                                    'Online'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user'
                                        ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-br-none shadow-md'
                                        : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white rounded-b-2xl">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about crops, weather, or prices..."
                            className="flex-grow p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatbotFab;
