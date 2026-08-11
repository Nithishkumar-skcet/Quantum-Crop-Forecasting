import React from 'react';
import { Info, Cpu, CloudSun, Database, Shield, Server, Code } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container animate-fade-in" style={{ padding: '32px 0 60px 0', maxWidth: '900px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          About <span className="gradient-text">The Project</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>
          Quantum-Assisted Smart Agriculture – Crop Yield Forecasting & Crop Recommendation System
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '36px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px', color: '#10b981' }}>
          🌾 Project Background & Objective
        </h2>
        <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '15px', marginBottom: '16px' }}>
          Accurate crop yield prediction and optimal crop selection are vital for food security, agricultural risk management, and farmer profitability. Traditional agricultural yield estimation relies on manual surveying or single-variable historical statistical models, which fail to capture complex non-linear interactions between weather patterns, vegetation density, and soil composition.
        </p>
        <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '15px' }}>
          This project introduces a modern multi-tier application architecture integrating <strong>Google Earth Engine 2026 remote sensing telemetry</strong>, <strong>XGBoost machine learning</strong>, and <strong>hybrid quantum feature embedding algorithms</strong> into a production full-stack platform.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '36px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', color: '#3b82f6' }}>
          ⚛️ Quantum-Assisted Feature Representation
        </h2>
        <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '15px', marginBottom: '16px' }}>
          To explore quantum computational advantages for tabular agricultural regression:
        </p>
        <ul style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '14px', paddingLeft: '20px' }}>
          <li><strong>Dimensionality Reduction</strong>: High-dimensional multi-source features (19 variables) are compressed into 4 principal components via PCA.</li>
          <li><strong>Angle Embedding</strong>: Compressed features are mapped onto rotational quantum state gates ($R_x$, $R_y$) across a 4-qubit quantum simulator circuit built with <strong>PennyLane</strong>.</li>
          <li><strong>Entanglement Layers</strong>: <code>BasicEntanglerLayers</code> introduce non-linear quantum phase correlations across qubits.</li>
          <li><strong>Measurement</strong>: Expectation values of Pauli-Z operators ($\langle Z_i \rangle$) are extracted to form a quantum feature space evaluated alongside classical Random Forest and XGBoost regressors.</li>
        </ul>
      </div>

      <div className="glass-panel" style={{ padding: '36px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', color: '#8b5cf6' }}>
          🌍 Google Earth Engine 2026 Environmental Data Integration
        </h2>
        <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '15px', marginBottom: '16px' }}>
          Our system features automatic environmental data population. The 2026 dataset covers 38 Tamil Nadu districts across 13 satellite & soil features:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: '#94a3b8', fontSize: '14px' }}>
          <div>• Rainfall (mm) & Relative Humidity (%)</div>
          <div>• Avg, Max, Min Temperatures (°C)</div>
          <div>• MODIS NDVI & EVI Vegetation Indices</div>
          <div>• Land Surface Temperature (LST °C)</div>
          <div>• Volumetric Soil Moisture</div>
          <div>• Evapotranspiration (mm)</div>
          <div>• Solar Radiation (MJ/m²)</div>
          <div>• Soil Organic Carbon (g/kg) & Soil pH</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '36px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', color: '#f59e0b' }}>
          💻 Target Technology Stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ color: '#10b981', marginBottom: '6px' }}>Frontend</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>React 18 + Vite, Lucide Icons, Recharts, Vanilla Glassmorphism CSS</p>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ color: '#3b82f6', marginBottom: '6px' }}>Backend API</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Spring Boot 3.2 (Java 21), Spring Security, JWT Auth, RestTemplate</p>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ color: '#8b5cf6', marginBottom: '6px' }}>Database</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>MySQL Relational Database + Spring Data JPA persistence</p>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '6px' }}>ML Microservice</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Python 3.11, FastAPI, XGBoost, Scikit-Learn, PennyLane, Joblib</p>
          </div>
        </div>
      </div>

    </div>
  );
}
