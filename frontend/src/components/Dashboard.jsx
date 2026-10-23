import { useMemo, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMineRiskLevel } from '../data/seedData';
import { generateComplianceReport } from '../utils/pdfGenerator';
import {
  AlertTriangle, CheckCircle, Clock, FileText, TrendingUp,
  MapPin, Download, Shield
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function HeatmapLayer({ reports, mines }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    // Build heatmap points: more violations = higher intensity
    const points = [];
    mines.forEach(mine => {
      const mineReports = reports.filter(r => r.mineId === mine.id);
      const openCount = mineReports.filter(r => r.status === 'Open').length;
      const totalCount = mineReports.length;
      // Intensity based on total violations + extra weight for open ones
      const intensity = Math.min(0.3 + (totalCount / 100) + (openCount / 20), 1.0);
      // Add center point with high intensity
      points.push([mine.lat, mine.lng, intensity]);
      // Add surrounding points for heatmap spread
      for (let i = 0; i < Math.min(openCount, 8); i++) {
        const offsetLat = (Math.random() - 0.5) * 0.15;
        const offsetLng = (Math.random() - 0.5) * 0.15;
        points.push([mine.lat + offsetLat, mine.lng + offsetLng, intensity * 0.6]);
      }
    });
    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: '#28a745',   // Green — low violations
        0.3: '#28a745',
        0.4: '#ffc107',   // Yellow — moderate
        0.6: '#ffc107',
        0.7: '#fd7e14',   // Orange — high
        0.85: '#dc3545',  // Red — critical
        1.0: '#dc3545'
      }
    }).addTo(map);
    return () => { map.removeLayer(heat); };
  }, [map, reports, mines]);
  return null;
}

