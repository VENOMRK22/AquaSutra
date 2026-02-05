import React, { createContext, useContext, useState, useEffect } from 'react';

// INLINE TYPE DEFINITION TO REMOVE DEPENDENCY
export type Language = 'en' | 'mr' | 'hi';

// INLINE TRANSLATIONS
const localTranslations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.farm': 'Farm',
        'nav.market': 'Market',
        'nav.profile': 'Profile',
        'nav.camera': 'Camera',

        // Dashboard
        'dashboard.header': 'Water Productivity',
        'dashboard.profit_per_drop': 'Profit per Drop',
        'dashboard.per_kl': 'Per kL',
        'dashboard.setup_farm': 'Setup your Farm',
        'dashboard.start_tracking': 'Start tracking profit',
        'dashboard.loading': 'Loading...',
        'dashboard.checking_location': 'Checking Location...',
        'dashboard.interview': 'Interview',
        'dashboard.start_survey': 'Start a new survey',
        'dashboard.credit_score': 'Credit Score',
        'dashboard.check_health': 'Check farm health',
        'dashboard.activity': 'Activity',
        'dashboard.see_all': 'See All',

        // Water Balance Widget
        'widget.water_balance': 'Water Balance',
        'widget.mm_depth': 'mm (Depth)',
        'widget.burn_rate': 'Burn Rate',
        'widget.soil_losing': 'Soil losing',
        'widget.connect_gps': 'Connect GPS for analysis',
        'widget.live_status': 'Live Status',

        // Leaderboard / Market
        'leaderboard.market_efficiency': 'Market & Efficiency',
        'leaderboard.your_efficiency_score': 'Your Efficiency Score',
        'leaderboard.efficiency_explanation_1': 'For every 1000 Liters of water you use, you earn roughly',
        'leaderboard.efficiency_explanation_2': 'in profit.',
        'leaderboard.add_crops': 'Add crops to calculate your score!',
        'leaderboard.loading_stats': 'Loading your stats...',

        // Water Forecast
        'forecast.title': 'Water Forecast',
        'forecast.180_day_plan': '180-Day Plan',
        'forecast.water_category': 'Water Category',
        'forecast.interventions': 'Interventions (Save Water)',
        'forecast.drip_irrigation': 'Drip Irrigation',
        'forecast.mulching': 'Use Mulching',
        'forecast.saves_40': 'Saves ~40% Water',
        'forecast.saves_20': 'Saves ~20% Water',
        'forecast.running_model': 'Running Physics Model...',
        'forecast.today': 'Today',
        'forecast.3_months': '3 Months',
        'forecast.6_months': '6 Months',
        'forecast.inflow': 'Inflow',
        'forecast.expected_rain': 'Expected Rain',
        'forecast.stress': 'Stress',
        'forecast.days': 'days',
        'forecast.below_wilting': 'Below Wilting Point',
        'forecast.soil_capacity': 'Soil Capacity',
        'forecast.crop_water_use': 'Crop Water Use',
        'forecast.analysis': 'Analysis',
        'forecast.planting': 'Planting',
        'forecast.water_use_crops': 'Water Use crops',
        'forecast.is_risky': 'is RISKY.',
        'forecast.is_safe': 'is SAFE.',
        'forecast.stress_begins': 'Water stress begins on Day',
        'forecast.consider_irrigation': 'Consider irrigation or switching to a less thirsty crop.',
        'forecast.safe_msg': 'Water levels stay above the danger zone for 6 months.',
        'forecast.no_data': 'No Forecast Data',
        'forecast.check_connection': 'Try checking your location permissions or internet connection.',

        // Profile
        'profile.title': 'Profile',
        'profile.language': 'Language / भाषा',
        'profile.save': 'Save Changes',
        'profile.village': 'Village',
        'profile.name': 'Full Name',
        'profile.phone': 'Phone Number',

        // Farm
        'farm.title': 'My Farm',
        'farm.subtitle': 'Manage your crops & water',
        'farm.total_land': 'Total Land',
        'farm.acres': 'Acres',
        'farm.crops': 'Crops',
        'farm.acres_planted': 'Acres Planted',
        'farm.active_crops': 'Active Crops',
        'farm.no_crops': 'No crops yet',
        'farm.add_first_crop': 'Add your first crop to see forecasts',
        'farm.add_crop_now': 'Add Crop Now',
        'farm.add_new_crop': 'Add New Crop',
        'farm.crop_name': 'Crop Name',
        'farm.crop_name_placeholder': 'e.g. Wheat, Tomato',
        'farm.water_consumption': 'Water Consumption',
        'farm.soil_type': 'Soil Type',
        'farm.area': 'Area (Acres)',
        'farm.save_crop': 'Save Crop',
        'farm.update_farm_size': 'Update Farm Size',
        'farm.setup_farm': 'Setup Your Farm',
        'farm.update_msg': 'Update your total land area to keep your records accurate.',
        'farm.welcome_msg': 'Welcome! To help you plan better, tell us the Total Area of your land.',
        'farm.update_farm': 'Update Farm',
        'farm.start_farming': 'Start Farming',
        'farm.village_name': 'Village Name',
        'farm.plan_next_season': 'Plan Next Season',
        'farm.plan_subtitle': 'AI-driven crop advice',
        'wizard.step1_title': 'Plan Next Season',
        'wizard.step1_desc': 'Tell us a bit about your land to get AI-powered recommendations.',
        'wizard.step2_title': 'Your Best Crops',
        'wizard.step2_desc': 'Based on your soil, region, and water availability.',
        'wizard.pincode_label': 'Pincode (For Weather/Zone)',
        'wizard.prev_crop_label': 'Previous Crop (For Soil Health)',
        'wizard.intent_label': 'What do you want to plant?',
        'wizard.intent_hint': 'We will compare this with smarter options.',
    },
    mr: {
        // Navigation
        'nav.home': 'घर',
        'nav.farm': 'शेत',
        'nav.market': 'बाजार',
        'nav.profile': 'प्रोफाइल',
        'nav.camera': 'कॅमेरा',

        // Dashboard
        'dashboard.header': 'पाणी उत्पादकता',
        'dashboard.profit_per_drop': 'नफा प्रति थेंब',
        'dashboard.per_kl': 'प्रति हजार लिटर',
        'dashboard.setup_farm': 'शेत जोडा',
        'dashboard.start_tracking': 'नफा ट्रॅकिंग सुरू करा',
        'dashboard.loading': 'लोड होत आहे...',
        'dashboard.checking_location': 'स्थान तपासत आहे...',
        'dashboard.interview': 'मुलाखत',
        'dashboard.start_survey': 'नवीन सर्वेक्षण सुरू करा',
        'dashboard.credit_score': 'क्रेडिट स्कोर',
        'dashboard.check_health': 'शेताचे आरोग्य तपासा',
        'dashboard.activity': 'उपक्रम',
        'dashboard.see_all': 'सर्व पहा',

        // Water Balance Widget
        'widget.water_balance': 'पाणी शिल्लक',
        'widget.mm_depth': 'मिमी (खोली)',
        'widget.burn_rate': 'पाणी कमी होण्याचा दर',
        'widget.soil_losing': 'जमीन गमावत आहे',
        'widget.connect_gps': 'विश्लेषणासाठी GPS कनेक्ट करा',
        'widget.live_status': 'थेट स्थिती',

        // Leaderboard / Market
        'leaderboard.market_efficiency': 'बाजार आणि कार्यक्षमता',
        'leaderboard.your_efficiency_score': 'तुमचा कार्यक्षमता स्कोर',
        'leaderboard.efficiency_explanation_1': 'तुम्ही वापरलेल्या प्रत्येक 1000 लिटर पाण्यासाठी, तुम्हाला अंदाजे',
        'leaderboard.efficiency_explanation_2': 'नफा मिळतो.',
        'leaderboard.add_crops': 'तुमचा स्कोर मोजण्यासाठी पिके जोडा!',
        'leaderboard.loading_stats': 'तुमची आकडेवारी लोड करत आहे...',

        // Water Forecast
        'forecast.title': 'पाणी अंदाज',
        'forecast.180_day_plan': '१८०-दिवसांची योजना',
        'forecast.water_category': 'पाणी श्रेणी',
        'forecast.interventions': 'उपाययोजना (पाणी वाचवा)',
        'forecast.drip_irrigation': 'ठिबक सिंचन',
        'forecast.mulching': 'मल्चिंग वापरा',
        'forecast.saves_40': '~४०% पाणी वाचवते',
        'forecast.saves_20': '~२०% पाणी वाचवते',
        'forecast.running_model': 'भौतिकशास्त्र मॉडेल चालू आहे...',
        'forecast.today': 'आज',
        'forecast.3_months': '३ महिने',
        'forecast.6_months': '६ महिने',
        'forecast.inflow': 'आवक',
        'forecast.expected_rain': 'अपेक्षित पाऊस',
        'forecast.stress': 'ताण',
        'forecast.days': 'दिवस',
        'forecast.below_wilting': 'कोमेजण्याच्या बिंदूच्या खाली',
        'forecast.soil_capacity': 'मातीची क्षमता',
        'forecast.crop_water_use': 'पिकाचा पाणी वापर',
        'forecast.analysis': 'विश्लेषण',
        'forecast.planting': 'लागवड',
        'forecast.water_use_crops': 'पाणी वापर पिके',
        'forecast.is_risky': 'धोकादायक आहे.',
        'forecast.is_safe': 'सुरक्षित आहे.',
        'forecast.stress_begins': 'पाण्याचा ताण दिवसापासून सुरू होतो',
        'forecast.consider_irrigation': 'सिंचनाचा विचार करा किंवा कमी तहानलेल्या पिकावर जा.',
        'forecast.safe_msg': 'पाण्याची पातळी ६ महिन्यांसाठी धोक्याच्या क्षेत्राच्या वर राहते.',
        'forecast.no_data': 'अंदाज डेटा उपलब्ध नाही',
        'forecast.check_connection': 'तुमच्या स्थानाची परवानगी किंवा इंटरनेट कनेक्शन तपासा.',

        // Profile
        'profile.title': 'प्रोफाइल',
        'profile.language': 'भाषा',
        'profile.save': 'बदल जतन करा',
        'profile.village': 'गाव',
        'profile.name': 'पूर्ण नाव',
        'profile.phone': 'फोन नंबर',

        // Farm
        'farm.title': 'माझे शेत',
        'farm.subtitle': 'पिके आणि पाण्याचे नियोजन करा',
        'farm.total_land': 'एकूण जमीन',
        'farm.acres': 'एकर',
        'farm.crops': 'पिके',
        'farm.acres_planted': 'लागवड केलेले एकर',
        'farm.active_crops': 'सक्रिय पिके',
        'farm.no_crops': 'अद्याप पिके नाहीत',
        'farm.add_first_crop': 'अंदाज पाहण्यासाठी तुमचे पहिले पीक जोडा',
        'farm.add_crop_now': 'आता पीक जोडा',
        'farm.add_new_crop': 'नवीन पीक जोडा',
        'farm.crop_name': 'पिकाचे नाव',
        'farm.crop_name_placeholder': 'उदा. गहू, टोमॅटो',
        'farm.water_consumption': 'पाणी वापर',
        'farm.soil_type': 'मातीचा प्रकार',
        'farm.area': 'क्षेत्र (एकर)',
        'farm.save_crop': 'पीक जतन करा',
        'farm.update_farm_size': 'शेताचा आकार अपडेट करा',
        'farm.setup_farm': 'शेत सेट करा',
        'farm.update_msg': 'तुमच्या नोंदी अचूक ठेवण्यासाठी तुमच्या जमिनीचे एकूण क्षेत्र अपडेट करा.',
        'farm.welcome_msg': 'स्वागत आहे! तुम्हाला अधिक चांगले नियोजन करण्यात मदत करण्यासाठी, तुमच्या जमिनीचे एकूण क्षेत्र सांगा.',
        'farm.update_farm': 'शेत अपडेट करा',
        'farm.start_farming': 'शेती सुरू करा',
        'farm.village_name': 'गावाचे नाव',
        'farm.plan_next_season': 'पुढील हंगामाचे नियोजन करा',
        'farm.plan_subtitle': 'AI-आधारित पीक सल्ला',
        'wizard.step1_title': 'पुढील हंगामाचे नियोजन',
        'wizard.step1_desc': 'AI शिफारसी मिळवण्यासाठी आपल्या जमिनीबद्दल थोडी माहिती द्या.',
        'wizard.step2_title': 'तुमची सर्वोत्तम पिके',
        'wizard.step2_desc': 'तुमची माती, विभाग आणि पाणी उपलब्धतेवर आधारित.',
        'wizard.pincode_label': 'पिनकोड (हवामान/विभागासाठी)',
        'wizard.prev_crop_label': 'मागील पीक (माती आरोग्यासाठी)',
        'wizard.intent_label': 'तुम्हाला काय लावायचे आहे?',
        'wizard.intent_hint': 'आम्ही याची तुलना हुशार पर्यायांशी करू.',
    },
    hi: {
        // Navigation
        'nav.home': 'घर',
        'nav.farm': 'खेत',
        'nav.market': 'बाजार',
        'nav.profile': 'प्रोफाइल',
        'nav.camera': 'कैमरा',

        // Dashboard
        'dashboard.header': 'जल उत्पादकता',
        'dashboard.profit_per_drop': 'लाभ प्रति बूंद',
        'dashboard.per_kl': 'प्रति हजार लीटर',
        'dashboard.setup_farm': 'खेत जोड़ें',
        'dashboard.start_tracking': 'लाभ ट्रैकिंग शुरू करें',
        'dashboard.loading': 'लोड हो रहा है...',
        'dashboard.checking_location': 'स्थान की जाँच...',
        'dashboard.interview': 'साक्षात्कार',
        'dashboard.start_survey': 'नया सर्वेक्षण शुरू करें',
        'dashboard.credit_score': 'क्रेडिट स्कोर',
        'dashboard.check_health': 'खेत की स्थिति जांचें',
        'dashboard.activity': 'गतिविधि',
        'dashboard.see_all': 'सभी देखें',

        // Water Balance Widget
        'widget.water_balance': 'जल संतुलन',
        'widget.mm_depth': 'मिमी (गहराई)',
        'widget.burn_rate': 'जल निकासी दर',
        'widget.soil_losing': 'मिट्टी खो रही है',
        'widget.connect_gps': 'विश्लेषण के लिए जीपीएस कनेक्ट करें',
        'widget.live_status': 'लाइव स्थिति',

        // Leaderboard / Market
        'leaderboard.market_efficiency': 'बाजार और दक्षता',
        'leaderboard.your_efficiency_score': 'आपका दक्षता स्कोर',
        'leaderboard.efficiency_explanation_1': 'आपके द्वारा उपयोग किए जाने वाले प्रत्येक 1000 लीटर पानी के लिए, आप लगभग',
        'leaderboard.efficiency_explanation_2': 'लाभ कमाते हैं।',
        'leaderboard.add_crops': 'अपना स्कोर गणना करने के लिए फसलें जोड़ें!',
        'leaderboard.loading_stats': 'आपके आंकड़े लोड हो रहे हैं...',

        // Water Forecast
        'forecast.title': 'जल पूर्वानुमान',
        'forecast.180_day_plan': '१८०-दिवसीय योजना',
        'forecast.water_category': 'जल श्रेणी',
        'forecast.interventions': 'हस्तक्षेप (पानी बचाओ)',
        'forecast.drip_irrigation': 'ड्रिप सिंचाई',
        'forecast.mulching': 'मल्चिंग का उपयोग करें',
        'forecast.saves_40': '~४०% पानी बचाता है',
        'forecast.saves_20': '~२०% पानी बचाता है',
        'forecast.running_model': 'भौतिकी मॉडल चल रहा है...',
        'forecast.today': 'आज',
        'forecast.3_months': '३ महीने',
        'forecast.6_months': '६ महीने',
        'forecast.inflow': 'अंतर्वाह',
        'forecast.expected_rain': 'अपेक्षित वर्षा',
        'forecast.stress': 'तनाव',
        'forecast.days': 'दिन',
        'forecast.below_wilting': 'मुरझाने की बिंदु से नीचे',
        'forecast.soil_capacity': 'मिट्टी की क्षमता',
        'forecast.crop_water_use': 'फसल जल उपयोग',
        'forecast.analysis': 'विश्लेषण',
        'forecast.planting': 'रोपण',
        'forecast.water_use_crops': 'जल उपयोग फसलें',
        'forecast.is_risky': 'जोखिम भरा है।',
        'forecast.is_safe': 'सुरक्षित है।',
        'forecast.stress_begins': 'जल तनाव दिन से शुरू होता है',
        'forecast.consider_irrigation': 'सिंचाई पर विचार करें या कम प्यासी फसल पर स्विच करें।',
        'forecast.safe_msg': 'जल स्तर ६ महीने तक खतरे के क्षेत्र से ऊपर रहता है।',
        'forecast.no_data': 'कोई पूर्वानुमान डेटा नहीं',
        'forecast.check_connection': 'अपनी स्थान अनुमतियाँ या इंटरनेट कनेक्शन जाँचें।',

        // Profile
        'profile.title': 'प्रोफाइल',
        'profile.language': 'भाषा',
        'profile.save': 'परिवर्तन सहेजें',
        'profile.village': 'गाँव',
        'profile.name': 'पूरा नाम',
        'profile.phone': 'फ़ोन नंबर',

        // Farm
        'farm.title': 'मेरा खेत',
        'farm.subtitle': 'फसल और पानी का प्रबंधन करें',
        'farm.total_land': 'कुल जमीन',
        'farm.acres': 'एकड़',
        'farm.crops': 'फसलें',
        'farm.acres_planted': 'रोपित एकड़',
        'farm.active_crops': 'सक्रिय फसलें',
        'farm.no_crops': 'अभी कोई फसल नहीं',
        'farm.add_first_crop': 'पूर्वानुमान देखने के लिए अपनी पहली फसल जोड़ें',
        'farm.add_crop_now': 'फसल अभी जोड़ें',
        'farm.add_new_crop': 'नई फसल जोड़ें',
        'farm.crop_name': 'फसल का नाम',
        'farm.crop_name_placeholder': 'उदा. गेहूं, टमाटर',
        'farm.water_consumption': 'जल की खपत',
        'farm.soil_type': 'मिट्टी का प्रकार',
        'farm.area': 'क्षेत्र (एकड़)',
        'farm.save_crop': 'फसल सहेजें',
        'farm.update_farm_size': 'खेत का आकार अपडेट करें',
        'farm.setup_farm': 'खेत सेट करें',
        'farm.update_msg': 'अपने रिकॉर्ड को सटीक रखने के लिए अपनी कुल भूमि क्षेत्र को अपडेट करें।',
        'farm.welcome_msg': 'स्वागत है! आपको बेहतर योजना बनाने में मदद करने के लिए, हमें अपनी भूमि का कुल क्षेत्र बताएं।',
        'farm.update_farm': 'खेत अपडेट करें',
        'farm.start_farming': 'खेती शुरू करें',
        'farm.village_name': 'गाँव का नाम',
        'farm.plan_next_season': 'अगले सीजन की योजना बनाएं',
        'farm.plan_subtitle': 'AI-संचालित फसल सलाह',
        'wizard.step1_title': 'अगले सीजन की योजना',
        'wizard.step1_desc': 'AI सुझाव पाने के लिए अपनी भूमि के बारे में थोड़ी जानकारी दें।',
        'wizard.step2_title': 'आपकी सर्वोत्तम फसलें',
        'wizard.step2_desc': 'आपकी मिट्टी, क्षेत्र और जल उपलब्धता के आधार पर।',
        'wizard.pincode_label': 'पिनकोड (मौसम/क्षेत्र के लिए)',
        'wizard.prev_crop_label': 'पिछली फसल (मिट्टी के स्वास्थ्य के लिए)',
        'wizard.intent_label': 'आप क्या लगाना चाहते हैं?',
        'wizard.intent_hint': 'हम इसकी तुलना स्मार्ट विकल्पों से करेंगे।',
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        try {
            const savedLang = localStorage.getItem('app-language') as Language;
            if (savedLang && ['en', 'mr', 'hi'].includes(savedLang)) {
                setLanguageState(savedLang);
            }
        } catch (e) {
            console.warn("LocalStorage access failed", e);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem('app-language', lang);
        } catch (e) {
            console.error("Failed to save language", e);
        }
    };

    const t = (key: string): string => {
        const currentLang = localTranslations[language] || localTranslations['en'];
        const val = currentLang[key];
        // Fallback to EN or Key
        if (!val) {
            return localTranslations['en'][key] || key;
        }
        return val;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
