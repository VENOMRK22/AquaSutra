/**
 * VoiceControlContext.tsx
 * 
 * Core Voice Control Engine with Dynamic Command Registry.
 * Provides Push-to-Talk speech recognition with multilingual support.
 */

import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseTranscript, findCropMatch, getRoutePath, type ParsedIntent } from '../lib/SpeechUtils';

// ============ TYPES ============

export interface VoiceCommand {
    id: string;
    keywords: string[];               // Trigger keywords (multilingual)
    description: string;              // For help/discovery UI
    action: (payload?: string) => void;
    requiresEntity?: boolean;         // If true, expects an entity (e.g., crop name)
    entityType?: 'crop' | 'page';     // Type of entity expected
    priority?: number;                // Higher = checked first (page-specific override global)
}

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface VoiceState {
    status: VoiceStatus;
    transcript: string;
    lastResult: ParsedIntent | null;
    errorMessage: string | null;
    isSupported: boolean;
    language: 'en-US' | 'hi-IN' | 'mr-IN';
}

export interface VoiceContextValue extends VoiceState {
    // Actions
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
    setLanguage: (lang: 'en-US' | 'hi-IN' | 'mr-IN') => void;

    // Command Registry
    registerCommands: (commands: VoiceCommand[]) => void;
    unregisterCommands: (commandIds: string[]) => void;
    getAvailableCommands: () => VoiceCommand[];

