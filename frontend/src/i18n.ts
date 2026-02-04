export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
    [key: string]: {
        en: string;
        hi: string;
        mr: string;
    };
}

export const translations: Translations = {
    // General
    welcome: { en: 'Welcome', hi: 'स्वागत हे', mr: 'स्वागत आहे' },
    continue: { en: 'Continue', hi: 'जारी रखें', mr: 'पुढे जा' },
    submit: { en: 'Submit', hi: 'जमा करें', mr: 'सबमिट करा' },
    loading: { en: 'Loading...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...' },

    // Onboarding - Steps
    selectLanguage: { en: 'Select Language', hi: 'भाषा चुनें', mr: 'भाषा निवडा' },
    personalDetails: { en: 'Personal Details', hi: 'व्यक्तिगत विवरण', mr: 'वैयक्तिक माहिती' },
    locationDetails: { en: 'Location Details', hi: 'स्थान विवरण', mr: 'स्थान तपशील' },
    farmDetails: { en: 'Farm Details', hi: 'खेत का विवरण', mr: 'शेती तपशील' },

    // Onboarding - Fields
    name: { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
    phone: { en: 'Phone Number', hi: 'फोन नंबर', mr: 'फोन नंबर' },
    state: { en: 'State', hi: 'राज्य', mr: 'राज्य' },
    district: { en: 'District', hi: 'ज़िला', mr: 'जिल्हा' },
    taluka: { en: 'Taluka', hi: 'तालुका', mr: 'तालुका' },
    village: { en: 'Village', hi: 'गाँव', mr: 'गाव' },
    totalLand: { en: 'Total Land (Acres)', hi: 'कुल भूमि (एकड़)', mr: 'एकूण जमीन (एकर)' },
    numberOfWells: { en: 'Number of Wells', hi: 'कुओं की संख्या', mr: 'विहिरींची संख्या' },
    avgDepth: { en: 'Average Depth (Feet)', hi: 'औसत गहराई (फीट)', mr: 'सरासरी खोली (फूट)' },

    // Dashboard
    dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
    waterBalance: { en: 'Water Balance', hi: 'जल संतुलन', mr: 'पाणी शिल्लक' },
    cropHealth: { en: 'Crop Health', hi: 'फसल स्वास्थ्य', mr: 'पिकाचे आरोग्य' },
    groundwaterTrends: { en: 'Groundwater Trends', hi: 'भूजल रुझान', mr: 'भूजल कल' },
};
