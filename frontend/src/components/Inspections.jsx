import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Filter, CheckCircle } from 'lucide-react';
import ResolveModal from './ResolveModal';

const statuses = ['Open', 'In Progress', 'Resolved'];

function safe(r, field, fallback) {
  return r && r[field] != null ? r[field] : fallback;
}

export default function Inspections() {
  const { user, reports, mines, updateReportStatus } = useApp();
  const [filterMine, setFilterMine] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [resolveReport, setResolveReport] = useState(null);
  const perPage = 25;

  // Filter out any broken records
  const visibleReports = useMemo(() => {
    let base = user?.role === 'corporate' ? [...reports] : reports.filter(r => r.mineId === user?.mineId);
    return base.filter(r => r && r.id);
  }, [user, reports]);

  const categories = useMemo(() => [...new Set(visibleReports.map(r => safe(r, 'category', 'Unknown')))].sort(), [visibleReports]);

  const filtered = useMemo(() => {
    let result = visibleReports;
    if (filterMine) result = result.filter(r => r.mineId === filterMine);
    if (filterCategory) result = result.filter(r => safe(r, 'category') === filterCategory);
    if (filterStatus) result = result.filter(r => safe(r, 'status') === filterStatus);
    if (filterPriority) result = result.filter(r => safe(r, 'priority') === filterPriority);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        safe(r, 'id', '').toLowerCase().includes(q) ||
        safe(r, 'description', '').toLowerCase().includes(q) ||
        safe(r, 'contractor', '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [visibleReports, filterMine, filterCategory, filterStatus, filterPriority, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const nextStatus = (current) => {
    const idx = statuses.indexOf(current);
    return idx >= 0 && idx < statuses.length - 1 ? statuses[idx + 1] : null;
  };

  const getLat = (r) => r?.location?.lat ?? r?.lat;
  const getLng = (r) => r?.location?.lng ?? r?.lng;

  return (
    <div className="inspections-page">
      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={14} />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="filter-search"
          />
        </div>
        <div className="filter-group">
          <select value={filterMine} onChange={e => { setFilterMine(e.target.value); setPage(1); }} className="filter-select">
            <option value="">All Mines</option>
            {(mines || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }} className="filter-select">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="filter-select">
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }} className="filter-select">
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="results-count">
        Showing {paged.length} of {filtered.length} reports
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mine</th>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th>Priority</th>
              <th>GPS</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => {
              const status = safe(r, 'status', 'Open');
              const priority = safe(r, 'priority', 'Medium');
              const next = nextStatus(status);
              const lat = getLat(r);
              const lng = getLng(r);
              return (
                <tr key={r.id} className={r.escalated ? 'escalated-row' : ''}>
                  <td className="id-cell">
                    {r.id}
                    {r.escalated && <span className="escalated-tag">ESCALATED</span>}
                  </td>
                  <td>{safe(r, 'mineName', 'Unknown')}</td>
                  <td><span className="category-tag">{safe(r, 'category', 'N/A')}</span></td>
                  <td className="desc-cell">{safe(r, 'description', 'No description')}</td>
                  <td>{safe(r, 'date', 'N/A')}</td>
                  <td>
                    <span className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</span>
                  </td>
                  <td className="gps-cell">
                    {lat != null && lng != null ? (
                      <span className="gps-display-mini" title={`Lat: ${lat}, Lng: ${lng}`}>
                        {Number(lat).toFixed(3)}, {Number(lng).toFixed(3)}
                      </span>
                    ) : <span className="no-gps">No GPS</span>}
                  </td>
                  <td>
                    <span className={`status-badge status-${status.toLowerCase().replace(/\s/g, '-')}`}>
                      {status}
                    </span>
                    {r.resolvedAt && (
                      <span className="resolved-info">
                        <CheckCircle size={10} /> {r.resolvedBy || ''}
                      </span>
                    )}
                  </td>
                  <td>
                    {status === 'Open' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateReportStatus(r.id, 'In Progress')}
                      >
                        → In Progress
                      </button>
                    )}
                    {status === 'In Progress' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setResolveReport(r)}
                      >
                        Resolve
                      </button>
                    )}
                    {status === 'Resolved' && (
                      <span className="resolved-badge">
                        <CheckCircle size={12} /> Done
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}

      {resolveReport && (
        <ResolveModal
          report={resolveReport}
          onClose={() => setResolveReport(null)}
        />
      )}
    </div>
  );
}
