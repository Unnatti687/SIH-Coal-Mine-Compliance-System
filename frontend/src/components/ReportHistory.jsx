import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { History, Wifi, WifiOff, Database, CheckCircle, Clock, AlertCircle } from 'lucide-react';

function safe(r, field, fallback) {
  return r && r[field] != null ? r[field] : fallback;
}

export default function ReportHistory() {
  const { reports, pendingReports, mines, user } = useApp();
  const [filter, setFilter] = useState('all');

  const allReports = useMemo(() => {
    if (!reports) return [];
    let r = user?.role === 'corporate' ? [...reports] : reports.filter(r => r && r.mineId === user?.mineId);
    r = r.filter(x => x && x.id);
    if (filter === 'synced') return r.filter(x => safe(x, 'syncStatus') === 'Synced');
    if (filter === 'pending') return r.filter(x => safe(x, 'syncStatus') === 'Pending');
    if (filter === 'recent') return r.slice(0, 20);
    return r;
  }, [reports, user, filter]);

  const storageInfo = useMemo(() => {
    const allKeys = Object.keys(localStorage);
    const coalKeys = allKeys.filter(k => k.startsWith('coalmine_'));
    let totalSize = 0;
    coalKeys.forEach(k => {
      totalSize += (localStorage.getItem(k) || '').length;
    });
    return { keys: coalKeys, totalSize: (totalSize / 1024).toFixed(1) };
  }, [reports]);

  const getLat = (r) => r?.location?.lat ?? r?.lat;
  const getLng = (r) => r?.location?.lng ?? r?.lng;

  const syncedCount = (reports || []).filter(r => r && safe(r, 'syncStatus') === 'Synced').length;

  return (
    <div className="history-page">
      {/* Storage Info Card */}
      <div className="storage-info-card">
        <div className="storage-header">
          <Database size={20} />
          <h3>Data Storage — Where Your Reports Are Saved</h3>
        </div>
        <div className="storage-details">
          <div className="storage-item">
            <span className="storage-label">Storage Location:</span>
            <span className="storage-value">Browser localStorage</span>
          </div>
          <div className="storage-item">
            <span className="storage-label">Who Can See It:</span>
            <span className="storage-value">Anyone using this browser on this device</span>
          </div>
          <div className="storage-item">
            <span className="storage-label">Total Reports:</span>
            <span className="storage-value">{(reports || []).length} reports ({storageInfo.totalSize} KB)</span>
          </div>
          <div className="storage-item">
            <span className="storage-label">Pending Sync:</span>
            <span className="storage-value">{(pendingReports || []).length} reports</span>
          </div>
          <div className="storage-item">
            <span className="storage-label">Storage Keys:</span>
            <span className="storage-value mono">{storageInfo.keys.join(', ')}</span>
          </div>
        </div>
        <div className="storage-note">
          <AlertCircle size={14} />
          <span>All data is stored in your browser's localStorage. It persists across page refreshes but is cleared if you clear browser data. In production, this would sync to a cloud database.</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="history-filters">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All Reports ({(reports || []).length})
        </button>
        <button className={`filter-tab ${filter === 'synced' ? 'active' : ''}`} onClick={() => setFilter('synced')}>
          <CheckCircle size={14} /> Synced ({syncedCount})
        </button>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <Clock size={14} /> Pending ({(pendingReports || []).length})
        </button>
        <button className={`filter-tab ${filter === 'recent' ? 'active' : ''}`} onClick={() => setFilter('recent')}>
          Recent 20
        </button>
      </div>

      {/* Reports table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mine</th>
              <th>Category</th>
              <th>Description</th>
              <th>GPS Location</th>
              <th>Date</th>
              <th>Status</th>
              <th>Sync</th>
            </tr>
          </thead>
          <tbody>
            {allReports.slice(0, 100).map(r => {
              const lat = getLat(r);
              const lng = getLng(r);
              const status = safe(r, 'status', 'Unknown');
              return (
                <tr key={r.id} className={safe(r, 'syncStatus') === 'Pending' ? 'pending-row' : ''}>
                  <td className="id-cell">{r.id}</td>
                  <td>{safe(r, 'mineName', 'Unknown')}</td>
                  <td><span className="category-tag">{safe(r, 'category', 'N/A')}</span></td>
                  <td className="desc-cell">{safe(r, 'description', 'No description')}</td>
                  <td className="gps-cell">
                    {lat != null && lng != null ? (
                      <span className="gps-display-mini" title={`Lat: ${lat}, Lng: ${lng}`}>
                        {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
                      </span>
                    ) : <span className="no-gps">No GPS</span>}
                  </td>
                  <td>{safe(r, 'date', 'N/A')}</td>
                  <td>
                    <span className={`status-badge status-${status.toLowerCase().replace(/\s/g, '-')}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <span className={`sync-badge ${safe(r, 'syncStatus') === 'Synced' ? 'synced' : 'pending'}`}>
                      {safe(r, 'syncStatus') === 'Synced' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {safe(r, 'syncStatus', 'Unknown')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {allReports.length > 100 && (
        <p className="results-note">Showing 100 of {allReports.length} reports</p>
      )}
    </div>
  );
}
