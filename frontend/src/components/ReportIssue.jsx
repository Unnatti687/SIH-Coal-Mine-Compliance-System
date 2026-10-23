import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { mines, contractors } from '../data/seedData';
import { Upload, Camera, MapPin, Clock, Wifi, WifiOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ReportIssue({ setCurrentPage }) {
  const { addReport, isOffline, cachedLocation } = useApp();

  const [mineId, setMineId] = useState('');
  const [category, setCategory] = useState('Safety');
  const [priority, setPriority] = useState('Medium');
  const [contractor, setContractor] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [gpsSource, setGpsSource] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [timestamp] = useState(new Date().toISOString());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);

  const captureGPS = useCallback(() => {
    if (!mineId) return;
    const mine = mines.find(m => m.id === mineId);
    if (!mine) return;

    setLocationLoading(true);

    // Use mine's actual GPS coordinates with small random offset within mine area
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    const mineLat = mine.lat + latOffset;
    const mineLng = mine.lng + lngOffset;

    setLocation({ lat: mineLat, lng: mineLng });
    setGpsSource(`Mine area: ${mine.name}`);
    setLocationLoading(false);
  }, [mineId]);

  useEffect(() => {
    if (mineId) {
      captureGPS();
    } else {
      setLocation(null);
      setGpsSource('');
    }
  }, [mineId, captureGPS]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !mineId) {
      alert('Please fill in the mine and description');
      return;
    }

    const mine = mines.find(m => m.id === mineId);
    setSubmitting(true);

    setTimeout(() => {
      const reportData = {
        mineId,
        mineName: mine.name,
        subsidiary: mine.subsidiary,
        category,
        description,
        priority,
        contractor: contractor || null,
        location: location || { lat: mine.lat, lng: mine.lng },
        gpsSource: gpsSource || `Mine location: ${mine.name}`,
        photoUrl: photoPreview || null,
      };

      const newReport = addReport(reportData);
      setSubmittedReport(newReport);
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleNewReport = () => {
    setMineId('');
    setCategory('Safety');
    setPriority('Medium');
    setContractor('');
    setDescription('');
    setPhoto(null);
    setPhotoPreview(null);
    setLocation(null);
    setGpsSource('');
    setSubmitted(false);
    setSubmittedReport(null);
  };

  const getMineContractors = (mId) => {
    if (!mId) return [];
    const mine = mines.find(m => m.id === mId);
    if (!mine) return [];
    return contractors.filter(c => c.subsidiary === mine.subsidiary);
  };

  if (submitted) {
    return (
      <div className="report-issue-page">
        <div className="submit-success">
          <div className="success-icon">
            <CheckCircle size={48} />
          </div>
          <h2>Report Submitted Successfully</h2>
          <p className="success-message">
            {isOffline ? (
              <>
                <AlertTriangle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Report saved locally. Will sync when connection is restored.
              </>
            ) : (
              'Report has been uploaded to the central database.'
            )}
          </p>
          <div className="submitted-report-summary">
            <div className="summary-row"><span>Report ID:</span><span>{submittedReport?.id}</span></div>
            <div className="summary-row"><span>Mine:</span><span>{submittedReport?.mineName}</span></div>
            <div className="summary-row"><span>Category:</span><span>{submittedReport?.category}</span></div>
            <div className="summary-row"><span>Priority:</span><span>{submittedReport?.priority}</span></div>
            <div className="summary-row"><span>Status:</span><span>{submittedReport?.status}</span></div>
            <div className="summary-row"><span>Sync:</span><span>{submittedReport?.syncStatus}</span></div>
            {submittedReport?.location && (
              <div className="summary-row"><span>GPS:</span><span>{submittedReport.location.lat.toFixed(3)}, {submittedReport.location.lng.toFixed(3)}</span></div>
            )}
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={handleNewReport}>Submit Another Report</button>
            <button className="btn-secondary" onClick={() => setCurrentPage && setCurrentPage('inspections')}>View Inspections</button>
            <button className="btn-secondary" onClick={() => setCurrentPage && setCurrentPage('dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-issue-page">
      <div className="report-form-container">
        <div className="form-header">
          <h2>Report an Issue</h2>
          <p>Document violations, safety concerns, or compliance issues at mine sites.</p>
          {isOffline && (
            <div className="offline-banner">
              <WifiOff size={16} />
              <span>You are offline — report will be saved locally and synced when connection is restored.</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          {/* Mine Selection */}
          <div className="form-group">
            <label>Mine *</label>
            <select value={mineId} onChange={(e) => setMineId(e.target.value)} required>
              <option value="">Select a mine...</option>
              {mines.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.subsidiary})</option>
              ))}
            </select>
          </div>

          {/* Category and Priority */}
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="Safety">Safety</option>
                <option value="Environment">Environment</option>
                <option value="Production">Production</option>
                <option value="Labour">Labour</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority *</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Contractor */}
          <div className="form-group">
            <label>Contractor (if applicable)</label>
            <select value={contractor} onChange={(e) => setContractor(e.target.value)}>
              <option value="">None / Direct mine staff</option>
              {getMineContractors(mineId).map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue observed..."
              rows={4}
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label>Evidence Photo</label>
            <div className="photo-upload-area">
              {photoPreview ? (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Evidence" />
                  <button type="button" className="remove-photo" onClick={() => { setPhoto(null); setPhotoPreview(null); }}>×</button>
                </div>
              ) : (
                <label className="upload-placeholder">
                  <Camera size={32} />
                  <span>Click to upload or take photo</span>
                  <span className="upload-hint">JPEG, PNG up to 10MB</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} hidden />
                </label>
              )}
            </div>
          </div>

          {/* GPS Location */}
          <div className="form-group">
            <label><MapPin size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> GPS Location</label>
            <div className="gps-info">
              {locationLoading ? (
                <div className="gps-loading">
                  <Loader2 size={16} className="spin" />
                  <span>Capturing location...</span>
                </div>
              ) : location ? (
                <>
                  <div className="gps-coords">
                    <span className="gps-lat">{location.lat.toFixed(4)}°N</span>
                    <span className="gps-lng">{location.lng.toFixed(4)}°E</span>
                  </div>
                  <div className="gps-source">{gpsSource}</div>
                </>
              ) : (
                <span className="gps-unavailable">Select a mine to capture location</span>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="form-group">
            <label><Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Timestamp</label>
            <div className="timestamp-display">
              {new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' })}
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="submit"
              className={`btn-submit ${submitting ? 'submitting' : ''}`}
              disabled={submitting || !mineId || !description}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  {isOffline ? 'Saving Locally...' : 'Submitting...'}
                </>
              ) : isOffline ? (
                <>
                  <WifiOff size={16} />
                  Save Locally (Offline)
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
