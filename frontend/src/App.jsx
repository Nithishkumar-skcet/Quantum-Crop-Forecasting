import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import RecommendationPage from './pages/RecommendationPage';
import EnvironmentalPage from './pages/EnvironmentalPage';
import PerformancePage from './pages/PerformancePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <LandingPage setActivePage={setActivePage} />;
      case 'dashboard':
        return <DashboardPage setActivePage={setActivePage} />;
      case 'predict':
        return <PredictionPage />;
      case 'recommend':
        return <RecommendationPage />;
      case 'environment':
        return <EnvironmentalPage />;
      case 'performance':
        return <PerformancePage />;
      case 'about':
        return <AboutPage />;
      case 'login':
        return <LoginPage setActivePage={setActivePage} />;
      case 'signup':
        return <SignupPage setActivePage={setActivePage} />;
      default:
        return <LandingPage setActivePage={setActivePage} />;
    }
  };

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        
        <main style={{ flex: 1 }}>
          {renderPage()}
        </main>

        <footer style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 0',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '13px',
          background: 'rgba(7, 10, 18, 0.95)'
        }}>
          <div className="container">
            Quantum-Assisted Smart Agriculture – Crop Yield Forecasting & Recommendation System © 2026
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
