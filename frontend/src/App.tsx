import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmDashboard from './pages/FarmDashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import ProfitAnalysis from './pages/ProfitAnalysis'; // New Page
import MarketplacePage from './pages/MarketplacePage';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100 flex justify-center selection:bg-ios-blue/30 selection:text-ios-blue">
            {/* Mobile-first constraints: Max width for "App" feel on desktop, full width on mobile. No bezel. */}
            <div className="w-full max-w-md min-h-screen bg-ios-bg relative shadow-2xl overflow-x-hidden">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

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
            </div>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter >
  );
};

export default App;
