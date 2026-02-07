/**
 * SpeechUtils.ts
 * 
 * Core NLP logic for multilingual voice command processing.
 * Handles Hinglish (Hindi-English) and Marathi code-switching.
 */

// ============ MULTILINGUAL DICTIONARIES ============

/**
 * Intent keywords mapped across languages.
 * Each intent has keywords in English, Hindi (Devanagari + Romanized), and Marathi.
 */
export const INTENT_KEYWORDS: Record<string, string[]> = {
    // Navigation Intents
    'navigate': ['go', 'open', 'show', 'navigate', 'जाओ', 'jao', 'खोलो', 'kholo', 'दिखाओ', 'dikhao', 'जा', 'ja', 'उघड', 'ughad'],
    'select': ['select', 'choose', 'pick', 'add', 'चुनो', 'chuno', 'निवडा', 'niwad', 'निवड', 'nivad', 'जोड', 'jod'],
    'remove': ['remove', 'delete', 'हटाओ', 'hatao', 'काढा', 'kadha', 'निकालो', 'nikalo'],
    'back': ['back', 'return', 'previous', 'वापस', 'wapas', 'मागे', 'mage', 'परत', 'parat'],
    'confirm': ['confirm', 'yes', 'okay', 'ok', 'हाँ', 'haan', 'ठीक', 'theek', 'होय', 'hoy'],
    'cancel': ['cancel', 'no', 'stop', 'नहीं', 'nahi', 'रद्द', 'radd', 'नको', 'nako'],
    'analyze': ['analyze', 'compare', 'विश्लेषण', 'vishleshan', 'तुलना', 'tulna', 'analysis'],
    'price': ['price', 'rate', 'cost', 'दाम', 'daam', 'भाव', 'bhav', 'किंमत', 'kimmat'],
};

/**
 * Page/Route keywords mapped across languages.
 * Extensive list for maximum recognition accuracy.
 */
export const PAGE_KEYWORDS: Record<string, string[]> = {
    'home': [
        'home', 'homepage', 'dashboard', 'main', 'start', 'beginning',
        'ghar', 'mukhya', 'shuru', 'pahla',
        'घर', 'मुख्य', 'होम', 'डैशबोर्ड', 'शुरू',
        'मुख्यपृष्ठ'
    ],
    'profit': [
        'profit', 'profits', 'analysis', 'analyze', 'analyse', 'analytics',
        'money', 'earnings', 'income', 'revenue', 'compare', 'comparison',
        'calculate', 'calculator', 'cost', 'benefit', 'roi',
        'munafa', 'fayda', 'paisa', 'paise', 'kamai', 'tulna', 'vishleshan',
        'मुनाफा', 'फायदा', 'पैसा', 'कमाई', 'तुलना', 'विश्लेषण', 'प्रॉफिट',
        'नफा', 'उत्पन्न'
    ],
    'market': [
        'market', 'markets', 'marketplace', 'bazaar', 'bazar', 'leaderboard',
        'prices', 'price', 'rates', 'rate', 'trading', 'sell', 'buy',
        'commodity', 'commodities',
        'mandi', 'haat', 'daam', 'bhav', 'keemat',
        'मंडी', 'बाजार', 'हाट', 'दाम', 'भाव', 'कीमत', 'मार्केट',
        'बाजारपेठ', 'किंमत'
    ],
    'profile': [
        'profile', 'profiles', 'settings', 'setting', 'account', 'accounts',
        'my', 'me', 'myself', 'user', 'personal', 'preferences', 'options',
        'mera', 'meri', 'apna', 'khata',
        'मेरा', 'मेरी', 'खाता', 'सेटिंग', 'प्रोफाइल',
        'माझे', 'खाते'
    ],
    'farm': [
        'farm', 'farms', 'farming', 'field', 'fields', 'crop', 'crops',
        'agriculture', 'land', 'soil', 'plant', 'plants', 'cultivation',
        'khet', 'kheti', 'fasal', 'zameen', 'bhoomi', 'krishi',
        'खेत', 'खेती', 'फसल', 'जमीन', 'भूमि', 'कृषि', 'फार्म',
        'शेत', 'शेती', 'पीक', 'जमीन'
    ],
    'leaderboard': [
        'leaderboard', 'leader', 'leaders', 'top', 'ranking', 'rank', 'ranks',
        'best', 'winners', 'competition',
        'शीर्ष', 'रैंकिंग'
    ],
};

/**
 * Common crop names in multiple languages for entity matching.
 * Maps to crop IDs used in the system.
 */
export const CROP_ALIASES: Record<string, string[]> = {
    'cotton_bt': ['cotton', 'kapas', 'कपास', 'कापूस', 'kapus', 'bt cotton'],
    'sugarcane_1': ['sugarcane', 'ganna', 'गन्ना', 'ऊस', 'oos', 'us', 'cane'],
    'soybean_js335': ['soybean', 'soya', 'सोयाबीन', 'soyabean'],
    'wheat_lokwan': ['wheat', 'gehun', 'गेहूं', 'गहू', 'gahu'],
    'gram_chana': ['gram', 'chana', 'चना', 'हरभरा', 'harbhara'],
    'onion_red': ['onion', 'pyaaz', 'pyaj', 'प्याज', 'कांदा', 'kanda'],
    'tomato_hybrid': ['tomato', 'tamatar', 'टमाटर', 'टोमॅटो'],
    'rice_basmati': ['rice', 'chawal', 'चावल', 'तांदूळ', 'tandool', 'basmati'],
    'maize_kharif': ['maize', 'corn', 'makka', 'मक्का', 'मका'],
    'groundnut_bold': ['groundnut', 'peanut', 'moongfali', 'मूंगफली', 'शेंगदाणे', 'shengdane'],
    'tur_red': ['tur', 'toor', 'arhar', 'तूर', 'अरहर'],
    'pomegranate_bhagwa': ['pomegranate', 'anar', 'अनार', 'डाळिंब', 'dalimb'],
};

