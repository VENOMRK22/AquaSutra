import React from 'react';
import { ArrowLeft, Scale, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
                <h1 className="text-lg font-bold text-gray-900">Terms of Service</h1>
            </div>

            <div className="p-6 max-w-2xl mx-auto space-y-8">
                {/* Intro */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                        <Scale className="fill-current/10" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">Agreement to Terms</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and AquaSutra ("we", "us", or "our"), concerning your access to and use of the AquaSutra application and website.
                    </p>
                </div>

                {/* Key Sections */}
                <div className="space-y-6">
                    
                    {/* Disclaimer - Critical for Farming App */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-900 px-2">Agricultural Advice Disclaimer</h2>
                        <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                            <div className="flex gap-3">
                                <AlertTriangle className="text-red-600 shrink-0" size={20} />
                                <p className="text-sm text-red-800 leading-relaxed">
                                    The content provided by AquaSutra, including AI-generated recommendations, weather forecasts, and crop data, is for informational purposes only. It does not constitute professional agricultural or financial advice. 
                                    <br/><br/>
                                    <strong>You rely on this information at your own risk.</strong> We are not liable for any crop failure, financial loss, or resource wastage resulting from the use of our Service.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Intellectual Property */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-900 px-2">Intellectual Property Rights</h2>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                            </p>
                        </div>
                    </div>

                    {/* User Registration */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-900 px-2">User Registration</h2>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-emerald-500 shrink-0 mt-1" size={18} />
                                <p className="text-sm text-gray-600">
                                    You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Limitation of Liability */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-900 px-2">Limitation of Liability</h2>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Contact */}
                <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
                        <HelpCircle size={20} />
                        <h2>Contact Us</h2>
                    </div>
                    <p className="text-sm text-gray-600">
                        In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <strong>legal@aquasutra.com</strong>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default TermsOfService;
