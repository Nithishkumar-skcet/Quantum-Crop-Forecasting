import React from 'react';
import { 
  Sprout, Cpu, CloudSun, ArrowRight, Activity, Database, CheckCircle2, 
  BarChart3, History, Shield, Zap, Layers, Compass, HelpCircle, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ setActivePage }) {
  const { user } = useAuth();

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0 80px 0' }}>
      
      {/* Hero Section */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '80px' }}>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '6px 16px',
          borderRadius: '30px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#10b981',
          marginBottom: '24px'
        }}>
          <CloudSun size={16} />
          <span>POWERED BY GOOGLE EARTH ENGINE 2026 CLIMATE TELEMETRY</span>
        </div>

        <h1 style={{
          fontSize: '52px',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '14px',
          maxWidth: '920px',
          margin: '0 auto 14px auto'
        }}>
          Quantum-Assisted Smart Agriculture
        </h1>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#10b981',
          marginBottom: '24px'
        }}>
          Crop Yield Forecasting & Crop Recommendation System
        </h2>

        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          maxWidth: '780px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          A full-stack precision agriculture platform combining historical crop yields, 2026 satellite environmental telemetry, XGBoost machine learning, and hybrid quantum feature representation.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActivePage(user ? 'dashboard' : 'login')}
            className="btn-primary"
            style={{ padding: '16px 36px', fontSize: '16px' }}
          >
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>
          
          <button 
            onClick={scrollToFeatures}
            className="btn-secondary"
            style={{ padding: '16px 36px', fontSize: '16px' }}
          >
            <Compass size={18} color="#10b981" />
            <span>Explore Features</span>
          </button>
        </div>

      </div>

      {/* Quick Summary Metrics */}
      <div className="container" style={{ marginBottom: '80px' }}>
        <div className="grid-4">
          <div className="glass-panel metric-card">
            <div className="label">Covered Districts</div>
            <div className="value">38 Districts</div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Tamil Nadu statewide coverage</p>
          </div>

          <div className="glass-panel metric-card">
            <div className="label">Active Forecast Year</div>
            <div className="value" style={{ color: '#3b82f6' }}>2026 Live</div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Automatic GEE feature lookup</p>
          </div>

          <div className="glass-panel metric-card">
            <div className="label">Model Features</div>
            <div className="value" style={{ color: '#8b5cf6' }}>19 Parameters</div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Climate, vegetation & soil</p>
          </div>

          <div className="glass-panel metric-card">
            <div className="label">Classical Model Accuracy</div>
            <div className="value" style={{ color: '#f59e0b' }}>R² 0.9547</div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Evaluated Random Forest / XGBoost</p>
          </div>
        </div>
      </div>

      {/* System Features Section */}
      <div id="features-section" className="container" style={{ marginBottom: '90px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '34px', fontWeight: 800, marginBottom: '12px' }}>
            System Features & <span className="gradient-text">Capabilities</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            End-to-end intelligent decision support for farmers, agricultural officers, and researchers
          </p>
        </div>

        <div className="grid-3">
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Sprout size={24} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>🌾 Crop Yield Prediction</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Accurate yield forecasting in tons/hectare for specific crop varieties, seasons, and land areas using trained XGBoost regression models.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Zap size={24} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>🌱 Intelligent Crop Recommendation</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Evaluates all crops historically verified for a district & season, sorts them by predicted yield under 2026 conditions, and ranks the top candidates.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <CloudSun size={24} color="#8b5cf6" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>🌦️ 2026 Environmental Data</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Google Earth Engine satellite telemetry supplying 13 climate and soil parameters automatically (Rainfall, Temp, Humidity, NDVI, EVI, LST, Soil pH, Carbon).
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Cpu size={24} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>⚛️ Quantum-Classical ML</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Integrates experimental PennyLane quantum angle embedding circuits and PCA compression alongside production XGBoost models.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.15)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <BarChart3 size={24} color="#ec4899" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>📊 Model Performance Analytics</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Transparent comparative benchmark tables and bar charts evaluating MAE, RMSE, and R² scores across all model architectures.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.15)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <History size={24} color="#14b8a6" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>📈 Prediction History</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Secure relational MySQL persistence storing prediction logs and crop recommendations for authenticated user sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Project Workflow */}
      <div className="container" style={{ marginBottom: '90px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '10px' }}>System Data Flow & Workflow</h2>
            <p style={{ color: '#94a3b8' }}>How information flows from farmer input to intelligent decision support</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', textAlign: 'center' }}>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#10b981', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>STEP 1</div>
              <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>User Input</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>District, Season, Crop & Area</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 700 }}>↓</div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#3b82f6', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>STEP 2</div>
              <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>2026 GEE Data</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Auto-fetch 13 Climate/Soil Features</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontWeight: 700 }}>↓</div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#8b5cf6', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>STEP 3</div>
              <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>ML Pipeline</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Label Encode + Scale + XGBoost</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 700 }}>↓</div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>STEP 4</div>
              <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Decision Support</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Yield (t/ha) & Ranked Crops</p>
            </div>

          </div>
        </div>
      </div>

      {/* How It Helps Farmers */}
      <div className="container" style={{ marginBottom: '90px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
            How It Helps <span className="gradient-text">Farmers</span>
          </h2>
          <p style={{ color: '#94a3b8' }}>Empowering farmers with data-driven agricultural intelligence</p>
        </div>

        <div className="grid-3">
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ color: '#10b981', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              🌱 Better Crop Planning
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Enables farmers to plan sowing schedules according to upcoming 2026 climate expectations rather than relying solely on traditional guesswork.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              📊 Data-Driven Selection
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Recommends crops with the highest expected yield specifically adapted to the soil pH, organic carbon, and moisture of each district.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ color: '#8b5cf6', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              🌦️ Environmental Awareness
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Provides clear, localized insights into satellite telemetry metrics like NDVI vegetation health, evapotranspiration, and solar radiation.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              📈 Production & Yield Estimation
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Calculates estimated total production in tons for custom land sizes (hectares), assisting in market planning and revenue forecasting.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ color: '#ec4899', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              💧 Resource Planning
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Assists agricultural officers in allocating fertilizer, seed stock, and irrigation resources based on expected district-level yield statistics.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h4 style={{ color: '#14b8a6', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              🛡️ Risk Mitigation
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Identifies low-yielding crops before planting, reducing financial risk caused by unfavorable micro-climate trends.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="container" style={{ marginBottom: '90px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>Technology Stack</h2>
          <p style={{ color: '#94a3b8' }}>Built on enterprise production frameworks and scientific computing libraries</p>
        </div>

        <div className="grid-4">
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚛️</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>React 18 + Vite</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Modern SPA & Glassmorphic UI</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🍃</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Spring Boot 3.2</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Java 21 REST API & Security</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🐬</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>MySQL Database</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Relational Data Persistence</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Python FastAPI</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>ML Prediction Microservice</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌲</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>XGBoost & Random Forest</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Classical Regression Models</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔬</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>PennyLane Quantum</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Quantum Angle Embedding</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛰️</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Google Earth Engine</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>2026 Climate Dataset</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔑</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>JWT Authentication</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>BCrypt + Stateless Security</p>
          </div>
        </div>
      </div>

      {/* Project Methodology Section */}
      <div className="container">
        <div className="glass-panel" style={{ padding: '36px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px', color: '#10b981' }}>
            📖 Project Methodology Summary
          </h3>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '15px', marginBottom: '14px' }}>
            The system merges historical crop yield statistics with multi-sensor 2026 satellite telemetry downloaded from Google Earth Engine. Preprocessing standardizes 19 feature columns: 4 categorical variables (State, District, Crop, Season) transformed via scikit-learn LabelEncoders, 1 numerical land variable (Area), and 14 climate and soil properties scaled via StandardScaler.
          </p>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '15px' }}>
            During prediction, selecting a district triggers an automated lookup in <code>Environmental_2026.csv</code>, eliminating manual data entry by farmers. The 19-feature vector is passed to the trained XGBoost model to produce yield forecasts in tons/hectare.
          </p>
        </div>
      </div>

    </div>
  );
}
