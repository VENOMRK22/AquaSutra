import React from 'react';
import { ArrowLeft, Shield, Lock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full bg-gray-50 overflow-y-auto no-scrollbar pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Privacy Policy</h1>
            </div>

            <div className="p-6 max-w-2xl mx-auto space-y-8">
                {/* Last Updated */}
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                        <Shield className="fill-current/10" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">Introduction</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        AquaSutra ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by AquaSutra.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        This Privacy Policy applies to our website, and its associated subdomains (collectively, our "Service") alongside our application, AquaSutra. By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
                    </p>
                </div>

                {/* Data Collection */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 px-2">Information We Collect</h2>
                    
                    <div className="bg-white p-5 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <MapPin size={16} />
                            </div>
                            <h3 className="font-semibold text-gray-900">Location Data</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            We collect your location data to provide hyper-local weather forecasts and crop recommendations. This data is essential for the functionality of our precision agriculture features. You can enable or disable location services when you use our Service at any time, through your device settings.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                <Lock size={16} />
                            </div>
                            <h3 className="font-semibold text-gray-900">Personal Data</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you, including but not limited to:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1 ml-1">
                            <li>Email address</li>
                            <li>First name and last name</li>
                            <li>Phone number</li>
                            <li>Farm usage data (crop types, irrigation history)</li>
                        </ul>
                    </div>
                </div>

                {/* Usage */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 px-2">How We Use Your Data</h2>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-3">
                        <p className="text-gray-600 text-sm">We use the collected data for various purposes:</p>
                        <ul className="space-y-3">
                            {[
                                "To provide and maintain our Service",
                                "To notify you about changes to our Service",
                                "To provide customer support",
                                "To gather analysis so that we can improve the Service",
                                "To monitor the usage of the Service",
                                "To detect, prevent and address technical issues",
                                "To provide you with news, special offers and general information"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-600">
                                    <div className="min-w-[6px] h-[6px] rounded-full bg-emerald-500 mt-1.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* AI Disclaimer */}
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <h2 className="text-lg font-bold text-amber-900 mb-2">AI-Generated Content</h2>
                    <p className="text-sm text-amber-800/80 leading-relaxed">
                        Our Service utilizes Artificial Intelligence (AI) to provide farming advice and crop recommendations. While we strive for accuracy, AI-generated content may not always be 100% correct. We recommend consulting with local agricultural experts before making significant financial decisions based solely on AI advice.
                    </p>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 px-2">Contact Us</h2>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <p className="text-gray-600 mb-4">
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="space-y-2 text-sm font-medium text-gray-800">
                            <p>By email: support@aquasutra.com</p>
                            <p>By visiting this page on our website: www.aquasutra.com/contact</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;