// ============ FUZZY MATCHING ============

/**
 * Levenshtein distance for fuzzy string matching.
 * Allows matching despite typos or phonetic variations.
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Check if a word fuzzy-matches any keyword in a list.
 * Returns true if Levenshtein distance is within threshold.
 */
export function fuzzyMatch(word: string, keywords: string[], threshold: number = 2): string | null {
    const normalizedWord = word.toLowerCase().trim();

    for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim();

        // Exact match
        if (normalizedWord === normalizedKeyword) {
            return keyword;
        }

        // Fuzzy match (only for words > 3 chars to avoid false positives)
        if (normalizedWord.length > 3 && normalizedKeyword.length > 3) {
            const distance = levenshteinDistance(normalizedWord, normalizedKeyword);
            if (distance <= threshold) {
                return keyword;
            }
        }
    }

    return null;
}

// ============ INTENT PARSING ============

export interface ParsedIntent {
    intent: string | null;      // e.g., 'navigate', 'select'
    target: string | null;      // e.g., 'profit', 'home' (page)
    entity: string | null;      // e.g., 'cotton_bt' (crop ID)
    confidence: number;         // 0-1 score
    rawTranscript: string;
}

/**
 * Parse a multilingual transcript into an intent.
 * Handles code-switching (mixing languages in one sentence).
 * 
 * @example
 * parseTranscript("Kapas select karo") 
 * // => { intent: 'select', entity: 'cotton_bt', confidence: 0.9 }
 * 
 * parseTranscript("Show profit page")
 * // => { intent: 'navigate', target: 'profit', confidence: 0.95 }
 */
export function parseTranscript(transcript: string): ParsedIntent {
    const result: ParsedIntent = {
        intent: null,
        target: null,
        entity: null,
        confidence: 0,
        rawTranscript: transcript,
    };

    if (!transcript || transcript.trim().length === 0) {
        return result;
    }

    // Normalize and tokenize
    const normalized = transcript.toLowerCase().trim();
    const tokens = normalized.split(/\s+/);

    let intentMatches = 0;
    let totalChecks = 0;

    // 1. Find Intent (what action to perform)
    for (const token of tokens) {
        for (const [intentName, keywords] of Object.entries(INTENT_KEYWORDS)) {
            totalChecks++;
            const match = fuzzyMatch(token, keywords);
            if (match) {
                result.intent = intentName;
                intentMatches++;
                break;
            }
        }
        if (result.intent) break;
    }

    // 2. Find Target Page (for navigation intents)
    for (const token of tokens) {
        for (const [pageName, keywords] of Object.entries(PAGE_KEYWORDS)) {
            totalChecks++;
            const match = fuzzyMatch(token, keywords);
            if (match) {
                result.target = pageName;
                intentMatches++;
                break;
            }
        }
        if (result.target) break;
    }

    // 3. Find Entity (crop, item, etc.)
    for (const token of tokens) {
        for (const [cropId, aliases] of Object.entries(CROP_ALIASES)) {
            totalChecks++;
            const match = fuzzyMatch(token, aliases, 3); // Slightly higher threshold for crop names
            if (match) {
                result.entity = cropId;
                intentMatches++;
                break;
            }
        }
        if (result.entity) break;
    }

    // 4. Infer intent if not explicitly stated
    if (!result.intent) {
        if (result.target) {
            result.intent = 'navigate';  // "Profit page" implies navigation
            intentMatches++;
        } else if (result.entity) {
            result.intent = 'select';    // "Cotton" alone implies selection
            intentMatches++;
        }
    }

    // 5. Calculate confidence
    if (totalChecks > 0 && intentMatches > 0) {
        // Higher confidence if multiple matches found
        result.confidence = Math.min(0.95, 0.5 + (intentMatches * 0.15));
    }

    return result;
}

/**
 * Find the best matching crop ID from a list of available crops.
 * Uses fuzzy matching to handle phonetic variations.
 */
export function findCropMatch(
    spokenName: string,
    availableCrops: { id: string; name: string }[]
): { id: string; name: string } | null {
    const normalized = spokenName.toLowerCase().trim();

    // First, check against our known aliases
    for (const [cropId, aliases] of Object.entries(CROP_ALIASES)) {
        const match = fuzzyMatch(normalized, aliases, 3);
        if (match) {
            // Find this crop in available list
            const found = availableCrops.find(c => c.id === cropId);
            if (found) return found;
        }
    }

    // Second, try direct fuzzy match against available crop names
    for (const crop of availableCrops) {
        const cropNameLower = crop.name.toLowerCase();
        if (cropNameLower.includes(normalized) || normalized.includes(cropNameLower.split(' ')[0])) {
            return crop;
        }

        // Fuzzy match on crop name
        const tokens = cropNameLower.split(/[\s()]+/);
        for (const token of tokens) {
            if (token.length > 2 && levenshteinDistance(normalized, token) <= 2) {
                return crop;
            }
        }
    }

    return null;
}

// ============ UTILITY FUNCTIONS ============

/**
 * Get the route path for a target page.
 */
export function getRoutePath(target: string): string {
    const routes: Record<string, string> = {
        'home': '/',
        'dashboard': '/',
        'profit': '/analysis',
        'analysis': '/analysis',
        'market': '/market',
        'profile': '/profile',
        'farm': '/farm',
        'leaderboard': '/leaderboard',
    };
    return routes[target] || '/';
}

/**
 * Convert confidence score to human-readable text for UI feedback.
 */
export function getConfidenceLabel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
}
