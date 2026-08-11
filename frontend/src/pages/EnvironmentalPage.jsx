import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Thermometer, Sun, Wind, Activity, CheckCircle2 } from 'lucide-react';
import { cropService } from '../services/api';

export default function EnvironmentalPage() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Ariyalur');
  const [environment, setEnvironment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDistricts() {
      try {
        const dList = await cropService.getDistricts();
        setDistricts(dList || []);
        if (dList && dList.length > 0) setSelectedDistrict(dList[0]);
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    }
    loadDistricts();
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return;
    async function fetchEnv() {
      setLoading(true);
      try {
        const res = await cropService.getEnvironmentData(selectedDistrict, 2026);
        setEnvironment(res.environmental_features || null);
      } catch (err) {
        console.error('Failed to load environmental data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEnv();
  }, [selectedDistrict]);

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 0 60px 0' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '6px' }}>
            2026 Satellite <span className="gradient-text">Environmental Data</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Google Earth Engine high-resolution climate & soil telemetry across 38 Tamil Nadu districts
          </p>
        </div>

        <div style={{ minWidth: '240px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="glass-input"
          >
            {districts.map((d) => (
              <option key={d} value={d} style={{ background: '#0f172a', color: '#fff' }}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading 2026 satellite telemetry...</p>
      ) : environment ? (
        <div className="grid-3" style={{ marginBottom: '40px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', marginBottom: '12px' }}>
              <Droplets size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Rainfall & Moisture</h3>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', marginBottom: '8px' }}>
              {environment.Rainfall_mm?.toFixed(2)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>mm</span>
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Soil Moisture Index: <strong style={{ color: '#f8fafc' }}>{environment.Soil_Moisture?.toFixed(3)}</strong>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '12px' }}>
              <Thermometer size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Temperature Metrics</h3>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
              {environment.Avg_Temperature_C?.toFixed(2)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>°C (Avg)</span>
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Max: {environment.Max_Temperature_C?.toFixed(1)}°C | Min: {environment.Min_Temperature_C?.toFixed(1)}°C | LST: {environment.LST_C?.toFixed(1)}°C
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '12px' }}>
              <Sun size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Vegetation Indices (NDVI / EVI)</h3>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>
              NDVI: {environment.NDVI?.toFixed(3)}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Enhanced Vegetation Index (EVI): <strong style={{ color: '#f8fafc' }}>{environment.EVI?.toFixed(3)}</strong>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8b5cf6', marginBottom: '12px' }}>
              <Activity size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Soil Health Profile</h3>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6', marginBottom: '8px' }}>
              pH: {environment.Soil_pH?.toFixed(2)}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Organic Carbon: <strong style={{ color: '#f8fafc' }}>{environment.Soil_Organic_Carbon?.toFixed(2)} g/kg</strong>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', marginBottom: '12px' }}>
              <Wind size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Solar & Evapotranspiration</h3>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>
              {environment.Solar_Radiation_MJ?.toFixed(1)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>MJ/m²</span>
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Evapotranspiration: <strong style={{ color: '#f8fafc' }}>{environment.Evapotranspiration_mm?.toFixed(2)} mm</strong>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
