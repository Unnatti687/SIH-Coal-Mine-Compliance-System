import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Building2, HardHat } from 'lucide-react';

export default function Login() {
  const { login, mines } = useApp();
  const [selectedMine, setSelectedMine] = useState('');
  const [showMineSelect, setShowMineSelect] = useState(false);

  return (
    <div className="login-page">
      <div className="login-bg">
        <img
          src="https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1920&q=80"
          alt="Coal mine"
          className="login-bg-img"
        />
        <div className="login-bg-overlay" />
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={32} />
          </div>
          <h1>Smart Governance & Compliance</h1>
          <p className="login-subtitle">AI-Based Monitoring System for Coal Mines</p>
          <p className="login-org">Ministry of Coal / Coal India Limited — SIH 2026</p>
        </div>

        <div className="login-roles">
          <button
            className={`login-role-btn ${showMineSelect ? 'hovered' : ''}`}
            onClick={() => setShowMineSelect(true)}
          >
            <HardHat size={36} />
            <span className="role-title">Continue as Mine Official</span>
            <span className="role-desc">View your assigned mine's data, reports, and compliance status</span>
          </button>

          <button
            className="login-role-btn corporate"
            onClick={() => login('corporate')}
          >
            <Building2 size={36} />
            <span className="role-title">Continue as Corporate / Regulator</span>
            <span className="role-desc">View all mines, aggregated dashboards, and generate reports</span>
          </button>
        </div>

        {showMineSelect && (
          <div className="login-mine-select">
            <label>Select Assigned Mine:</label>
            <select value={selectedMine} onChange={e => setSelectedMine(e.target.value)}>
              <option value="">— Choose Mine —</option>
              {mines.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.subsidiary})</option>
              ))}
            </select>
            {selectedMine && (
              <button
                className="btn btn-primary btn-full login-submit"
                onClick={() => login('mineOfficial', selectedMine)}
              >
                Continue
              </button>
            )}
          </div>
        )}

        <div className="login-footer">
          <p>Prototype for SIH 2026 — Synthetic data, not actual violation records</p>
        </div>
      </div>
    </div>
  );
}
