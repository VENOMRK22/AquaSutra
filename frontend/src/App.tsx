import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import FarmDashboard from './pages/FarmDashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import ProfitAnalysis from './pages/ProfitAnalysis'; // New Page
import MarketplacePage from './pages/MarketplacePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { VoiceProvider } from './contexts/VoiceControlContext';
import { VoiceMicButton } from './components/VoiceMicButton';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <VoiceProvider>
            <div className="h-full w-full bg-gray-100 flex justify-center selection:bg-ios-blue/30 selection:text-ios-blue fixed inset-0 overflow-hidden">
              {/* Mobile-first constraints: Max width for "App" feel on desktop, full width on mobile. No bezel. */}
              <div className="w-full max-w-md h-full bg-ios-bg relative shadow-2xl overflow-hidden">
                <Routes>
                  <Route path="/login" element={<Landing />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/farm" element={<FarmDashboard />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/market" element={<MarketplacePage />} />
                      <Route path="/interviews" element={<div className="p-6 text-center text-ios-subtext">Interviews (Coming Soon)</div>} />
                      <Route path="/analysis" element={<ProfitAnalysis />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Voice Control Floating Button - Centered and constrained to mobile width */}
                <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md pointer-events-none z-[100]">
                  <VoiceMicButton />
                </div>
              </div>
            </div>
          </VoiceProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;