function MapView({ reports, mines, showHeatmap }) {
  const mapRef = useRef(null);
  return (
    <MapContainer
      center={[22.5, 84]}
      zoom={5}
      style={{ height: '320px', width: '100%', borderRadius: '4px' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showHeatmap && <HeatmapLayer reports={reports} mines={mines} />}
      {mines.map(mine => {
        const mineReports = reports.filter(r => r.mineId === mine.id);
        const openCount = mineReports.filter(r => r.status === 'Open').length;
        const risk = getMineRiskLevel(mine.id, reports);
        const color = risk === 'Red' ? '#dc3545' : risk === 'Yellow' ? '#ffc107' : '#28a745';
        const radius = Math.min(8 + openCount, 20);
        return (
          <CircleMarker
            key={mine.id}
            center={[mine.lat, mine.lng]}
            radius={radius}
            fillColor={color}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <strong>{mine.name}</strong><br />
              {mine.subsidiary} — {mine.state}<br />
              Open: {openCount} | Total: {mineReports.length}<br />
              Risk: <span style={{ color, fontWeight: 700 }}>{risk}</span>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export default function Dashboard() {
  const { user, reports, checklist, mines, escalatedReports } = useApp();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const visibleMines = useMemo(() => {
    if (user?.role === 'corporate') return mines;
    return mines.filter(m => m.id === user?.mineId);
  }, [user, mines]);

  const visibleReports = useMemo(() => {
    if (user?.role === 'corporate') return reports;
    return reports.filter(r => r.mineId === user?.mineId);
  }, [user, reports]);

  const visibleChecklist = useMemo(() => {
    if (user?.role === 'corporate') return checklist;
    return checklist.filter(c => c.mineId === user?.mineId);
  }, [user, checklist]);

  const stats = useMemo(() => {
    const total = visibleReports.length;
    const open = visibleReports.filter(r => r.status === 'Open').length;
    const inProgress = visibleReports.filter(r => r.status === 'In Progress').length;
    const resolved = visibleReports.filter(r => r.status === 'Resolved').length;
    const escalated = visibleReports.filter(r => r.escalated).length;
    const compliant = visibleChecklist.filter(c => c.status === 'Compliant').length;
    const totalChecklist = visibleChecklist.length;
    const compliancePct = totalChecklist > 0 ? Math.round((compliant / totalChecklist) * 100) : 0;
    const pendingSync = visibleReports.filter(r => r.syncStatus === 'Pending').length;
    return { total, open, inProgress, resolved, escalated, compliancePct, pendingSync };
  }, [visibleReports, visibleChecklist]);

  // Pie chart — reports by status
  const statusPieData = {
    labels: ['Open', 'In Progress', 'Resolved'],
    datasets: [{
      data: [stats.open, stats.inProgress, stats.resolved],
      backgroundColor: ['#dc3545', '#f5a623', '#28a745'],
      borderWidth: 0,
    }],
  };

  // Bar chart — reports by category
  const catCounts = {};
  visibleReports.forEach(r => {
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  });
  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const categoryBarData = {
    labels: sortedCats.map(([k]) => k.length > 20 ? k.substring(0, 18) + '...' : k),
    datasets: [{
      label: 'Reports',
      data: sortedCats.map(([, v]) => v),
      backgroundColor: '#2e5266',
      borderRadius: 3,
    }],
  };

  // Bar chart — reports by mine (corporate only)
  const mineBarData = useMemo(() => {
    if (user?.role !== 'corporate') return null;
    const mineCounts = {};
    visibleReports.forEach(r => {
      mineCounts[r.mineName] = (mineCounts[r.mineName] || 0) + 1;
    });
    const sorted = Object.entries(mineCounts).sort((a, b) => b[1] - a[1]);
    return {
      labels: sorted.map(([k]) => k.length > 18 ? k.substring(0, 16) + '...' : k),
      datasets: [{
        label: 'Reports',
        data: sorted.map(([, v]) => v),
        backgroundColor: '#2e5266',
        borderRadius: 3,
      }],
    };
  }, [user, visibleReports]);

  const reportsThisMonth = visibleReports.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === 7 && d.getFullYear() === 2026; // August 2026
  }).length;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { family: 'Inter, system-ui', size: 11 }, padding: 12 } },
    },
  };

  return (
    <div className="dashboard">
      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon open"><AlertTriangle size={20} /></div>
          <div className="stat-body">
            <span className="stat-value">{stats.open}</span>
            <span className="stat-label">Open Violations</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress"><Clock size={20} /></div>
          <div className="stat-body">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon resolved"><CheckCircle size={20} /></div>
          <div className="stat-body">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon compliance"><Shield size={20} /></div>
          <div className="stat-body">
            <span className="stat-value">{stats.compliancePct}%</span>
            <span className="stat-label">Compliance Score</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon digital"><FileText size={20} /></div>
          <div className="stat-body">
            <span className="stat-value">{reportsThisMonth}</span>
            <span className="stat-label">Reports Digitized</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon escalated"><TrendingUp size={20} /></div>
          <div className="stat-body">
            <span className="stat-value">{stats.escalated}</span>
            <span className="stat-label">Escalated</span>
          </div>
        </div>
      </div>

      {/* Map + Charts row */}
      <div className="dashboard-grid-2">
        <div className="card">
          <h3 className="card-title"><MapPin size={16} /> Mine Locations & Risk</h3>           <MapView reports={visibleReports} mines={visibleMines} showHeatmap={showHeatmap} />
           <button
             className={`heatmap-toggle ${showHeatmap ? 'active' : ''}`}
             onClick={() => setShowHeatmap(!showHeatmap)}
           >
             {showHeatmap ? '🔥 Heatmap ON' : '🗺️ Heatmap OFF'}
           </button>
        </div>

        <div className="card">
          <h3 className="card-title">Reports by Status</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pie data={statusPieData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { position: 'bottom', labels: { font: { family: 'Inter, system-ui', size: 11 }, padding: 16 } } } }} />
          </div>
        </div>
      </div>

      {/* Category bar + Mine bar */}
      <div className="dashboard-grid-2">
        <div className="card">
          <h3 className="card-title">Reports by Category</h3>
          <div style={{ height: '280px' }}>
            <Bar data={categoryBarData} options={{ ...chartOptions, indexAxis: 'y', plugins: { legend: { display: false } } }} />
          </div>
        </div>

        {mineBarData && (
          <div className="card">
            <h3 className="card-title">Reports by Mine</h3>
            <div style={{ height: '280px' }}>
              <Bar data={mineBarData} options={{ ...chartOptions, indexAxis: 'y', plugins: { legend: { display: false } } }} />
            </div>
          </div>
        )}

        {!mineBarData && (
          <div className="card">
            <h3 className="card-title">Risk Badges by Contractor</h3>
            <ContractorRiskTable reports={visibleReports} />
          </div>
        )}
      </div>

      {/* Risk badges for mines + Needs attention */}
      <div className="dashboard-grid-2">
        <div className="card">
          <h3 className="card-title"><Shield size={16} /> AI Risk Scores — Mines</h3>
          <div className="risk-table-wrapper">
            <table className="risk-table">
              <thead>
                <tr>
                  <th>Mine</th>
                  <th>Subsidiary</th>
                  <th>Open</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {visibleMines.map(mine => {
                  const mineReports = visibleReports.filter(r => r.mineId === mine.id);
                  const openCount = mineReports.filter(r => r.status === 'Open').length;
                  const risk = getMineRiskLevel(mine.id, visibleReports);
                  return (
                    <tr key={mine.id}>
                      <td className="mine-name-cell">{mine.name}</td>
                      <td>{mine.subsidiary}</td>
                      <td>{openCount}</td>
                      <td>
                        <span className={`risk-badge risk-${risk.toLowerCase()}`}>{risk}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card needs-attention">
          <h3 className="card-title"><AlertTriangle size={16} /> Needs Attention</h3>
          <div className="attention-list">
            {escalatedReports.slice(0, 8).map(r => (
              <div key={r.id} className="attention-item">
                <div className="attention-left">
                  <span className="attention-id">{r.id}</span>
                  <span className="attention-mine">{r.mineName}</span>
                </div>
                <span className="attention-desc">{r.description.substring(0, 45)}...</span>
                <span className="attention-date">{r.date}</span>
              </div>
            ))}
            {escalatedReports.length === 0 && (
              <p className="empty-state">No escalated reports</p>
            )}
          </div>
        </div>
      </div>

      {/* Generate Report button */}
      {user?.role === 'corporate' && (
        <div className="card" style={{ marginTop: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Download size={20} />
          <span>Generate a formal compliance report PDF for any mine:</span>
          <select
            id="report-mine-select"
            className="form-select"
            style={{ maxWidth: '300px' }}
          >
            <option value="">Select mine...</option>
            {mines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button
            className="btn btn-primary"
            disabled={generatingPdf}
            onClick={() => {
              const sel = document.getElementById('report-mine-select');
              const mine = mines.find(m => m.id === sel.value);
              if (!mine) { alert('Select a mine first'); return; }
              setGeneratingPdf(true);
              setTimeout(() => {
                try {
                  generateComplianceReport(mine, reports, checklist);
                } catch(e) { console.error(e); alert('PDF error: ' + e.message); }
                setGeneratingPdf(false);
              }, 100);
            }}
          >
            <Download size={14} /> {generatingPdf ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      )}

      {user?.role === 'mineOfficial' && (
        <div className="card" style={{ marginTop: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Download size={20} />
          <span>Download compliance report for your mine:</span>
          <button
            className="btn btn-primary"
            disabled={generatingPdf}
            onClick={() => {
              const mine = mines.find(m => m.id === user.mineId);
              if (!mine) return;
              setGeneratingPdf(true);
              setTimeout(() => {
                try {
                  generateComplianceReport(mine, reports, checklist);
                } catch(e) { console.error(e); alert('PDF error: ' + e.message); }
                setGeneratingPdf(false);
              }, 100);
            }}
          >
            <Download size={14} /> {generatingPdf ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      )}
    </div>
  );
}

function ContractorRiskTable({ reports }) {
  const contractorStats = useMemo(() => {
    const stats = {};
    reports.forEach(r => {
      if (!r.contractor) return;
      if (!stats[r.contractor]) stats[r.contractor] = { name: r.contractor, open: 0, total: 0 };
      stats[r.contractor].total++;
      if (r.status === 'Open') stats[r.contractor].open++;
    });
    return Object.values(stats).sort((a, b) => b.open - a.open);
  }, [reports]);

  return (
    <div className="risk-table-wrapper" style={{ maxHeight: '260px' }}>
      <table className="risk-table">
        <thead>
          <tr><th>Contractor</th><th>Open</th><th>Total</th><th>Risk</th></tr>
        </thead>
        <tbody>
          {contractorStats.map(c => {
            const risk = c.open >= 4 ? 'Red' : c.open >= 2 ? 'Yellow' : 'Green';
            return (
              <tr key={c.name}>
                <td className="mine-name-cell">{c.name}</td>
                <td>{c.open}</td>
                <td>{c.total}</td>
                <td><span className={`risk-badge risk-${risk.toLowerCase()}`}>{risk}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
