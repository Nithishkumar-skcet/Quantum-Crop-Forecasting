import React from 'react';
import { Sprout, LayoutDashboard, Cpu, CloudSun, BarChart3, Info, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Sprout },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Yield Prediction', icon: Cpu },
    { id: 'recommend', label: 'Crop Recommendation', icon: Sprout },
    { id: 'environment', label: '2026 Climate Data', icon: CloudSun },
    { id: 'performance', label: 'Model Metrics', icon: BarChart3 },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 10, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '16px 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Sprout size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Quantum<span className="gradient-text">Agri</span>
            </h2>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, letterSpacing: '0.05em' }}>
              SMART YIELD & RECOMMENDATIONS
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isActive ? '#10b981' : '#94a3b8',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Authentication Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <User size={14} color="#10b981" />
                <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 500 }}>
                  {user.fullName || user.username}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '13px' }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActivePage('login')}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <LogIn size={14} />
                Login
              </button>
              <button
                onClick={() => setActivePage('signup')}
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <UserPlus size={14} />
                Sign Up
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
