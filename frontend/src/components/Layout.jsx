import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, AlertTriangle, ClipboardCheck, FileText,
  Camera, LogOut, Bell, Wifi, WifiOff, ChevronRight, Building2, HardHat, RefreshCw, Scan, Shield, History
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'report', label: 'Report Issue', icon: Camera },
  { id: 'inspections', label: 'Inspections & Violations', icon: AlertTriangle },
  { id: 'compliance', label: 'Compliance Checklist', icon: ClipboardCheck },
  { id: 'scan', label: 'Scan Paper Form', icon: Scan },
  { id: 'contractors', label: 'Contractors', icon: FileText },
  { id: 'history', label: 'Saved Reports', icon: History },
];

const navItemsCorporate = [
  ...navItems,
  { id: 'allmines', label: 'All Mines Overview', icon: Building2 },
];

export default function Layout({ currentPage, setCurrentPage, children }) {
  const { user, logout, isOffline, pendingSyncCount, syncing, syncPending, syncMessage, escalatedReports } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const items = user?.role === 'corporate' ? navItemsCorporate : navItems;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield size={24} />
            <span>CoalGov</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {currentPage === item.id && <ChevronRight size={14} className="nav-arrow" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            {user?.role === 'corporate' ? <Building2 size={16} /> : <HardHat size={16} />}
            <span>{user?.role === 'corporate' ? 'Corporate View' : 'Mine Official'}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="page-title">
              {items.find(i => i.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="topbar-right">
            {/* Real network status indicator */}
            <div className={`network-status ${isOffline ? 'offline' : 'online'}`}>
              {isOffline ? (
                <>
                  <WifiOff size={14} />
                  <span>Offline — Data saved locally</span>
                </>
              ) : (
                <>
                  <Wifi size={14} />
                  <span>Online</span>
                </>
              )}
            </div>

            {/* Pending sync indicator */}
            {pendingSyncCount > 0 && (
              <div className={`sync-indicator ${syncing ? 'syncing' : ''}`} onClick={() => !syncing && navigator.onLine && syncPending()}>
                {syncing ? (
                  <>
                    <RefreshCw size={14} className="spinning" />
                    <span>Syncing {pendingSyncCount}...</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} />
                    <span>{pendingSyncCount} pending</span>
                  </>
                )}
              </div>
            )}

            {/* Notification bell */}
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={18} />
              {escalatedReports.length > 0 && (
                <span className="notification-badge">{escalatedReports.length}</span>
              )}
            </div>

            {/* User info */}
            <div className="topbar-user">
              <span className="user-name">{user?.name || 'User'}</span>
              {user?.mineId && (
                <span className="user-mine">
                  {useApp().mines.find(m => m.id === user.mineId)?.name || ''}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Sync message banner */}
        {syncMessage && (
          <div className="sync-message-banner">
            <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Offline banner */}
        {isOffline && (
          <div className="offline-banner">
            <WifiOff size={16} />
            <span>
              Network offline — Reports saved to <strong>browser localStorage</strong>.
              {pendingSyncCount > 0 && ` ${pendingSyncCount} report(s) waiting to sync.`}
              {' '}Go online to auto-sync.
            </span>
          </div>
        )}

        {/* Notification dropdown */}
        {showNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h4>Needs Attention — Escalated Reports</h4>
              <span className="notif-count">{escalatedReports.length} items</span>
            </div>
            <div className="notification-list">
              {escalatedReports.slice(0, 10).map(r => (
                <div key={r.id} className="notification-item escalated">
                  <AlertTriangle size={14} />
                  <div>
                    <span className="notif-id">{r.id}</span>
                    <span className="notif-mine">{r.mineName}</span>
                    <span className="notif-desc">{r.description.substring(0, 60)}...</span>
                  </div>
                </div>
              ))}
              {escalatedReports.length === 0 && (
                <div className="notification-item">No escalated reports</div>
              )}
            </div>
          </div>
        )}

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
