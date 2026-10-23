import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function ResolveModal({ report, onClose }) {
  const { resolveReport } = useApp();
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [notes, setNotes] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidencePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setEvidencePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResolve = () => {
    if (!correctiveAction.trim()) {
      alert('Please describe the corrective action taken');
      return;
    }
    if (!confirmed) {
      alert('Please confirm the resolution');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      resolveReport(report.id, {
        correctiveAction: correctiveAction.trim(),
        notes: notes.trim(),
        evidencePhoto: evidencePreview,
      });
      setSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Resolve Violation — {report.id}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Report Info */}
        <div className="modal-report-info">
          <div className="info-row">
            <span className="info-label">Mine:</span>
            <span>{report.mineName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Category:</span>
            <span className="category-tag">{report.category}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Priority:</span>
            <span className={`priority-badge priority-${report.priority.toLowerCase()}`}>{report.priority}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Description:</span>
            <span>{report.description}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Reported:</span>
            <span>{report.date}</span>
          </div>
          {report.contractor && (
            <div className="info-row">
              <span className="info-label">Contractor:</span>
              <span>{report.contractor}</span>
            </div>
          )}
        </div>

        {/* Resolution Form */}
        <div className="modal-form">
          <div className="form-group">
            <label>Corrective Action Taken *</label>
            <textarea
              value={correctiveAction}
              onChange={e => setCorrectiveAction(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Describe what corrective action was taken to resolve this violation..."
            />
          </div>

          <div className="form-group">
            <label>Evidence Photo (optional but recommended)</label>
            <div className="evidence-upload" onClick={() => fileInputRef.current?.click()}>
              {evidencePreview ? (
                <img src={evidencePreview} alt="Evidence" className="evidence-preview" />
              ) : (
                <div className="evidence-placeholder">
                  <Camera size={24} />
                  <span>Upload evidence of resolution</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="form-textarea"
              placeholder="Any additional notes about the resolution..."
            />
          </div>

          {/* Confirmation */}
          <div className="resolve-confirm">
            <label className="confirm-checkbox">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
              />
              <span>I confirm that the corrective action has been taken and the violation is resolved</span>
            </label>
          </div>

          {/* Resolution timestamp */}
          <div className="resolve-timestamp">
            <Clock size={14} />
            <span>Resolution will be timestamped: {new Date().toLocaleString('en-IN')}</span>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleResolve}
              disabled={submitting || !correctiveAction.trim() || !confirmed}
            >
              {submitting ? 'Resolving...' : 'Confirm Resolution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
