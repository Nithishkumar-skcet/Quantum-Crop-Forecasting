import React, { useState, useEffect } from 'react';
import { Cpu, CloudSun, CheckCircle2, AlertCircle, Sparkles, Droplets, Thermometer, Sun, Wind } from 'lucide-react';
import { cropService } from '../services/api';

export default function PredictionPage() {
  const [districts, setDistricts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [crops, setCrops] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState('Ariyalur');
  const [selectedCrop, setSelectedCrop] = useState('Bajra');
  const [selectedSeason, setSelectedSeason] = useState('Kharif');
  const [area, setArea] = useState(100.0);
  const [year] = useState(2026);

  const [environment, setEnvironment] = useState(null);
  const [loadingEnv, setLoadingEnv] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  // Initial metadata fetch
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await cropService.getMetadata();
        setDistricts(meta.districts || []);
        setSeasons(meta.seasons || []);
        setCrops(meta.crops || []);
        if (meta.districts && meta.districts.length > 0) {
          setSelectedDistrict(meta.districts[0]);
        }
      } catch (err) {
        console.error('Metadata load error:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch 2026 environmental features upon district selection
  useEffect(() => {
    if (!selectedDistrict) return;
    async function fetchEnv() {
      setLoadingEnv(true);
      setError('');
      try {
        const data = await cropService.getEnvironmentData(selectedDistrict, year);
        setEnvironment(data.environmental_features || null);
      } catch (err) {
        setError(`Unable to obtain 2026 environmental data for ${selectedDistrict}`);
        setEnvironment(null);
      } finally {
        setLoadingEnv(false);
      }
    }
    fetchEnv();
  }, [selectedDistrict, year]);

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setError('');
    setPredictionResult(null);

    try {
      const payload = {
        state: 'Tamil Nadu',
        district: selectedDistrict,
        crop: selectedCrop,
        season: selectedSeason,
        year: year,
        area: parseFloat(area) || 1.0
      };

      const result = await cropService.predictYield(payload);
      setPredictionResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 0 60px 0' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          Crop Yield <span className="gradient-text">Forecasting</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '650px', margin: '0 auto' }}>
          Select location, crop, and season. Environmental & soil parameters are automatically loaded from our 2026 Google Earth Engine dataset.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Form Column */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} color="#10b981" />
            <span>Farm & Crop Inputs</span>
          </h3>

          <form onSubmit={handlePredict}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                State
              </label>
              <input type="text" value="Tamil Nadu" disabled className="glass-input" style={{ opacity: 0.7 }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                District
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                Crop
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="glass-input"
              >
                {crops.map((c) => (
                  <option key={c} value={c} style={{ background: '#0f172a', color: '#fff' }}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                Season
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="glass-input"
              >
                {seasons.map((s) => (
                  <option key={s} value={s} style={{ background: '#0f172a', color: '#fff' }}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                Cultivated Area (Hectares)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={predicting || !environment}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}
            >
              {predicting ? (
                <span>Running XGBoost Model...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Predict Yield</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Environmental & Results Column */}
        <div>
          {/* Automated Environmental Telemetry Panel */}
          <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudSun size={20} color="#3b82f6" />
                <span>2026 Climate Telemetry</span>
              </h3>
              <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
                {selectedDistrict} (2026)
              </span>
            </div>

            {loadingEnv ? (
              <p style={{ color: '#94a3b8' }}>Fetching 2026 satellite telemetry...</p>
            ) : environment ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Droplets size={14} color="#3b82f6" /> Rainfall
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                    {environment.Rainfall_mm?.toFixed(1)} mm
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Thermometer size={14} color="#ef4444" /> Avg Temperature
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                    {environment.Avg_Temperature_C?.toFixed(1)} °C
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wind size={14} color="#06b6d4" /> Humidity
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                    {environment.Relative_Humidity_Percent?.toFixed(1)} %
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sun size={14} color="#10b981" /> NDVI (Vegetation)
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                    {environment.NDVI?.toFixed(3)}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Soil Moisture</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                    {environment.Soil_Moisture?.toFixed(3)}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Soil pH / Carbon</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                    {environment.Soil_pH?.toFixed(1)} pH / {environment.Soil_Organic_Carbon?.toFixed(2)} C
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Prediction Result Display Card */}
          {predictionResult && (
            <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, marginBottom: '12px' }}>
                <CheckCircle2 size={20} />
                <span>PREDICTION SUCCESSFUL</span>
              </div>

              <div style={{ margin: '16px 0' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Predicted Crop Yield
                </div>
                <div style={{ fontSize: '38px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
                  {predictionResult.predicted_yield_tons_per_ha} <span style={{ fontSize: '20px', color: '#10b981' }}>tons/hectare</span>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Total Estimated Production ({area} ha):</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>
                  {predictionResult.total_estimated_production_tons} tons
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', gap: '10px' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
