import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { sampleReports, complianceChecklist, mines, contractors, getEscalatedReports } from '../data/seedData';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  reports: 'coalmine_reports',
  pendingReports: 'coalmine_pending_reports',
  checklist: 'coalmine_checklist',
  user: 'coalmine_user',
  cachedLocation: 'coalmine_cached_location',
};

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.user, null));
  const [reports, setReports] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.reports, null);
    if (saved && saved.length > 0) return saved;
    saveToStorage(STORAGE_KEYS.reports, sampleReports);
    return [...sampleReports];
  });
  const [pendingReports, setPendingReports] = useState(() =>
    loadFromStorage(STORAGE_KEYS.pendingReports, [])
  );
  const [checklist, setChecklist] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.checklist, null);
    if (saved && saved.length > 0) return saved;
    saveToStorage(STORAGE_KEYS.checklist, complianceChecklist);
    return [...complianceChecklist];
  });

  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [syncMessage, setSyncMessage] = useState('');
  const [cachedLocation, setCachedLocation] = useState(() =>
    loadFromStorage(STORAGE_KEYS.cachedLocation, null)
  );

  // Listen to REAL browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-sync — read directly from localStorage
      const pending = loadFromStorage(STORAGE_KEYS.pendingReports, []);
      if (pending.length > 0) {
        setTimeout(() => doSync(), 500);
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache GPS when online
  useEffect(() => {
    if (!navigator.onLine) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, cached: new Date().toISOString() };
          setCachedLocation(loc);
          saveToStorage(STORAGE_KEYS.cachedLocation, loc);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [isOffline]);

  // Persist
  useEffect(() => {
    if (user) saveToStorage(STORAGE_KEYS.user, user);
    else localStorage.removeItem(STORAGE_KEYS.user);
  }, [user]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.reports, reports); }, [reports]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.pendingReports, pendingReports); }, [pendingReports]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.checklist, checklist); }, [checklist]);

  const login = useCallback((role, mineId = null) => {
    setUser({ role, mineId, name: role === 'corporate' ? 'Corporate Regulator' : 'Mine Official' });
  }, []);
  const logout = useCallback(() => setUser(null), []);

  // Add report — uses isOffline state, not navigator.onLine
  const addReport = useCallback((report) => {
    // Read fresh from localStorage to avoid stale closures
    const currentReports = loadFromStorage(STORAGE_KEYS.reports, []);
    const currentPending = loadFromStorage(STORAGE_KEYS.pendingReports, []);
    const id = `R${String(currentReports.length + currentPending.length + 1).padStart(4, '0')}`;
    const newReport = {
      ...report,
      id,
      syncStatus: isOffline ? 'Pending' : 'Synced',
      createdAt: new Date().toISOString(),
    };
    // Always add to reports first
    const updatedReports = [newReport, ...currentReports];
    saveToStorage(STORAGE_KEYS.reports, updatedReports);
    setReports(updatedReports);
    // If offline, also track as pending
    if (isOffline) {
      const updatedPending = [newReport, ...currentPending];
      saveToStorage(STORAGE_KEYS.pendingReports, updatedPending);
      setPendingReports(updatedPending);
    }
    return newReport;
  }, [isOffline]);

  const updateReportStatus = useCallback((reportId, newStatus) => {
    setReports(prev => {
      const updated = prev.map(r =>
        r.id === reportId ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r
      );
      saveToStorage(STORAGE_KEYS.reports, updated);
      return updated;
    });
  }, []);

  // Resolve report with evidence
  const resolveReport = useCallback((reportId, resolution) => {
    setReports(prev => {
      const updated = prev.map(r =>
        r.id === reportId ? {
          ...r,
          status: 'Resolved',
          updatedAt: new Date().toISOString(),
          resolvedAt: new Date().toISOString(),
          resolvedBy: user?.name || 'Unknown',
          correctiveAction: resolution.correctiveAction,
          evidencePhoto: resolution.evidencePhoto || null,
          resolutionNotes: resolution.notes || '',
        } : r
      );
      saveToStorage(STORAGE_KEYS.reports, updated);
      return updated;
    });
  }, [user]);

  const updateChecklistItem = useCallback((itemId, newStatus) => {
    setChecklist(prev => {
      const updated = prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus, lastChecked: new Date().toISOString().split('T')[0] } : item
      );
      saveToStorage(STORAGE_KEYS.checklist, updated);
      return updated;
    });
  }, []);

  // Sync — reads directly from localStorage, not from state
  const doSync = useCallback(() => {
    const pending = loadFromStorage(STORAGE_KEYS.pendingReports, []);
    if (pending.length === 0) {
      setSyncMessage('');
      return;
    }

    setSyncing(true);
    setSyncMessage(`Syncing ${pending.length} reports...`);

    setTimeout(() => {
      // Mark all pending as synced — read fresh from localStorage
      const syncedIds = pending.map(r => r.id);
      const currentReports = loadFromStorage(STORAGE_KEYS.reports, []);

      const updatedReports = currentReports.map(r =>
        syncedIds.includes(r.id) ? { ...r, syncStatus: 'Synced' } : r
      );
      saveToStorage(STORAGE_KEYS.reports, updatedReports);
      setReports(updatedReports);

      // Clear pending
      saveToStorage(STORAGE_KEYS.pendingReports, []);
      setPendingReports([]);

      setSyncing(false);
      setSyncMessage(`${pending.length} reports synced successfully!`);

      setNotifications(prev => [{
        id: Date.now(),
        message: `${pending.length} reports synced from local storage`,
        time: new Date().toISOString(),
        read: false,
      }, ...prev]);

      setTimeout(() => setSyncMessage(''), 4000);
    }, 2000);
  }, []);

  // Escalate old open reports
  useEffect(() => {
    const threshold = new Date('2026-08-28');
    setReports(prev => {
      const updated = prev.map(r => {
        if (r.status === 'Open' && !r.escalated && new Date(r.createdAt || r.date) < threshold) {
          return { ...r, escalated: true };
        }
        return r;
      });
      saveToStorage(STORAGE_KEYS.reports, updated);
      return updated;
    });
  }, []);

  const value = {
    user, login, logout,
    reports, setReports, addReport, updateReportStatus, resolveReport,
    pendingReports, pendingSyncCount: pendingReports.length,
    checklist, setChecklist, updateChecklistItem,
    isOffline, syncing, syncPending: doSync, syncMessage,
    cachedLocation,
    notifications, setNotifications,
    mines, contractors,
    escalatedReports: getEscalatedReports(reports),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