    // Entity Context (for fuzzy matching)
    setAvailableEntities: (entities: { id: string; name: string }[]) => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

// ============ PROVIDER ============

interface VoiceProviderProps {
    children: ReactNode;
}

export function VoiceProvider({ children }: VoiceProviderProps) {
    const navigate = useNavigate();

    // State
    const [status, setStatus] = useState<VoiceStatus>('idle');
    const [transcript, setTranscript] = useState('');
    const [lastResult, setLastResult] = useState<ParsedIntent | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [language, setLanguageState] = useState<'en-US' | 'hi-IN' | 'mr-IN'>('hi-IN');

    // Command Registry
    const commandRegistry = useRef<Map<string, VoiceCommand>>(new Map());
    const availableEntities = useRef<{ id: string; name: string }[]>([]);

    // Speech Recognition Instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    // Ref to hold latest processCommand (avoids stale closure in onresult)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processCommandRef = useRef<any>(null);

    // Check browser support
    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Initialize Speech Recognition
    useEffect(() => {
        if (!isSupported) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();

        recognition.continuous = false;      // Stop after one result (Push-to-Talk)
        recognition.interimResults = true;   // Show partial results for live transcript
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('[Voice] STARTED LISTENING');
            setStatus('listening');
            setTranscript('');
            setErrorMessage(null);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const results = event.results;
            const latestResult = results[results.length - 1];
            const transcriptText = latestResult[0].transcript;
            const confidence = latestResult[0].confidence;

            console.log('[Voice] onresult:', transcriptText, 'isFinal:', latestResult.isFinal);

            setTranscript(transcriptText);

            // Only process final results - use ref to get latest processCommand
            if (latestResult.isFinal && processCommandRef.current) {
                setStatus('processing');
                processCommandRef.current(transcriptText, confidence);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setStatus('error');
            setErrorMessage(getErrorMessage(event.error));

            // Auto-reset after error
            setTimeout(() => setStatus('idle'), 2000);
        };

        recognition.onend = () => {
            // Only set to idle if not already processing
            if (status === 'listening') {
                setStatus('idle');
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, [isSupported, language]);

    // Update language when changed
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = language;
        }
    }, [language]);

    // ============ COMMAND PROCESSING ============

    const processCommand = useCallback((transcriptText: string, _confidence: number) => {
        console.log('[Voice] Processing:', transcriptText);

        const text = transcriptText.toLowerCase().trim();
        const words = text.split(/\s+/);

        // Helper to check if any word matches
        const hasWord = (keywords: string[]) => {
            return keywords.some(kw => words.includes(kw) || text.includes(kw));
        };

        let executed = false;

        // ========== HARDCODED NAVIGATION (ALWAYS WORKS) ==========
        // NOTE: Hindi speech recognition transcribes English words to Hindi script
        // with varying vowel spellings (e.g., "select" -> "सेलेक्ट" or "सिलेक्ट")
        // We include ALL common variations to maximize matching

        // HOME / DASHBOARD
        if (hasWord([
            // English
            'home', 'homepage', 'dashboard', 'main', 'start', 'beginning', 'first',
            // Romanized Hindi
            'ghar', 'mukhya', 'shuru', 'pahla', 'pehla',
            // Hindi script - with vowel variations
            'होम', 'हॉम', 'हौम', 'होंम',
            'डैशबोर्ड', 'डेशबोर्ड', 'डॅशबोर्ड', 'डाशबोर्ड',
            'घर', 'घार',
            'मुख्य', 'मुख्या', 'मुखिया',
            'मेन', 'मैन', 'मेंन',
            'स्टार्ट', 'स्टार्ट', 'स्टाट',
            'शुरू', 'शुरु', 'शुरुआत',
            // Marathi
            'घरी', 'मुख्यपृष्ठ'
        ])) {
            console.log('[Voice] -> Navigating to HOME');
            navigate('/');
            setStatus('success');
            executed = true;
        }
        // PROFIT / ANALYSIS
        else if (hasWord([
            // English
            'profit', 'profits', 'analysis', 'analyze', 'analyse', 'analytics', 'money', 'earnings', 'income', 'revenue',
            // Romanized Hindi
            'munafa', 'fayda', 'faida', 'paisa', 'paise', 'kamai', 'aay', 'amdani',
            // Hindi script - with vowel variations
            'प्रॉफिट', 'प्रोफिट', 'प्राफिट', 'प्रोफ़िट',
            'एनालिसिस', 'एनालसिस', 'एनालायसिस', 'अनालिसिस', 'एनालाइसिस', 'एनलिसिस', 'ऐनालिसिस',
            'एनालाइज', 'एनालाईज', 'अनालाइज',
            'एनालिटिक्स', 'एनालिटीक्स', 'अनालिटिक्स',
            'मुनाफा', 'मुनाफ़ा', 'मुनाफे',
            'फायदा', 'फ़ायदा', 'फाइदा', 'फायदे',
            'पैसा', 'पैसे', 'पेसा', 'पेसे',
            'मनी', 'मनि', 'मॅनी',
            'अर्निंग्स', 'अर्निंग', 'इर्निंग्स',
            'इनकम', 'इंकम', 'इंकाम',
            'कमाई', 'कमाइ',
            // Marathi
            'नफा', 'उत्पन्न'
        ])) {
            console.log('[Voice] -> Navigating to PROFIT ANALYSIS');
            navigate('/analysis');
            setStatus('success');
            executed = true;
        }
        // MARKET
        else if (hasWord([
            // English
            'market', 'markets', 'marketplace', 'prices', 'price', 'rates', 'rate', 'sell', 'buy', 'trade',
            // Romanized Hindi
            'bazaar', 'bazar', 'mandi', 'bhav', 'bhaav', 'daam', 'dam', 'keemat',
            // Hindi script - with vowel variations
            'मार्केट', 'मार्किट', 'मारकेट', 'मार्कट', 'मार्केट्स',
            'बाजार', 'बाज़ार', 'बाजर', 'बज़ार', 'बजार',
            'मंडी', 'मण्डी', 'मंडि', 'मांडी',
            'प्राइस', 'प्राईस', 'प्राइसेज', 'प्राइसेस',
            'रेट', 'रेट्स', 'रैट', 'रेट्स',
            'भाव', 'भाऊ', 'भावी',
            'दाम', 'दाँ', 'दाम',
            'कीमत', 'किमत', 'कीमती',
            // Marathi
            'भाव', 'बाजारभाव', 'दर'
        ])) {
            console.log('[Voice] -> Navigating to MARKET');
            navigate('/market');
            setStatus('success');
            executed = true;
        }
        // PROFILE / SETTINGS
        else if (hasWord([
            // English
            'profile', 'profiles', 'settings', 'setting', 'account', 'accounts', 'my', 'me', 'user',
            // Romanized Hindi
            'mera', 'meri', 'mere', 'khata', 'vyaktigat',
            // Hindi script - with vowel variations
            'प्रोफाइल', 'प्रोफ़ाइल', 'प्रोफ़ाईल', 'प्रोफाईल', 'प्राफाइल',
            'सेटिंग', 'सेटिंग्स', 'सैटिंग', 'सैटिंग्स', 'सेटींग',
            'अकाउंट', 'अकाऊंट', 'एकाउंट', 'अकाउन्ट',
            'मेरा', 'मेरे', 'मेरी', 'मैरा',
            'खाता', 'खाते', 'खाती',
            // Marathi
            'माझा', 'माझी', 'माझे', 'खाते', 'प्रोफाईल'
        ])) {
            console.log('[Voice] -> Navigating to PROFILE');
            navigate('/profile');
            setStatus('success');
            executed = true;
        }
        // FARM
        else if (hasWord([
            // English
            'farm', 'farms', 'farming', 'field', 'fields', 'crop', 'crops', 'agriculture', 'land',
            // Romanized Hindi
            'khet', 'kheti', 'fasal', 'fasaal', 'zameen', 'bhoomi',
            // Hindi script - with vowel variations
            'फार्म', 'फ़ार्म', 'फार्मिंग', 'फारम', 'फॉर्म',
            'फील्ड', 'फ़ील्ड', 'फिल्ड', 'फील्ड्स',
            'खेत', 'खेती', 'खेतो', 'खेतों',
            'फसल', 'फ़सल', 'फसलों', 'फसले',
            'क्रॉप', 'क्रॉप्स', 'क्रोप', 'कॉप',
            'ज़मीन', 'जमीन', 'भूमि',
            // Marathi
            'शेत', 'शेती', 'पिक', 'पिके'
        ])) {
            console.log('[Voice] -> Navigating to FARM');
            navigate('/farm');
            setStatus('success');
            executed = true;
        }
        // BACK
        else if (hasWord([
            // English
            'back', 'return', 'previous', 'go back', 'goback',
            // Romanized Hindi
            'wapas', 'vapas', 'peeche', 'piche', 'peechhe', 'pichhe',
            // Hindi script - with vowel variations
            'बैक', 'बेक', 'बॅक',
            'रिटर्न', 'रीटर्न', 'रितर्न',
            'प्रीवियस', 'प्रिवियस', 'प्रेवियस', 'पिछला',
            'वापस', 'वापास', 'वपस',
            'पीछे', 'पिछे', 'पिछ्छे',
            // Marathi
            'मागे', 'परत', 'माघे'
        ])) {
            console.log('[Voice] -> Going BACK');
            navigate(-1);
            setStatus('success');
            executed = true;
        }

        // ========== CROP SELECTION (Analysis Page) ==========
        // Detect "select cotton" / "nivad kapas" / "chuno गेहूं" patterns
        if (!executed) {
            // EXPANDED: Many Hindi script spelling variations
            const selectKeywords = [
                // English
                'select', 'add', 'choose', 'pick', 'show',
                // Romanized Hindi/Marathi
                'chuno', 'chun', 'niwad', 'nivad', 'nivda', 'jod', 'jodo', 'lagao',
                // Hindi script - multiple spelling variations
                'सेलेक्ट', 'सिलेक्ट', 'सेलैक्ट', 'सिलैक्ट', 'सलेक्ट',
                'चुनो', 'चुनें', 'चुन', 'चूनो',
                'जोड़', 'जोड़ो', 'जोड', 'जोडो',
                'ऐड', 'एड', 'एड्ड',
                // Marathi script
                'निवडा', 'निवड', 'निवडी', 'निवडून'
            ];
            const removeKeywords = [
                // English
                'remove', 'delete', 'deselect', 'unselect',
                // Romanized
                'hatao', 'hata', 'kadha', 'kadh', 'nikalo', 'nikal',
                // Hindi script - multiple variations
                'हटाओ', 'हटा', 'हटाओ', 'हटादो',
                'निकालो', 'निकाल', 'निकालें',
                'रिमूव', 'रीमूव', 'रिमूब',
                'डिलीट', 'डीलीट', 'डिलिट',
                // Marathi script
                'काढा', 'काढ', 'काढून'
            ];

            const isSelect = hasWord(selectKeywords);
            const isRemove = hasWord(removeKeywords);

            if (isSelect || isRemove) {
                // MASSIVELY EXPANDED crop aliases with Hindi script vowel variations
                const cropAliases: Record<string, string[]> = {
                    'cotton_bt': [
                        'cotton', 'cottons', 'kapas', 'kapaas', 'bt cotton', 'btcotton',
                        'कपास', 'कॉटन', 'कोटन', 'कोटोन', 'कापस', 'कापास', 'कापूस', 'कपासी'
                    ],
                    'sugarcane_1': [
                        'sugarcane', 'sugar cane', 'cane', 'ganna', 'gana', 'oos', 'us',
                        'गन्ना', 'गन्ने', 'गना', 'गने', 'ऊस', 'उस', 'शुगरकेन', 'शूगरकेन', 'केन'
                    ],
                    'soybean_js335': [
                        'soybean', 'soya', 'soyabean', 'soy',
                        'सोयाबीन', 'सोयाबिन', 'सोयबीन', 'सोया', 'सोइबीन', 'सोयाबिन'
                    ],
                    'wheat_lokwan': [
                        'wheat', 'gehun', 'gehu', 'gahu',
                        'गेहूं', 'गेहुं', 'गेहू', 'गेहु', 'गहू', 'गहु', 'व्हीट', 'वीट', 'विट'
                    ],
                    'gram_chana': [
                        'gram', 'chana', 'channa', 'chickpea',
                        'चना', 'चने', 'चणा', 'ग्राम', 'ग्रैम', 'हरभरा', 'हरभरे', 'चिकपी'
                    ],
                    'onion_red': [
                        'onion', 'onions', 'pyaaz', 'pyaj', 'kanda',
                        'प्याज', 'प्याज़', 'पियाज', 'कांदा', 'कंदा', 'कान्दा', 'अनियन', 'ऑनियन'
                    ],
                    'tomato_hybrid': [
                        'tomato', 'tomatoes', 'tamatar', 'tamater',
                        'टमाटर', 'टमाटे', 'टोमैटो', 'टोमेटो', 'टमाटा', 'तमातर'
                    ],
                    'rice_basmati': [
                        'rice', 'chawal', 'chaval', 'basmati', 'tandool',
                        'चावल', 'चाउल', 'राइस', 'राईस', 'तांदूळ', 'तांदुल', 'बासमती', 'बास्मती'
                    ],
                    'maize_kharif': [
                        'maize', 'corn', 'makka', 'maka', 'bhutta',
                        'मक्का', 'मकका', 'मका', 'मक्के', 'कॉर्न', 'कोर्न', 'भुट्टा', 'मेज़', 'मेज'
                    ],
                    'groundnut_bold': [
                        'groundnut', 'peanut', 'peanuts', 'moongfali', 'mungfali', 'shengdane',
                        'मूंगफली', 'मुंगफली', 'मूँगफली', 'शेंगदाणे', 'शेंगदाणा', 'ग्राउंडनट', 'पीनट', 'पिनट'
                    ],
                    'tur_red': [
                        'tur', 'toor', 'arhar', 'arahar', 'pigeon pea',
                        'तूर', 'तुर', 'तूअर', 'अरहर', 'अरहार', 'तुरी', 'तुरडाळ'
                    ],
                    'pomegranate_bhagwa': [
                        'pomegranate', 'anar', 'dalimb', 'anaar',
                        'अनार', 'अनार', 'डाळिंब', 'दालिंब', 'पोमेग्रेनेट', 'पोमग्रेनेट'
                    ],
                    'bajra_hybrid': [
                        'bajra', 'bajri', 'pearl millet', 'millet',
                        'बाजरा', 'बाजरी', 'बाजरे', 'मिलेट', 'पर्ल मिलेट'
                    ],
                    'jowar_hybrid': [
                        'jowar', 'jwar', 'sorghum', 'jowaree',
                        'ज्वार', 'ज्वारी', 'जवार', 'जोवार', 'जोवारी', 'सोर्गम'
                    ],
                    'sunflower': [
                        'sunflower', 'surajmukhi', 'suraj mukhi',
                        'सूरजमुखी', 'सुरजमुखी', 'सूर्यमुखी', 'सनफ्लावर', 'सनफ्लाॅवर'
                    ],
                    'safflower': [
                        'safflower', 'kusum', 'kardai', 'karadai',
                        'कुसुम', 'करडई', 'करडाई', 'सैफ्लावर', 'सेफ्लावर'
                    ],
                    'mustard': [
                        'mustard', 'sarson', 'sarso', 'rai',
                        'सरसों', 'सरसो', 'सरस', 'राई', 'मस्टर्ड', 'मस्टार्ड'
                    ],
                    'turmeric': [
                        'turmeric', 'haldi', 'halad',
                        'हल्दी', 'हल्दि', 'हळद', 'टर्मरिक', 'टरमेरिक'
                    ],
                    'ginger': [
                        'ginger', 'adrak', 'adrakh', 'ale',
                        'अदरक', 'अद्रक', 'आले', 'जिंजर', 'जिंजर'
                    ],
                    'urad': [
                        'urad', 'urid', 'black gram', 'udid',
                        'उड़द', 'उरद', 'उडद', 'उड़ीद', 'ब्लैक ग्राम'
                    ],
                    'moong': [
                        'moong', 'mung', 'green gram', 'mungbean',
                        'मूंग', 'मुंग', 'मूँग', 'ग्रीन ग्राम'
                    ],
                };

                // Find which crop was mentioned
                let matchedCropId: string | null = null;

                for (const [cropId, aliases] of Object.entries(cropAliases)) {
                    for (const alias of aliases) {
                        if (text.includes(alias.toLowerCase())) {
                            matchedCropId = cropId;
                            console.log('[Voice] Matched crop:', alias, '->', cropId);
                            break;
                        }
                    }
                    if (matchedCropId) break;
                }

                if (matchedCropId) {
                    // Dispatch custom event for ProfitAnalysis to handle
                    const eventType = isSelect ? 'voice-select-crop' : 'voice-remove-crop';
                    console.log('[Voice] Dispatching event:', eventType, matchedCropId);
                    window.dispatchEvent(new CustomEvent(eventType, {
                        detail: { cropId: matchedCropId }
                    }));
                    setStatus('success');
                    executed = true;
                }
            }
        }

        // ========== RUN ANALYSIS (Analysis Page) ==========
        if (!executed && hasWord([
            // English
            'run', 'start', 'compare', 'analyze', 'calculate', 'go', 'execute',
            // Romanized Hindi
            'chalu', 'shuru', 'tulna', 'ganana', 'hisab',
            // Hindi script - with variations
            'रन', 'रान', 'स्टार्ट', 'स्टाट', 'स्टार्ट',
            'कंपेयर', 'कम्पेयर', 'कॉम्पेर',
            'एनालाइज', 'एनालाईज', 'एनालायज',
            'चालू', 'चालु', 'शुरू', 'शुरु', 'शुरुआत',
            'तुलना', 'तुलना करो', 'तुलना करें',
            'गणना', 'हिसाब', 'कैलकुलेट',
            // Marathi
            'सुरू', 'सुरु', 'चालू करा'
        ])) {
            console.log('[Voice] -> Running Analysis');
            window.dispatchEvent(new CustomEvent('voice-run-analysis'));
            setStatus('success');
            executed = true;
        }

        // ========== TRY REGISTERED COMMANDS (for page-specific actions) ==========
        if (!executed) {
            const commands = Array.from(commandRegistry.current.values())
                .sort((a, b) => (b.priority || 0) - (a.priority || 0));

            console.log('[Voice] Checking', commands.length, 'registered commands');

            for (const cmd of commands) {
                // Skip global nav commands (we handle those above)
                if (cmd.id.startsWith('global_nav_')) continue;

                for (const keyword of cmd.keywords) {
                    if (hasWord([keyword.toLowerCase()])) {
                        console.log('[Voice] Matched command:', cmd.id, 'with keyword:', keyword);

                        if (cmd.requiresEntity && cmd.entityType === 'crop') {
                            const entity = findCropMatch(transcriptText, availableEntities.current);
                            if (entity) {
                                cmd.action(entity.id);
                                setStatus('success');
                                executed = true;
                                break;
                            }
                        } else {
                            cmd.action();
                            setStatus('success');
                            executed = true;
                            break;
                        }
                    }
                }
                if (executed) break;
            }
        }

        // ========== FALLBACK: NLP PARSING ==========
        if (!executed) {
            console.log('[Voice] Trying NLP parsing...');
            const parsed = parseTranscript(transcriptText);
            setLastResult(parsed);
            console.log('[Voice] NLP result:', parsed);

            if (parsed.target) {
                const route = getRoutePath(parsed.target);
                console.log('[Voice] NLP -> Navigating to:', route);
                navigate(route);
                setStatus('success');
                executed = true;
            }
        }

        // ========== NO MATCH ==========
        if (!executed) {
            console.log('[Voice] No match found for:', transcriptText);
            setStatus('error');
            setErrorMessage(`Didn't understand: "${transcriptText}"`);
        }

        // Reset to idle after feedback
        setTimeout(() => setStatus('idle'), 2000);

    }, [navigate]);

    // Keep processCommandRef updated with latest processCommand
    useEffect(() => {
        processCommandRef.current = processCommand;
    }, [processCommand]);

    // ============ PUBLIC API ============

    const startListening = useCallback(() => {
        if (!isSupported || !recognitionRef.current) {
            setErrorMessage('Voice control not supported in this browser');
            return;
        }

        try {
            recognitionRef.current.start();
        } catch (err) {
            // Already listening or other error
            console.error('Failed to start recognition:', err);
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setStatus('idle');
    }, []);

    const toggleListening = useCallback(() => {
        if (status === 'listening') {
            stopListening();
        } else if (status === 'idle') {
            startListening();
        }
    }, [status, startListening, stopListening]);

    const setLanguage = useCallback((lang: 'en-US' | 'hi-IN' | 'mr-IN') => {
        setLanguageState(lang);
    }, []);

    const registerCommands = useCallback((commands: VoiceCommand[]) => {
        commands.forEach(cmd => {
            commandRegistry.current.set(cmd.id, cmd);
        });
    }, []);

    const unregisterCommands = useCallback((commandIds: string[]) => {
        commandIds.forEach(id => {
            commandRegistry.current.delete(id);
        });
    }, []);

    const getAvailableCommands = useCallback(() => {
        return Array.from(commandRegistry.current.values());
    }, []);

    const setAvailableEntities = useCallback((entities: { id: string; name: string }[]) => {
        availableEntities.current = entities;
    }, []);

    // ============ DEFAULT GLOBAL COMMANDS ============

    useEffect(() => {
        // Register global navigation commands with EXTENSIVE keyword coverage
        registerCommands([
            {
                id: 'global_nav_home',
                keywords: [
                    // English
                    'home', 'homepage', 'dashboard', 'main', 'start', 'beginning', 'first',
                    // Hindi romanized
                    'ghar', 'mukhya', 'shuru', 'pehla', 'pahla',
                    // Hindi Devanagari
                    'घर', 'मुख्य', 'शुरू', 'पहला', 'होम', 'डैशबोर्ड',
                    // Marathi
                    'मुख्यपृष्ठ',
                    // Common phrases
                    'go home', 'take me home', 'main page', 'front page'
                ],
                description: 'Go to Dashboard',
                action: () => navigate('/'),
                priority: 5,
            },
            {
                id: 'global_nav_profit',
                keywords: [
                    // English
                    'profit', 'profits', 'analysis', 'analyze', 'analyse', 'analytics',
                    'money', 'earnings', 'income', 'revenue', 'compare', 'comparison',
                    'calculate', 'calculator', 'cost', 'benefit', 'roi',
                    // Hindi romanized
                    'munafa', 'fayda', 'paisa', 'paise', 'kamai', 'aay', 'amdani',
                    'tulna', 'vishleshan', 'ganana', 'hisab',
                    // Hindi Devanagari
                    'मुनाफा', 'फायदा', 'पैसा', 'पैसे', 'कमाई', 'आय', 'आमदनी',
                    'तुलना', 'विश्लेषण', 'गणना', 'हिसाब', 'प्रॉफिट',
                    // Marathi
                    'नफा', 'फायदा', 'उत्पन्न',
                    // Common phrases
                    'show profit', 'check profit', 'profit page', 'analysis page',
                    'how much money', 'earnings page', 'kitna paisa', 'kitna milega'
                ],
                description: 'Go to Profit Analysis',
                action: () => navigate('/analysis'),
                priority: 5,
            },
            {
                id: 'global_nav_market',
                keywords: [
                    // English
                    'market', 'markets', 'marketplace', 'bazaar', 'bazar', 'leaderboard',
                    'prices', 'price', 'rates', 'rate', 'trading', 'trade', 'sell', 'buy',
                    'commodity', 'commodities', 'crops', 'vegetables',
                    // Hindi romanized
                    'mandi', 'bazaar', 'bazar', 'haat', 'daam', 'bhav', 'bhaw',
                    'khareed', 'bech', 'bechna', 'kharidna', 'keemat', 'kimat',
                    // Hindi Devanagari
                    'मंडी', 'बाजार', 'हाट', 'दाम', 'भाव', 'खरीद', 'बेच', 'कीमत', 'मार्केट',
                    // Marathi
                    'बाजारपेठ', 'भाव', 'किंमत', 'विक्री',
                    // Common phrases
                    'check prices', 'market prices', 'today rate', 'aaj ka bhav',
                    'what is price', 'crop prices', 'vegetable prices', 'sabzi rate'
                ],
                description: 'Go to Market',
                action: () => navigate('/market'),
                priority: 5,
            },
            {
                id: 'global_nav_profile',
                keywords: [
                    // English
                    'profile', 'profiles', 'settings', 'setting', 'account', 'accounts',
                    'my', 'me', 'myself', 'user', 'personal', 'preferences', 'options',
                    'configuration', 'config', 'edit profile', 'my account',
                    // Hindi romanized
                    'mera', 'meri', 'apna', 'khata', 'setting', 'vyaktigat',
                    // Hindi Devanagari
                    'मेरा', 'मेरी', 'अपना', 'खाता', 'सेटिंग', 'व्यक्तिगत', 'प्रोफाइल',
                    // Marathi
                    'माझे', 'माझी', 'खाते', 'सेटिंग्स',
                    // Common phrases
                    'my profile', 'my settings', 'my account', 'mera profile',
                    'edit settings', 'change settings'
                ],
                description: 'Go to Profile',
                action: () => navigate('/profile'),
                priority: 5,
            },
            {
                id: 'global_nav_farm',
                keywords: [
                    // English
                    'farm', 'farms', 'farming', 'field', 'fields', 'crop', 'crops',
                    'agriculture', 'land', 'soil', 'plant', 'plants', 'cultivation',
                    'harvest', 'grow', 'growing', 'garden',
                    // Hindi romanized
                    'khet', 'kheti', 'fasal', 'fasle', 'zameen', 'jameen',
                    'bhoomi', 'krishi', 'khad', 'beej', 'paudha',
                    // Hindi Devanagari
                    'खेत', 'खेती', 'फसल', 'फसलें', 'जमीन', 'भूमि', 'कृषि', 'फार्म',
                    // Marathi
                    'शेत', 'शेती', 'पीक', 'जमीन',
                    // Common phrases
                    'my farm', 'my field', 'mera khet', 'crop info', 'fasal jankari'
                ],
                description: 'Go to Farm',
                action: () => navigate('/farm'),
                priority: 5,
            },
            {
                id: 'global_nav_back',
                keywords: [
                    // English
                    'back', 'go back', 'return', 'previous', 'prev', 'last',
                    'before', 'backward', 'backwards', 'undo',
                    // Hindi romanized
                    'wapas', 'vapas', 'peeche', 'piche', 'pahle', 'pehle',
                    // Hindi Devanagari
                    'वापस', 'पीछे', 'पहले',
                    // Marathi
                    'मागे', 'परत', 'आधी',
                    // Common phrases
                    'go back', 'take me back', 'peeche jao', 'wapas jao'
                ],
                description: 'Go Back',
                action: () => navigate(-1),
                priority: 6,
            },
        ]);
    }, [navigate, registerCommands]);

    // ============ CONTEXT VALUE ============

    const value: VoiceContextValue = {
        status,
        transcript,
        lastResult,
        errorMessage,
        isSupported,
        language,
        startListening,
        stopListening,
        toggleListening,
        setLanguage,
        registerCommands,
        unregisterCommands,
        getAvailableCommands,
        setAvailableEntities,
    };

    return (
        <VoiceContext.Provider value={value}>
            {children}
        </VoiceContext.Provider>
    );
}

// ============ HOOKS ============

/**
 * Access the voice control context.
 */
export function useVoice(): VoiceContextValue {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error('useVoice must be used within a VoiceProvider');
    }
    return context;
}

/**
 * Register page-specific voice commands.
 * Commands are automatically unregistered when component unmounts.
 * 
 * @example
 * useVoiceCommands([
 *   { id: 'select_crop', keywords: ['select', 'chuno'], action: handleSelect, requiresEntity: true, entityType: 'crop' }
 * ]);
 */
export function useVoiceCommands(commands: VoiceCommand[]) {
    const { registerCommands, unregisterCommands } = useVoice();

    useEffect(() => {
        registerCommands(commands);

        return () => {
            unregisterCommands(commands.map(c => c.id));
        };
    }, [commands, registerCommands, unregisterCommands]);
}

// ============ HELPERS ============

function getErrorMessage(error: string): string {
    switch (error) {
        case 'no-speech':
            return 'No speech detected. Try again.';
        case 'audio-capture':
            return 'Microphone not found.';
        case 'not-allowed':
            return 'Microphone access denied.';
        case 'network':
            return 'Network error. Check connection.';
        case 'aborted':
            return 'Recognition cancelled.';
        default:
            return 'Voice recognition error.';
    }
}

