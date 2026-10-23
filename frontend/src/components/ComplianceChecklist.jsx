import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Clock, ClipboardCheck } from 'lucide-react';

const statusIcons = {
  'Compliant': <CheckCircle size={14} className="status-icon compliant" />,
  'Non-Compliant': <XCircle size={14} className="status-icon non-compliant" />,
  'Pending': <Clock size={14} className="status-icon pending" />,
};

const statusCycle = ['Compliant', 'Non-Compliant', 'Pending'];

export default function ComplianceChecklist() {
  const { user, checklist, mines, updateChecklistItem } = useApp();
  const [selectedMine, setSelectedMine] = useState(user?.mineId || mines[0]?.id || '');
  const [expandedCategories, setExpandedCategories] = useState({});

  const mineChecklist = useMemo(() => {
    return checklist.filter(c => c.mineId === selectedMine);
  }, [checklist, selectedMine]);

  const grouped = useMemo(() => {
    const groups = {};
    mineChecklist.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [mineChecklist]);

  const totalItems = mineChecklist.length;
  const compliantCount = mineChecklist.filter(c => c.status === 'Compliant').length;
  const compliancePct = totalItems > 0 ? Math.round((compliantCount / totalItems) * 100) : 0;

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const cycleStatus = (itemId, currentStatus) => {
    const idx = statusCycle.indexOf(currentStatus);
    const next = statusCycle[(idx + 1) % statusCycle.length];
    updateChecklistItem(itemId, next);
  };

  return (
    <div className="compliance-page">
      {/* Mine selector */}
      <div className="compliance-header">
        <div className="mine-selector">
          <label>Select Mine:</label>
          <select
            value={selectedMine}
            onChange={e => setSelectedMine(e.target.value)}
            className="form-select"
          >
            {mines.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.subsidiary})</option>
            ))}
          </select>
        </div>

        <div className="compliance-summary">
          <div className="compliance-score">
            <ClipboardCheck size={20} />
            <span className="score-value">{compliancePct}%</span>
            <span className="score-label">Compliance Score</span>
          </div>
          <div className="compliance-stats">
            <span className="stat-compliant">{compliantCount} Compliant</span>
            <span className="stat-noncompliant">{mineChecklist.filter(c => c.status === 'Non-Compliant').length} Non-Compliant</span>
            <span className="stat-pending">{mineChecklist.filter(c => c.status === 'Pending').length} Pending</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="compliance-progress-bar">
        <div className="progress-track">
          <div
            className="progress-fill compliant"
            style={{ width: `${totalItems > 0 ? (compliantCount / totalItems) * 100 : 0}%` }}
          />
          <div
            className="progress-fill non-compliant"
            style={{
              width: `${totalItems > 0 ? (mineChecklist.filter(c => c.status === 'Non-Compliant').length / totalItems) * 100 : 0}%`
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="checklist-categories">
        {Object.entries(grouped).map(([category, items]) => {
          const catCompliant = items.filter(c => c.status === 'Compliant').length;
          const catPct = Math.round((catCompliant / items.length) * 100);
          const isExpanded = expandedCategories[category] !== false; // default open

          return (
            <div key={category} className="category-section">
              <button className="category-header" onClick={() => toggleCategory(category)}>
                <span className="category-name">{category}</span>
                <span className="category-stats">
                  {catCompliant}/{items.length} compliant ({catPct}%)
                </span>
                <span className={`category-indicator ${catPct >= 80 ? 'good' : catPct >= 50 ? 'warn' : 'bad'}`} />
              </button>

              {isExpanded && (
                <div className="category-items">
                  {items.map(item => (
                    <div key={item.id} className="checklist-item">
                      <div className="item-status" onClick={() => cycleStatus(item.id, item.status)}>
                        {statusIcons[item.status]}
                      </div>
                      <div className="item-content">
                        <span className="item-requirement">{item.requirement}</span>
                        <span className="item-date">Last checked: {item.lastChecked}</span>
                      </div>
                      <span className={`item-status-label ${item.status.toLowerCase().replace(/\s/g, '-')}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
