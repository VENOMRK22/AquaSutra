import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Sprout, Tractor, Pencil, X } from 'lucide-react';
import WaterForecastModal from '../components/WaterForecastModal';
import CropPlanWizard from '../components/CropPlanWizard'; // Import
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../lib/config';

interface Crop {
    id: string;
    name: string;      // User defined specific name
    crop_type: string; // Water consumption category (High/Medium/Low)
    soil_type: string; // Clay, Black, Sandy, Loamy
    area: number;
    sowing_date: string;
}

interface Farm {
    id: string;
    name: string;
    total_area: number;
}

const FarmDashboard: React.FC = () => {
    const { t } = useLanguage();
    const [farm, setFarm] = useState<Farm | null>(null);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showWizard, setShowWizard] = useState(false); // Wizard State

    // Forecast Modal State
    const [selectedForecastCrop, setSelectedForecastCrop] = useState<Crop | null>(null);
    const [showForecast, setShowForecast] = useState(false);
    const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);

    // Form State
    const [newCropName, setNewCropName] = useState('');
    const [newCropWaterCat, setNewCropWaterCat] = useState('Medium'); // Default to Medium
    const [newSoilType, setNewSoilType] = useState('Clay');
    const [newCropArea, setNewCropArea] = useState('');

    // Farm Edit State
    const [newTotalArea, setNewTotalArea] = useState('');
    const [newVillage, setNewVillage] = useState('');


    useEffect(() => {
        fetchFarmData();
        navigator.geolocation.getCurrentPosition(
            (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => console.log("Loc error", err)
        );
    }, []);

    const fetchFarmData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const res = await fetch(`http://localhost:3000/api/farm?userId=${user.id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();

            if (json.farm) {
                setFarm(json.farm);
                if (json.farm.total_area === 0) setShowSetupModal(true);
            } else {
                setShowSetupModal(true);
            }

            // Fetch Profile for Village
            const { data: profile } = await supabase.from('profiles').select('village').eq('id', user.id).single();
            if (profile && profile.village) setNewVillage(profile.village);

            if (json.crops) setCrops(json.crops);
        } catch (err) {
            console.error("Fetch Farm Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFarm = async () => {
        if (!newTotalArea) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in.");
                return;
            }

            const res = await fetch(`http://localhost:3000/api/farm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    total_area: parseFloat(newTotalArea),
                    name: "My Farm"
                })
            });

            // Save Village (Directly via Supabase to pass RLS)
            if (newVillage) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        village: newVillage,
                        username: user.email?.split('@')[0] || 'User', // Fallback for new profile
                        full_name: user.user_metadata?.full_name || 'Farmer',
                        updated_at: new Date()
                    }, { onConflict: 'id' });

                if (profileError) {
                    console.error("Profile Save Error:", profileError);
                } else {
                    console.log("Village Saved Successfully:", newVillage);
                }
            }

            const updatedFarm = await res.json();



            if (updatedFarm && !updatedFarm.error) {
                setFarm(updatedFarm);
                setShowSetupModal(false);
                setNewTotalArea('');
            } else {
                alert(`Error: ${updatedFarm.error || "Unknown Error"}`);
            }
        } catch (err) {
            console.error("Setup Fetch Error:", err);
            alert("Connection error.");
        }
    };

    const handleAddCrop = async () => {
        if (!farm) {
            alert("Farm not set up. Please refresh.");
            setShowSetupModal(true);
            return;
        }
        if (!newCropArea || !newCropName) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/farm/crop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmId: farm.id,
                    name: newCropName,
                    crop_type: newCropWaterCat, // Save Water Category (High/Med/Low) here
                    soil_type: newSoilType,
                    area: parseFloat(newCropArea),
                    sowing_date: new Date().toISOString()
                })
            });
            const newCrop = await res.json();
            if (newCrop && !newCrop.error) {
                setCrops([...crops, newCrop]);
                setShowAddModal(false);
                // Reset Form
                setNewCropName('');
                setNewCropArea('');
                setNewCropWaterCat('Medium');
                setNewSoilType('Clay');
            } else {
                alert("Failed to save crop. Did you run the Database Migration?");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCrop = async (id: string) => {
        try {
            await fetch(`http://localhost:3000/api/farm/crop/${id}`, { method: 'DELETE' });
            setCrops(crops.filter(c => c.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const runHydroEngine = async (params: any) => {
        if (!coords) {
            alert("Please enable location services first.");
            return;
        }
        const payload = {
            ...params,
            lat: coords.lat,
            lon: coords.lon,
            soilType: 'Medium' // Mock for now, would come from Map later
        };

        const res = await fetch(`${API_BASE_URL}/api/inference/crop-recommendation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    };

    const openForecast = (crop: Crop) => {
        setSelectedForecastCrop(crop);
        setShowForecast(true);
    };

    const openEditFarm = () => {
        setNewTotalArea(farm?.total_area.toString() || '');
        setShowSetupModal(true);
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Elegant Header with Gradient & Image - REDUCED HEIGHT */}
            <div
                className="relative px-6 pt-6 pb-20 rounded-b-[2rem] shadow-xl text-white overflow-hidden"
                style={{
                    backgroundImage: "url('/farm-header-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-emerald-800/70 to-black/30 backdrop-blur-[1px]"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{t('farm.title')}</h1>
                            <p className="text-green-100 opacity-90 text-xs mt-0.5">{t('farm.subtitle')}</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-white/20 backdrop-blur-md p-2.5 rounded-full hover:bg-white/30 transition-all active:scale-95 shadow-lg border border-white/10"
                        >
                            <Plus size={20} className="text-white" />
                        </button>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-[10px] font-bold uppercase tracking-wider mb-1">{t('farm.total_land')}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">{farm?.total_area || 0}</span>
                                <span className="text-sm font-medium opacity-80">{t('farm.acres')}</span>
                            </div>
                        </div>
                        <button
                            onClick={openEditFarm}
                            className="p-2.5 bg-white text-green-700 rounded-xl shadow-md active:scale-95 transition-transform hover:bg-gray-50"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid - ADJUSTED MARGIN */}
            <div className="grid grid-cols-2 gap-3 px-5 -mt-10 relative z-20 mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-800">{crops.length}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('farm.crops')}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-green-600">{crops.reduce((a, c) => a + Number(c.area), 0)}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('farm.acres_planted')}</span>
                </div>
            </div>

            {/* AI PLANNER ENTRY POINT */}
            <div className="px-5 mb-8">
                <div
                    onClick={() => setShowWizard(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[1.5rem] p-6 shadow-xl shadow-blue-200/50 text-white flex items-center justify-between relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
                >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded text-blue-50 border border-blue-400/30">NEW</span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">{t('farm.plan_next_season')}</h3>
                        <p className="text-blue-100 text-xs font-medium opacity-90 mt-1">{t('farm.plan_subtitle')}</p>
                    </div>

                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm border border-white/10 relative z-10">
                        <Sprout size={24} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Crop List */}
            <div className="px-6 space-y-5">
                <h2 className="text-xl font-bold text-gray-900 px-1">{t('farm.active_crops')}</h2>

                {crops.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <Sprout size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{t('farm.no_crops')}</h3>
                        <p className="text-gray-400 text-sm mt-1 mb-4">{t('farm.add_first_crop')}</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-green-600 font-bold text-sm bg-green-50 px-6 py-2 rounded-full hover:bg-green-100 transition-colors"
                        >
                            {t('farm.add_crop_now')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {crops.map(crop => (
                            <div key={crop.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 flex justify-between items-center group active:scale-[0.99] transition-transform">
                                <div
                                    className="flex items-center gap-5 flex-1 cursor-pointer"
                                    onClick={() => openForecast(crop)}
                                >
                                    {/* Large Icon */}
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner text-white
                                        ${crop.crop_type === 'High' ? 'bg-blue-500 shadow-blue-200' :
                                            crop.crop_type === 'Medium' ? 'bg-green-500 shadow-green-200' :
                                                'bg-orange-400 shadow-orange-200'}`}>
                                        {crop.name ? crop.name[0].toUpperCase() : 'C'}
                                    </div>

                                    {/* Clean Info */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-xl tracking-tight">{crop.name || 'Unknown Crop'}</h3>
                                        <p className="text-gray-500 font-medium text-sm mt-0.5">{crop.area} {t('farm.acres')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                                    <button
                                        onClick={() => handleDeleteCrop(crop.id)}
                                        className="w-10 h-10 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Wizard Modal */}
            <CropPlanWizard
                isOpen={showWizard}
                onClose={() => setShowWizard(false)}
                currentFarmArea={farm?.total_area}
                onApplyParams={runHydroEngine}
            />

            {/* Add Crop Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-scale-up relative max-h-[90vh] overflow-y-auto hide-scrollbar">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('farm.add_new_crop')}</h3>

                        <div className="space-y-4">
                            {/* 1. Crop Name */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">{t('farm.crop_name')}</label>
                                <input
                                    type="text"
                                    value={newCropName}
                                    onChange={(e) => setNewCropName(e.target.value)}
                                    placeholder={t('farm.crop_name_placeholder')}
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-lg text-gray-900 focus:ring-2 focus:ring-black outline-none"
                                />
                            </div>

                            {/* 2. Water Category */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">{t('farm.water_consumption')}</label>
                                <select
                                    value={newCropWaterCat}
                                    onChange={(e) => setNewCropWaterCat(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-semibold text-gray-800 focus:ring-2 focus:ring-black outline-none appearance-none"
                                >
                                    <option value="High">High (e.g. Rice, Sugarcane)</option>
                                    <option value="Medium">Medium (e.g. Cotton, Wheat)</option>
                                    <option value="Low">Low (e.g. Millet, Pulses)</option>
                                </select>
                            </div>

                            {/* 3. Soil Type */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">{t('farm.soil_type')}</label>
                                <select
                                    value={newSoilType}
                                    onChange={(e) => setNewSoilType(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-semibold text-gray-800 focus:ring-2 focus:ring-black outline-none appearance-none"
                                >
                                    <option value="Clay">Clay (Heavy, Retains Water)</option>
                                    <option value="Black">Black Cotton (Rich)</option>
                                    <option value="Loamy">Loamy (Balanced)</option>
                                    <option value="Sandy">Sandy (Drains Fast)</option>
                                </select>
                            </div>

                            {/* 4. Area */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">{t('farm.area')}</label>
                                <input
                                    type="number"
                                    value={newCropArea}
                                    onChange={(e) => setNewCropArea(e.target.value)}
                                    placeholder="e.g. 2.5"
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-lg text-gray-900 focus:ring-2 focus:ring-black outline-none"
                                />
                            </div>

                            <button
                                onClick={handleAddCrop}
                                className="w-full py-4 bg-black text-white font-bold text-lg rounded-2xl shadow-xl shadow-gray-400/50 active:scale-95 transition-transform mt-4"
                            >
                                {t('farm.save_crop')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Setup / Edit Farm Modal */}
            {showSetupModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-scale-up text-center relative">
                        {farm && ( // Show close button only if farm already exists (Editing mode)
                            <button
                                onClick={() => setShowSetupModal(false)}
                                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm">
                            <Tractor size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{farm ? t('farm.update_farm_size') : t('farm.setup_farm')}</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                            {farm ? t('farm.update_msg') : t('farm.welcome_msg')}
                        </p>

                        <div className="mb-4 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t('farm.total_land')}</label>
                            <input
                                type="number"
                                value={newTotalArea}
                                onChange={(e) => setNewTotalArea(e.target.value)}
                                placeholder="e.g. 10"
                                className="w-full bg-transparent p-0 font-bold text-3xl text-gray-900 focus:outline-none placeholder:text-gray-300"
                                autoFocus
                            />
                        </div>

                        <div className="mb-8 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t('farm.village_name')}</label>
                            <input
                                type="text"
                                value={newVillage}
                                onChange={(e) => setNewVillage(e.target.value)}
                                placeholder="e.g. Rampur"
                                className="w-full bg-transparent p-0 font-bold text-2xl text-gray-900 focus:outline-none placeholder:text-gray-300"
                            />
                        </div>



                        <button
                            onClick={handleSaveFarm}
                            disabled={!newTotalArea}
                            className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 hover:bg-green-700"
                        >
                            {farm ? t('farm.update_farm') : t('farm.start_farming')}
                        </button>
                    </div>
                </div>
            )}

            {/* Reuse Forecast Modal */}
            {coords && (
                <WaterForecastModal
                    isOpen={showForecast}
                    onClose={() => setShowForecast(false)}
                    lat={coords.lat}
                    lon={coords.lon}
                    crop={selectedForecastCrop}
                />
            )}
        </div>
    );
};

export default FarmDashboard;
