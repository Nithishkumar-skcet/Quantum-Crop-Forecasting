import React, { useState, useEffect } from 'react';
import { BarChart3, Cpu, Activity, Award, HelpCircle, CheckCircle2, AlertCircle, ArrowRight, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cropService } from '../services/api';

export default function ModelPerformancePage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      setError('');
      try {
        const data = await cropService.getModelPerformance();
        setModels(data.models || []);
      } catch (err) {
        console.error('Failed to load model performance metrics:', err);
        setError('Unable to fetch model metrics from backend service.');
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  // Format model data for Recharts visualizations
  const r2ChartData = models.map(m => ({
    name: m.name.replace(' Regressor', '').replace(' Random Forest', ' RF'),
    'R² Score': m.r2_score !== null && m.r2_score !== undefined ? parseFloat(m.r2_score.toFixed(4)) : 0
  }));

  const errorChartData = models.map(m => ({
    name: m.name.replace(' Regressor', '').replace(' Random Forest', ' RF'),
    MAE: m.mae !== null && m.mae !== undefined ? parseFloat(m.mae.toFixed(4)) : 0,
    RMSE: m.rmse !== null && m.rmse !== undefined ? parseFloat(m.rmse.toFixed(4)) : 0
  }));

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 0 60px 0' }}>
      
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          padding: '6px 16px',
          borderRadius: '30px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#8b5cf6',
          marginBottom: '16px'
        }}>
          <Activity size={16} />
          <span>VERIFIED BENCHMARK ANALYTICS</span>
        </div>

        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          Model Performance & <span className="gradient-text">Comparative Analytics</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '750px', margin: '0 auto' }}>
          Empirical evaluation metrics comparing classical Random Forest, production XGBoost, and hybrid quantum-classical algorithms (PennyLane Angle Embedding + PCA).
        </p>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. METRIC DEFINITION CARDS */}
      <div className="grid-3" style={{ marginBottom: '40px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '10px' }}>
            <BarChart3 size={20} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>MAE (Mean Absolute Error)</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            Measures the average magnitude of absolute prediction errors in <strong>tons/hectare</strong>. Lower values indicate higher accuracy.
          </p>
          <div style={{ marginTop: '14px', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
            Production XGBoost MAE: 0.4266 t/ha
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', marginBottom: '10px' }}>
            <Activity size={20} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>RMSE (Root Mean Sq. Error)</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            Square root of mean squared errors. Heavily penalizes larger prediction deviations and outliers. Lower values indicate better fit.
          </p>
          <div style={{ marginTop: '14px', fontSize: '13px', color: '#3b82f6', fontWeight: 600 }}>
            Production XGBoost RMSE: 0.8742 t/ha
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8b5cf6', marginBottom: '10px' }}>
            <Award size={20} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>R² Score (Variance Ratio)</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            Proportion of yield variance explained by the 19 input features. Ranges up to <strong>1.0 (perfect fit)</strong>.
          </p>
          <div style={{ marginTop: '14px', fontSize: '13px', color: '#8b5cf6', fontWeight: 600 }}>
            Production XGBoost R²: 0.9294 (92.9% Variance)
          </div>
        </div>

      </div>

      {/* 3. COMPARISON TABLE */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} color="#10b981" />
            <span>Verified Evaluation Metrics Comparison</span>
          </h3>
          <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
            MEASURED ON TEST DATASET
          </span>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading verified metrics...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '14px' }}>Model Architecture</th>
                  <th style={{ padding: '14px' }}>Type</th>
                  <th style={{ padding: '14px' }}>MAE</th>
                  <th style={{ padding: '14px' }}>RMSE</th>
                  <th style={{ padding: '14px' }}>R² Score</th>
                  <th style={{ padding: '14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#f8fafc' }}>{m.name}</td>
                    <td style={{ padding: '14px', color: '#94a3b8' }}>{m.type}</td>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#10b981' }}>
                      {m.mae !== null && m.mae !== undefined ? m.mae.toFixed(4) : 'Metric not available'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#3b82f6' }}>
                      {m.rmse !== null && m.rmse !== undefined ? m.rmse.toFixed(4) : 'Metric not available'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: (m.r2_score && m.r2_score > 0.9) ? '#10b981' : '#f87171' }}>
                      {m.r2_score !== null && m.r2_score !== undefined ? m.r2_score.toFixed(4) : 'Metric not available'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        background: m.status.includes('Active') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: m.status.includes('Active') ? '#10b981' : '#94a3b8',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. RECHARTS COMPARISON CHARTS */}
      {!loading && models.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
          
          {/* Chart 1: R2 Score */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              R² Variance Explained Score
            </h3>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={r2ChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" domain={[-0.2, 1.0]} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <Bar dataKey="R² Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: MAE & RMSE Error Comparison */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              Prediction Error Comparison (MAE vs RMSE)
            </h3>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="MAE" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="RMSE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* 5. MODEL DESCRIPTION SECTION */}
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={22} color="#10b981" />
          <span>Model Architecture Breakdown</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h4 style={{ color: '#10b981', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              🌲 XGBoost Regressor (Production Active)
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Primary production yield predictor. Utilizes gradient boosted decision trees across all 19 encoded & scaled features. Delivers high operational stability, non-linear feature interaction learning, and robust generalizability.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              🌳 Random Forest Regressor (Evaluated Baseline)
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Classical ensemble model constructed with 200 decision trees. Evaluated baseline metric achieved R² = 0.9547 and MAE = 0.3507 t/ha.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ color: '#8b5cf6', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
              ⚛️ Hybrid Quantum Random Forest (Experimental)
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Experimental hybrid quantum-classical pipeline. Compresses 19 features into 4 principal components (PCA), maps onto a 4-qubit <strong>PennyLane</strong> circuit using <code>AngleEmbedding</code> and <code>BasicEntanglerLayers</code>, and evaluates via Random Forest. As expected for compressed tabular data, classical models currently outperform quantum feature map compression.
            </p>
          </div>

        </div>
      </div>

      {/* 6. PROJECT METHODOLOGY PIPELINE */}
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={22} color="#3b82f6" />
          <span>Execution Pipeline Architecture</span>
        </h3>
        
        <div style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '15px' }}>
          User Inputs (State, District, Crop, Season, Area) 
          $\rightarrow$ Categorical Encoding (LabelEncoders) 
          $\rightarrow$ Automated 2026 Environmental Data Lookup (13 GEE Parameters) 
          $\rightarrow$ 19-Feature Vector Assembly 
          $\rightarrow$ StandardScaler Transformation 
          $\rightarrow$ Trained XGBoost Regressor 
          $\rightarrow$ Predicted Crop Yield Output (t/ha) & Total Production (tons).
        </div>
      </div>

      {/* 7. PREDICTION REFERENCE BENCHMARK */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontWeight: 700, marginBottom: '12px' }}>
          <CheckCircle2 size={20} />
          <span>VERIFIED PREDICTION REGRESSION BENCHMARK</span>
        </div>

        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
          This reference benchmark is strictly used to verify zero pipeline drift across backend microservice releases.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>State / District</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>Tamil Nadu / Ariyalur</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Season / Crop</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>Kharif / Bajra</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Year / Area</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>2026 / 100 Hectares</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Verified Predicted Yield</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>3.07 t/ha (307 Tons)</div>
          </div>
        </div>
      </div>

    </div>
  );
}
