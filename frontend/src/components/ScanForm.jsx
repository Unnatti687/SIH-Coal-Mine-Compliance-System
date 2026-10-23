import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { parseOCRText } from '../utils/ocrParser';
import Tesseract from 'tesseract.js';
import { Scan, Camera, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function ScanForm() {
  const { addReport, mines, user, isOffline } = useApp();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rawText, setRawText] = useState('');
  const [parsedFields, setParsedFields] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    mineId: '',
    category: 'Safety',
    description: '',
    priority: 'Medium',
    date: new Date().toISOString().split('T')[0],
    inspectorName: '',
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const runOCR = async () => {
    if (!image) return;
    setScanning(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(image, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      setRawText(text);

      const parsed = parseOCRText(text);
      setParsedFields(parsed);

      // Auto-fill form with parsed data
      setFormData(prev => ({
        ...prev,
        mineId: findMineId(parsed.mineName) || prev.mineId,
        description: parsed.description || prev.description,
        priority: parsed.priority || prev.priority,
        date: parsed.date || prev.date,
        inspectorName: parsed.inspectorName || prev.inspectorName,
        category: mapCategory(parsed.category) || prev.category,
      }));
    } catch (err) {
      console.error('OCR Error:', err);
      alert('OCR processing failed. Please try again.');
    }

    setScanning(false);
  };

  const findMineId = (name) => {
    if (!name) return '';
    const lower = name.toLowerCase();
    const match = mines.find(m => m.name.toLowerCase().includes(lower) || lower.includes(m.name.toLowerCase()));
    return match?.id || '';
  };

  const mapCategory = (cat) => {
    const map = {
      'Safety': 'Safety',
      'Environment': 'Environment',
      'Production': 'Production',
      'Labour': 'Labour',
      'Blasting': 'Blasting',
      'Ventilation': 'Ventilation',
      'Emergency': 'Emergency',
      'Electrical': 'Electrical',
      'Haulage': 'Haulage',
      'Roof': 'Roof',
    };
    return map[cat] || 'Safety';
  };

  const handleSubmit = () => {
    if (!formData.mineId || !formData.description) {
      alert('Please fill in mine and description');
      return;
    }
    const mine = mines.find(m => m.id === formData.mineId);
    addReport({
      mineId: formData.mineId,
      mineName: mine?.name || '',
      subsidiary: mine?.subsidiary || '',
      category: formData.category,
      description: formData.description,
      date: formData.date,
      status: 'Open',
      priority: formData.priority,
      contractor: '',
      escalated: false,
      lat: mine?.lat || 0,
      lng: mine?.lng || 0,
    });
    alert('Report submitted from scanned form!');
    // Reset
    setImage(null);
    setImagePreview(null);
    setRawText('');
    setParsedFields(null);
  };

  return (
    <div className="scan-page">
      <div className="scan-container">
        <div className="scan-header">
          <Scan size={24} />
          <h3>Scan Paper Inspection Form</h3>
          <p>Upload a printed inspection form and let OCR extract the key fields</p>
        </div>

        {/* Upload area */}
        <div className="scan-upload" onClick={() => fileInputRef.current?.click()}>
          {imagePreview ? (
            <img src={imagePreview} alt="Uploaded form" className="scan-preview" />
          ) : (
            <div className="scan-placeholder">
              <Camera size={48} />
              <span>Click to upload a photo of the paper form</span>
              <span className="scan-hint">Supports JPG, PNG — printed text only</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Scan button */}
        {image && !parsedFields && (
          <button
            className="btn btn-primary btn-full"
            onClick={runOCR}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <Scan className="spinning" size={16} />
                Scanning... {progress}%
              </>
            ) : (
              <>
                <Scan size={16} />
                Run OCR Scan
              </>
            )}
          </button>
        )}

        {/* Progress bar */}
        {scanning && (
          <div className="scan-progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>{progress}% — Processing image...</span>
          </div>
        )}

        {/* Raw text toggle */}
        {rawText && (
          <div className="scan-results">
            <button className="btn btn-sm btn-secondary" onClick={() => setShowRawText(!showRawText)}>
              <FileText size={14} />
              {showRawText ? 'Hide' : 'Show'} Raw OCR Text
            </button>
            {showRawText && (
              <pre className="ocr-raw-text">{rawText}</pre>
            )}
          </div>
        )}

        {/* Parsed fields */}
        {parsedFields && (
          <div className="parsed-fields">
            <h4><CheckCircle size={16} /> Extracted Fields</h4>
            <div className="parsed-grid">
              <div className="parsed-item">
                <span className="parsed-label">Mine Name:</span>
                <span className="parsed-value">{parsedFields.mineName || 'Not detected'}</span>
              </div>
              <div className="parsed-item">
                <span className="parsed-label">Date:</span>
                <span className="parsed-value">{parsedFields.date || 'Not detected'}</span>
              </div>
              <div className="parsed-item">
                <span className="parsed-label">Inspector:</span>
                <span className="parsed-value">{parsedFields.inspectorName || 'Not detected'}</span>
              </div>
              <div className="parsed-item">
                <span className="parsed-label">Category:</span>
                <span className="parsed-value">{parsedFields.category || 'Not detected'}</span>
              </div>
              <div className="parsed-item">
                <span className="parsed-label">Priority:</span>
                <span className="parsed-value">{parsedFields.priority}</span>
              </div>
            </div>
            <p className="parsed-hint">
              <AlertCircle size={14} /> Fields have been auto-filled into the form below. Review and edit as needed.
            </p>
          </div>
        )}

        {/* Auto-filled form */}
        {parsedFields && (
          <div className="scan-form">
            <h4>Review & Submit</h4>
            <div className="form-group">
              <label>Mine</label>
              <select value={formData.mineId} onChange={e => setFormData({...formData, mineId: e.target.value})} className="form-select">
                <option value="">Select mine...</option>
                {mines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="form-select">
                  <option value="Safety">Safety</option>
                  <option value="Environment">Environment</option>
                  <option value="Production">Production</option>
                  <option value="Labour">Labour</option>
                  <option value="Blasting">Blasting</option>
                  <option value="Ventilation">Ventilation</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Haulage">Haulage</option>
                  <option value="Roof">Roof & Strata</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="form-select">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="form-textarea" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="form-input" />
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSubmit}>
              Submit Report from Scanned Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
