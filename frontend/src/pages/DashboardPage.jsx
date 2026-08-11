import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, History, Sprout, TrendingUp, CloudSun, CheckCircle2, 
  Cpu, ArrowRight, Activity, Droplets, Thermometer, Sun, Wind, AlertCircle, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { cropService } from '../services/api';

export default function DashboardPage({ setActivePage }) {
  const { user } = useAuth();
  
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Ariyalur');
  const [environment, setEnvironment] = useState(null);
  const [loadingEnv, setLoadingEnv] = useState(false);

  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  // Fetch district metadata
  useEffect(() => {
    async function loadDistricts() {
      try {
        const list = await cropService.getDistricts();
        if (list && list.length > 0) {
          setDistricts(list);
          setSelectedDistrict(list[0]);
        }
      } catch (err) {
        console.error('Failed to load districts list:', err);
      }
    }
    loadDistricts();
  }, []);

  // Fetch environmental data whenever selected district changes
  useEffect(() => {
    if (!selectedDistrict) return;
    async function fetchEnv() {
      setLoadingEnv(true);
      try {
        const res = await cropService.getEnvironmentData(selectedDistrict, 2026);
        setEnvironment(res.environmental_features || null);
      } catch (err) {
        console.error('Failed to fetch environmental data:', err);
        setEnvironment(null);
      } finally {
        setLoadingEnv(false);
      }
    }
    fetchEnv();
  }, [selectedDistrict]);

  // Fetch prediction and recommendation history
  useEffect(() => {
    async function fetchHistory() {
      setLoadingHistory(true);
      setError('');
      try {
        const [preds, recs] = await Promise.all([
          cropService.getPredictionHistory().catch(() => []),
          cropService.getRecommendationHistory().catch(() => [])
        ]);
        setPredictions(preds || []);
        setRecommendations(recs || []);
      } catch (err) {
        setError('Unable to load history. Verify backend connectivity.');
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, []);

  // Chart data for recent prediction yields
  const predictionChartData = predictions.slice(0, 7).map(item => ({
    label: `${item.crop} (${item.district})`,
    yield: item.predictedYieldTonsPerHa ? parseFloat(item.predictedYieldTonsPerHa.toFixed(2)) : 0
  })).reverse();

  // Normalized radar chart data for selected district environmental metrics
  const envChartData = environment ? [
    { metric: 'NDVI (x100)', value: Math.min(100, Math.max(0, (environment.NDVI || 0) * 100)) },
    { metric: 'Soil Moist (%)', value: Math.min(100, Math.max(0, (environment.Soil_Moisture || 0) * 100)) },
    { metric: 'Humidity (%)', value: Math.min(100, (environment.Relative_Humidity_Percent || 0)) },
    { metric: 'Avg Temp (°C)', value: Math.min(100, (environment.Avg_Temperature_C || 0)) },
    { metric: 'Soil pH (x10)', value: Math.min(100, (environment.Soil_pH || 0)) },
    { metric: 'Organic C (x10)', value: Math.min(100, (environment.Soil_Organic_Carbon || 0) * 10) }
  ] : [];

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 0 60px 0' }}>
      
      {/* 1. TOP WELCOME SECTION */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span>SYSTEM ONLINE — 2026 GEE TELEMETRY ACTIVE</span>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
              Welcome back, <span className="gradient-text">{user?.fullName || user?.username || 'Farmer'}</span> 👋
            </h1>
            
            <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '750px', lineHeight: 1.6 }}>
              Quantum-Assisted Smart Agriculture Operations Dashboard. Access real-time 2026 climate metrics, run crop yield forecasts, and evaluate optimal crop recommendations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setActivePage('predict')} className="btn-primary" style={{ padding: '12px 20px' }}>
              <Cpu size={16} />
              <span>Predict Yield</span>
            </button>
            
            <button onClick={() => setActivePage('recommend')} className="btn-secondary" style={{ padding: '12px 20px' }}>
              <Sprout size={16} color="#10b981" />
              <span>Recommend Crops</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. KEY METRICS CARDS */}
      <div className="grid-4" style={{ marginBottom: '36px' }}>
        <div className="glass-panel metric-card">
          <div className="label">Total Districts</div>
          <div className="value">38</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Tamil Nadu Statewide Coverage</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="label">Environmental Parameters</div>
          <div className="value" style={{ color: '#3b82f6' }}>13</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Climate & Soil Properties</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="label">Model Features</div>
          <div className="value" style={{ color: '#8b5cf6' }}>19</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Encoded & Scaled Inputs</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="label">Prediction Engine</div>
          <div className="value" style={{ color: '#f59e0b' }}>XGBoost</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>2026 Forecast Year</div>
        </div>
      </div>

      {/* 3. QUICK ACTION CARDS */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Quick Actions & Navigation</h3>
        <div className="grid-4">
          <div 
            onClick={() => setActivePage('predict')}
            className="glass-panel"
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '10px', color: '#10b981' }}>
              <Cpu size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>Yield Prediction</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Predict crop output (t/ha)</p>
            </div>
          </div>

          <div 
            onClick={() => setActivePage('recommend')}
            className="glass-panel"
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '10px', color: '#3b82f6' }}>
              <Sprout size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>Recommend Crops</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Rank top crops by yield</p>
            </div>
          </div>

          <div 
            onClick={() => setActivePage('environment')}
            className="glass-panel"
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '12px', borderRadius: '10px', color: '#8b5cf6' }}>
              <CloudSun size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>2026 Climate Data</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Explore GEE telemetry</p>
            </div>
          </div>

          <div 
            onClick={() => setActivePage('performance')}
            className="glass-panel"
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '10px', color: '#f59e0b' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>Model Metrics</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Random Forest vs XGBoost</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. ENVIRONMENTAL SNAPSHOT & INSIGHTS */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CloudSun size={22} color="#3b82f6" />
              <span>District Environmental Snapshot (2026 GEE Data)</span>
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              Select any Tamil Nadu district to inspect the 13 satellite parameters used by the ML model
            </p>
          </div>

          <div style={{ minWidth: '220px' }}>
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

        {loadingEnv ? (
          <p style={{ color: '#94a3b8', padding: '20px 0' }}>Loading 2026 telemetry for {selectedDistrict}...</p>
        ) : environment ? (
          <div>
            <div className="grid-4" style={{ marginBottom: '24px' }}>
              <div className="metric-card">
                <div className="label">Rainfall</div>
                <div className="value" style={{ color: '#3b82f6' }}>{environment.Rainfall_mm?.toFixed(1)} mm</div>
              </div>

              <div className="metric-card">
                <div className="label">Avg Temperature</div>
                <div className="value" style={{ color: '#ef4444' }}>{environment.Avg_Temperature_C?.toFixed(1)} °C</div>
              </div>

              <div className="metric-card">
                <div className="label">Relative Humidity</div>
                <div className="value" style={{ color: '#06b6d4' }}>{environment.Relative_Humidity_Percent?.toFixed(1)} %</div>
              </div>

              <div className="metric-card">
                <div className="label">Vegetation Index (NDVI)</div>
                <div className="value" style={{ color: '#10b981' }}>{environment.NDVI?.toFixed(3)}</div>
              </div>

              <div className="metric-card">
                <div className="label">Soil Moisture</div>
                <div className="value">{environment.Soil_Moisture?.toFixed(3)}</div>
              </div>

              <div className="metric-card">
                <div className="label">Soil Organic Carbon</div>
                <div className="value" style={{ color: '#8b5cf6' }}>{environment.Soil_Organic_Carbon?.toFixed(2)} g/kg</div>
              </div>

              <div className="metric-card">
                <div className="label">Soil pH Level</div>
                <div className="value" style={{ color: '#f59e0b' }}>{environment.Soil_pH?.toFixed(1)}</div>
              </div>

              <div className="metric-card">
                <div className="label">Land Surface Temp</div>
                <div className="value" style={{ color: '#ec4899' }}>{environment.LST_C?.toFixed(1)} °C</div>
              </div>
            </div>

            {/* Quick Grounded Insights */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Activity size={24} color="#10b981" />
              <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                <strong>Grounded Telemetry Insights ({selectedDistrict}):</strong> Recorded Max Temp: <strong>{environment.Max_Temperature_C?.toFixed(1)}°C</strong> | Min Temp: <strong>{environment.Min_Temperature_C?.toFixed(1)}°C</strong> | Solar Radiation: <strong>{environment.Solar_Radiation_MJ?.toFixed(1)} MJ/m²</strong> | Evapotranspiration: <strong>{environment.Evapotranspiration_mm?.toFixed(2)} mm</strong>.
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 4 & 5. RECENT PREDICTIONS & RECOMMENDATIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
        
        {/* Recent Predictions */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="#10b981" />
            <span>Recent Yield Predictions</span>
          </h3>

          {loadingHistory ? (
            <p style={{ color: '#94a3b8' }}>Loading recent predictions...</p>
          ) : predictions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              <p style={{ fontSize: '14px', marginBottom: '12px' }}>No yield prediction records found.</p>
              <button onClick={() => setActivePage('predict')} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                Run First Prediction
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>District</th>
                    <th style={{ padding: '10px' }}>Crop</th>
                    <th style={{ padding: '10px' }}>Season</th>
                    <th style={{ padding: '10px' }}>Predicted Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.slice(0, 5).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{item.district}</td>
                      <td style={{ padding: '10px', color: '#10b981', fontWeight: 600 }}>{item.crop}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{item.season}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#f59e0b' }}>
                        {item.predictedYieldTonsPerHa ? `${item.predictedYieldTonsPerHa.toFixed(2)} t/ha` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Recommendations */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sprout size={20} color="#3b82f6" />
            <span>Recent Crop Recommendations</span>
          </h3>

          {loadingHistory ? (
            <p style={{ color: '#94a3b8' }}>Loading recent recommendations...</p>
          ) : recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              <p style={{ fontSize: '14px', marginBottom: '12px' }}>No recommendation records found.</p>
              <button onClick={() => setActivePage('recommend')} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                Run Recommendation
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>District</th>
                    <th style={{ padding: '10px' }}>Season</th>
                    <th style={{ padding: '10px' }}>Top Crop</th>
                    <th style={{ padding: '10px' }}>Top Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.slice(0, 5).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{item.district}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{item.season}</td>
                      <td style={{ padding: '10px', color: '#3b82f6', fontWeight: 600 }}>{item.topCrop || 'Evaluated'}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#10b981' }}>
                        {item.topPredictedYield ? `${item.topPredictedYield.toFixed(2)} t/ha` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* 9. RECHARTS PREDICTION HISTORY VISUALIZATION */}
      {predictionChartData.length > 0 && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
            Recent Predictions Yield Overview (t/ha)
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictionChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <Bar dataKey="yield" fill="#10b981" radius={[4, 4, 0, 0]} name="Predicted Yield (t/ha)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
