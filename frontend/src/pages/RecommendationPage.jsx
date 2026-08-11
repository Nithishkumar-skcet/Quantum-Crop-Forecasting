import React, { useState, useEffect } from 'react';
import { Sprout, Trophy, Medal, Award, Sparkles, CloudSun, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cropService } from '../services/api';

export default function RecommendationPage() {
  const [districts, setDistricts] = useState([]);
  const [seasons, setSeasons] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState('Ariyalur');
  const [selectedSeason, setSelectedSeason] = useState('Kharif');
  const [area, setArea] = useState(1.0);
  const [year] = useState(2026);

  const [recommendationResult, setRecommendationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await cropService.getMetadata();
        setDistricts(meta.districts || []);
        setSeasons(meta.seasons || []);
        if (meta.districts && meta.districts.length > 0) setSelectedDistrict(meta.districts[0]);
      } catch (err) {
        console.error('Metadata load error:', err);
      }
    }
    loadMeta();
  }, []);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendationResult(null);

    try {
      const payload = {
        state: 'Tamil Nadu',
        district: selectedDistrict,
        season: selectedSeason,
        year: year,
        area: parseFloat(area) || 1.0
      };

      const result = await cropService.recommendCrops(payload);
      setRecommendationResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Crop recommendation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '32px 0 60px 0' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          Crop Recommendation <span className="gradient-text">Engine</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '650px', margin: '0 auto' }}>
          Evaluates crops historically grown in the selected district & season under 2026 Google Earth Engine environmental conditions.
        </p>
      </div>

      {/* Selection Form */}
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
        <form onSubmit={handleRecommend} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
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

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
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

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
              Area (Hectares)
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
            disabled={loading}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            {loading ? 'Evaluating...' : 'Recommend Best Crops'}
          </button>
        </form>
      </div>

      {/* Results Display */}
      {recommendationResult && (
        <div style={{ marginTop: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
              Top Recommendations for <span className="gradient-text">{recommendationResult.district}</span> ({recommendationResult.season})
            </h2>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
              🌱 {recommendationResult.total_available_crops} Available Crops Found
            </span>
          </div>

          {recommendationResult.total_available_crops === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#f59e0b' }}>
              <AlertTriangle size={36} style={{ marginBottom: '12px' }} />
              <h3>No crop records available for {recommendationResult.district} in {recommendationResult.season} season</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
                Try selecting a different season or district to see available verified crops.
              </p>
            </div>
          ) : (
            <>
              {/* Top Ranked Cards */}
              <div className="grid-3" style={{ marginBottom: '40px' }}>
                {recommendationResult.recommendations.slice(0, 3).map((item, idx) => {
                  let badgeColor = '#f59e0b';
                  let BadgeIcon = Trophy;
                  let rankTitle = '🥇 BEST RECOMMENDED CROP';

                  if (idx === 1) {
                    badgeColor = '#3b82f6';
                    BadgeIcon = Medal;
                    rankTitle = '🥈 SECOND BEST CROP';
                  } else if (idx === 2) {
                    badgeColor = '#8b5cf6';
                    BadgeIcon = Award;
                    rankTitle = '🥉 THIRD BEST CROP';
                  }

                  return (
                    <div 
                      key={item.crop} 
                      className="glass-panel"
                      style={{
                        padding: '28px',
                        border: `1px solid ${badgeColor}40`,
                        background: `${badgeColor}08`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: badgeColor, fontSize: '12px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <BadgeIcon size={18} />
                        <span>{rankTitle}</span>
                      </div>

                      <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                        {item.crop}
                      </h3>

                      <div style={{ margin: '16px 0' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Predicted Yield</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: badgeColor }}>
                          {item.predicted_yield_tons_per_ha.toFixed(2)} <span style={{ fontSize: '16px', color: '#94a3b8' }}>t/ha</span>
                        </div>
                      </div>

                      <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '13px', color: '#94a3b8' }}>
                        Est. Yield for {area} ha: <strong style={{ color: '#f8fafc' }}>{item.total_estimated_production_tons.toFixed(2)} tons</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Ranked Table */}
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                  Complete Ranked List of Available Crops
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                        <th style={{ padding: '12px' }}>Rank</th>
                        <th style={{ padding: '12px' }}>Crop Name</th>
                        <th style={{ padding: '12px' }}>Predicted Yield (tons/ha)</th>
                        <th style={{ padding: '12px' }}>Est. Total Production ({area} ha)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendationResult.recommendations.map((item) => (
                        <tr key={item.crop} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: item.rank === 1 ? '#10b981' : '#94a3b8' }}>
                            #{item.rank}
                          </td>
                          <td style={{ padding: '12px', fontWeight: 600, color: '#f8fafc' }}>{item.crop}</td>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#10b981' }}>
                            {item.predicted_yield_tons_per_ha.toFixed(2)} t/ha
                          </td>
                          <td style={{ padding: '12px', color: '#f59e0b' }}>
                            {item.total_estimated_production_tons.toFixed(2)} tons
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', marginTop: '20px' }}>
          {error}
        </div>
      )}

    </div>
  );
}
