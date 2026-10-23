import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMineRiskLevel } from '../data/seedData';
import { generateComplianceReport } from '../utils/pdfGenerator';
import { Building2, Download, ChevronRight } from 'lucide-react';

export default function AllMines({ setCurrentPage }) {
  const { reports, mines, checklist } = useApp();
  const [selectedMine, setSelectedMine] = useState(null);

  const mineData = useMemo(() => {
    return mines.map(mine => {
      const mineReports = reports.filter(r => r.mineId === mine.id);
      const open = mineReports.filter(r => r.status === 'Open').length;
      const inProgress = mineReports.filter(r => r.status === 'In Progress').length;
      const resolved = mineReports.filter(r => r.status === 'Resolved').length;
      const escalated = mineReports.filter(r => r.escalated).length;

      const mineChecklist = checklist.filter(c => c.mineId === mine.id);
      const compliant = mineChecklist.filter(c => c.status === 'Compliant').length;
      const compliancePct = mineChecklist.length > 0 ? Math.round((compliant / mineChecklist.length) * 100) : 0;
      const risk = getMineRiskLevel(mine.id, reports);

      return {
        ...mine,
        total: mineReports.length,
        open, inProgress, resolved, escalated,
        compliancePct,
        risk,
        totalChecklist: mineChecklist.length,
        compliantCount: compliant,
      };
    });
  }, [mines, reports, checklist]);

  return (
    <div className="allmines-page">
      <div className="allmines-header">
        <Building2 size={20} />
        <h3>All Mines Overview — {mines.length} Mines</h3>
      </div>

      <div className="table-wrapper">
        <table className="data-table mines-table">
          <thead>
            <tr>
              <th>Mine / Area</th>
              <th>Subsidiary</th>
              <th>State</th>
              <th>Type</th>
              <th>Total</th>
              <th>Open</th>
              <th>In Progress</th>
              <th>Resolved</th>
              <th>Escalated</th>
              <th>Compliance</th>
              <th>AI Risk</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mineData.map(m => (
              <tr key={m.id} className={selectedMine === m.id ? 'selected-row' : ''}>
                <td className="mine-name-cell">{m.name}</td>
                <td>{m.subsidiary}</td>
                <td>{m.state}</td>
                <td>{m.type}</td>
                <td>{m.total}</td>
                <td className="open-count">{m.open}</td>
                <td>{m.inProgress}</td>
                <td>{m.resolved}</td>
                <td>{m.escalated > 0 ? <span className="escalated-count">{m.escalated}</span> : '0'}</td>
                <td>
                  <div className="compliance-cell">
                    <div className="mini-bar">
                      <div className="mini-bar-fill" style={{ width: `${m.compliancePct}%` }} />
                    </div>
                    <span>{m.compliancePct}%</span>
                  </div>
                </td>
                <td>
                  <span className={`risk-badge risk-${m.risk.toLowerCase()}`}>{m.risk}</span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelectedMine(selectedMine === m.id ? null : m.id)}
                  >
                    <ChevronRight size={12} />
                    {selectedMine === m.id ? 'Close' : 'Details'}
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => generateComplianceReport(m, reports, checklist)}
                    style={{ marginLeft: '4px' }}
                  >
                    <Download size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded mine detail */}
      {selectedMine && (
        <MineDetail
          mine={mineData.find(m => m.id === selectedMine)}
          reports={reports.filter(r => r.mineId === selectedMine)}
          checklist={checklist.filter(c => c.mineId === selectedMine)}
        />
      )}
    </div>
  );
}

function MineDetail({ mine, reports, checklist }) {
  if (!mine) return null;

  const recentReports = reports.slice(0, 10);

  return (
    <div className="mine-detail-card">
      <h4>{mine.name} — Detail View</h4>
      <div className="detail-stats">
        <div className="detail-stat">
          <span className="detail-stat-value">{mine.total}</span>
          <span className="detail-stat-label">Total Reports</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-value open">{mine.open}</span>
          <span className="detail-stat-label">Open</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-value">{mine.compliancePct}%</span>
          <span className="detail-stat-label">Compliance</span>
        </div>
        <div className="detail-stat">
          <span className={`risk-badge risk-${mine.risk.toLowerCase()}`}>{mine.risk}</span>
          <span className="detail-stat-label">AI Risk</span>
        </div>
      </div>

      <h5>Recent Reports</h5>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map(r => (
              <tr key={r.id}>
                <td className="id-cell">{r.id}</td>
                <td><span className="category-tag">{r.category}</span></td>
                <td className="desc-cell">{r.description}</td>
                <td>
                  <span className={`status-badge status-${r.status.toLowerCase().replace(/\s/g, '-')}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge priority-${r.priority.toLowerCase()}`}>{r.priority}</span>
                </td>
                <td>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
