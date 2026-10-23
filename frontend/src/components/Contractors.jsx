import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getContractorRiskLevel } from '../data/seedData';
import { Users } from 'lucide-react';

export default function Contractors() {
  const { reports, mines, contractors, user } = useApp();

  const visibleReports = useMemo(() => {
    if (user?.role === 'corporate') return reports;
    return reports.filter(r => r.mineId === user?.mineId);
  }, [user, reports]);

  const contractorStats = useMemo(() => {
    const stats = {};
    visibleReports.forEach(r => {
      if (!r.contractor) return;
      if (!stats[r.contractor]) {
        stats[r.contractor] = {
          name: r.contractor,
          open: 0, inProgress: 0, resolved: 0, total: 0,
          escalated: 0, mines: new Set(),
        };
      }
      const s = stats[r.contractor];
      s.total++;
      if (r.status === 'Open') s.open++;
      if (r.status === 'In Progress') s.inProgress++;
      if (r.status === 'Resolved') s.resolved++;
      if (r.escalated) s.escalated++;
      s.mines.add(r.mineName);
    });
    return Object.values(stats)
      .map(s => ({ ...s, mines: [...s.mines], risk: getContractorRiskLevel(s.name, visibleReports) }))
      .sort((a, b) => b.open - a.open);
  }, [visibleReports]);

  return (
    <div className="contractors-page">
      <div className="contractors-header">
        <Users size={20} />
        <h3>Contractor Performance Overview</h3>
      </div>

      <div className="contractor-cards">
        {contractorStats.map(c => (
          <div key={c.name} className="contractor-card">
            <div className="contractor-card-header">
              <h4>{c.name}</h4>
              <span className={`risk-badge risk-${c.risk.toLowerCase()}`}>{c.risk}</span>
            </div>

            <div className="contractor-stats-grid">
              <div className="cstat">
                <span className="cstat-value">{c.total}</span>
                <span className="cstat-label">Total</span>
              </div>
              <div className="cstat">
                <span className="cstat-value open">{c.open}</span>
                <span className="cstat-label">Open</span>
              </div>
              <div className="cstat">
                <span className="cstat-value progress">{c.inProgress}</span>
                <span className="cstat-label">In Progress</span>
              </div>
              <div className="cstat">
                <span className="cstat-value resolved">{c.resolved}</span>
                <span className="cstat-label">Resolved</span>
              </div>
            </div>

            {c.escalated > 0 && (
              <div className="contractor-escalated">
                {c.escalated} escalated report{c.escalated > 1 ? 's' : ''}
              </div>
            )}

            <div className="contractor-mines">
              <span className="mines-label">Active at:</span>
              <div className="mine-tags">
                {c.mines.map(m => <span key={m} className="mine-tag">{m}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
