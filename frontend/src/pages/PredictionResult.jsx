import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  FileText, 
  Save, 
  Printer, 
  Activity, 
  Clock 
} from 'lucide-react';

const PredictionResult = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [status, setStatus] = useState('pending_review');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScanDetails();
  }, [id]);

  const fetchScanDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/scans/${id}`);
      if (res.data.success) {
        const data = res.data.data;
        setScan(data);
        setDoctorNotes(data.doctorNotes || '');
        setStatus(data.status || 'pending_review');
      }
    } catch (err) {
      setError('Could not retrieve scan prediction records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const res = await API.put(`/api/scans/${id}/notes`, {
        doctorNotes,
        status
      });
      if (res.data.success) {
        setScan(res.data.data);
        setSuccessMsg('Clinical findings saved successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record revisions.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl bg-slate-100"></div>
          <div className="h-96 animate-pulse rounded-xl bg-slate-100"></div>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-bold">Prediction Record Missing</h3>
        <p className="mt-2 text-sm">Please verify the record URL or upload a new scan.</p>
        <Link to="/upload" className="mt-4 inline-flex text-sm font-bold text-clinical-600 underline">Upload scan</Link>
      </div>
    );
  }

  // Pre-calculate visual classes
  const predicted = scan.predictedClass;
  const tumorColor = {
    glioma: 'bg-red-500 text-red-700 border-red-200 bg-red-50',
    meningioma: 'bg-yellow-500 text-yellow-700 border-yellow-200 bg-yellow-50',
    pituitary: 'bg-blue-500 text-blue-700 border-blue-200 bg-blue-50',
    notumor: 'bg-emerald-500 text-emerald-700 border-emerald-200 bg-emerald-50'
  };

  const descriptions = {
    glioma: 'Gliomas are primary brain tumors initiating in the supportive glial cells that wrap neurons. They require urgent specialist consultation (neurosurgery/oncology) due to their infiltrative nature.',
    meningioma: 'Meningiomas arise from the meninges — the protective membranes surrounding the brain and spinal cord. Typically benign and slow-growing, though mass effects require evaluation.',
    pituitary: 'Pituitary tumors develop within the endocrine pituitary gland at the brain base. Often benign adenomas, but can cause visual deficits or hormone imbalances.',
    notumor: 'No neoplasm, mass effect, or tumor tissue structures detected in the scanned MRI slice. Represents normal findings.'
  };

  // Base API image URL resolution
  const imgUrl = scan.imageUrl.startsWith('http') ? scan.imageUrl : `http://localhost:5000${scan.imageUrl}`;

  return (
    <div className="space-y-6">
      
      {/* Screen Header Controls (Hidden during print) */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div className="flex items-center space-x-3">
          <Link to="/history" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Diagnostic Findings</h1>
            <p className="text-sm text-slate-500 font-medium">Verify AI prediction results and document clinical reviews</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 rounded-lg bg-emerald-50 p-3.5 text-sm text-emerald-700 border border-emerald-100 print:hidden">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-100 print:hidden">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:grid-cols-1">
        
        {/* Left: Scan Preview & Medical Definitions */}
        <div className="space-y-6">
          
          {/* Scan image preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-slate-800 self-start border-b border-slate-100 pb-3 mb-4 w-full">MRI Scan Scan slice</h3>
            <div className="h-72 w-72 rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
              <img src={imgUrl} alt="MRI Patient Scan" className="h-full w-full object-cover" />
            </div>
            <p className="mt-4 text-[11px] font-semibold text-slate-400">PATIENT ID: {scan.patient?.patientId} | PROCESS DATE: {new Date(scan.createdAt).toLocaleString()}</p>
          </div>

          {/* AI Output Class Card */}
          <div className={`rounded-xl border p-6 shadow-sm ${tumorColor[predicted].split(' ')[2]}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Classification</h4>
            <h2 className="mt-2 text-2xl font-black capitalize tracking-tight text-slate-800">
              {predicted === 'notumor' ? 'No Tumor Detected' : `${predicted} Tumor`}
            </h2>
            <div className="mt-3 flex items-center space-x-2">
              <span className={`inline-flex rounded px-2.5 py-0.5 text-xs font-bold ${tumorColor[predicted].split(' ')[0]} text-white`}>
                {(scan.confidenceScores[predicted] * 100).toFixed(1)}% Confidence
              </span>
            </div>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600 border-t border-slate-200/60 pt-4">
              {descriptions[predicted]}
            </p>
          </div>

        </div>

        {/* Right: Confidence Charts & Notes Form */}
        <div className="space-y-6">
          
          {/* Confidence levels bar chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Probability Threshold Analysis</h3>
            
            <div className="space-y-4">
              {Object.keys(scan.confidenceScores).map(name => {
                const prob = scan.confidenceScores[name];
                const percent = (prob * 100).toFixed(1);
                
                // Color codes
                let barColor = 'bg-slate-400';
                if (name === 'glioma') barColor = 'bg-red-500';
                if (name === 'meningioma') barColor = 'bg-yellow-500';
                if (name === 'pituitary') barColor = 'bg-blue-500';
                if (name === 'notumor') barColor = 'bg-emerald-500';

                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs font-bold uppercase mb-1.5 text-slate-500">
                      <span>{name === 'notumor' ? 'No Tumor' : name}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinician findings form (Hidden during print) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print:hidden">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Clinical Evaluation Report</h3>
            
            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Review Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-800 bg-white focus:border-clinical-500 focus:outline-none text-sm font-semibold"
                >
                  <option value="pending_review">Pending Review</option>
                  <option value="reviewed">Reviewed & Verified</option>
                  <option value="finalized">Finalized & Locked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Doctor's Diagnostic Notes</label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={4}
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm leading-relaxed"
                  placeholder="Record patient specific observations, mass parameters, mass effect signs or other clinical remarks..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-clinical-600 hover:bg-clinical-700 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center space-x-2 transition shadow disabled:bg-slate-200"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Clinical Findings'}</span>
              </button>
            </form>
          </div>

          {/* Append-only Revision History logs */}
          {scan.revisions && scan.revisions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print:hidden">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-slate-400" />
                <span>Audit Revision Log ({scan.revisions.length})</span>
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-3.5 pr-1">
                {scan.revisions.map((rev, idx) => (
                  <div key={idx} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0 text-xs">
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>{rev.updatedBy?.name} ({rev.updatedBy?.role})</span>
                      <span className="text-[10px] font-semibold text-slate-400">{new Date(rev.updatedAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 font-semibold text-slate-500">Status: <span className="capitalize text-slate-700">{rev.status.replace('_', ' ')}</span></p>
                    {rev.doctorNotes && (
                      <p className="mt-1 leading-relaxed text-slate-500 italic bg-slate-50 p-2 rounded">"{rev.doctorNotes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* PRINT-ONLY CONTAINER (Completely hidden on screen, visible during printing) */}
      <div className="hidden print:block p-8 border border-slate-400 space-y-6 text-sm bg-white min-h-screen">
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-7 w-7 text-clinical-600" />
            <h1 className="text-2xl font-black tracking-tight">मस्तिष्कNetra Diagnostic Report</h1>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">Affiliation: {scan.uploadedBy?.hospital}</p>
            <p className="font-medium text-slate-400">License ID: {scan.uploadedBy?.licenseId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 mb-2">PATIENT DEMOGRAPHICS</h3>
            <p><strong>Name:</strong> {scan.patient?.name}</p>
            <p><strong>Age:</strong> {scan.patient?.age} Years</p>
            <p><strong>Gender:</strong> {scan.patient?.gender}</p>
            <p><strong>Contact:</strong> {scan.patient?.contact}</p>
            <p><strong>Case Registry ID:</strong> {scan.patient?.patientId}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-2">DIAGNOSTIC METADATA</h3>
            <p><strong>Scan Analysis ID:</strong> {scan._id}</p>
            <p><strong>Processing Date:</strong> {new Date(scan.createdAt).toLocaleString()}</p>
            <p><strong>Analyzing Clinician:</strong> {scan.uploadedBy?.name}</p>
            <p><strong>Engine Version:</strong> {scan.modelVersion}</p>
          </div>
        </div>

        <div className="flex justify-center py-4 border-b border-slate-200">
          <div className="border border-slate-300 p-2 bg-slate-50 rounded">
            <img src={imgUrl} alt="MRI Slice" className="h-56 w-56 object-cover mx-auto" />
            <p className="text-[10px] text-center text-slate-400 mt-2">Figure 1: MRI scan slice image submitted for classifier analysis</p>
          </div>
        </div>

        <div className="space-y-3 border-b border-slate-200 pb-4">
          <h3 className="font-bold text-slate-800">AUTOMATED AI CLASSIFICATION FINDINGS</h3>
          <p className="text-base">
            <strong>Primary Classification Target:</strong> <span className="uppercase font-extrabold tracking-tight">{predicted}</span>
          </p>
          <p>
            <strong>Statistical Probability Score:</strong> {(scan.confidenceScores[predicted] * 100).toFixed(1)}%
          </p>
          <div className="grid grid-cols-4 gap-4 pt-2">
            {Object.keys(scan.confidenceScores).map(name => (
              <div key={name} className="border border-slate-200 p-2 rounded text-center text-xs">
                <p className="font-bold uppercase text-slate-400">{name === 'notumor' ? 'No Tumor' : name}</p>
                <p className="text-sm font-extrabold mt-1 text-slate-700">{(scan.confidenceScores[name] * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pb-6 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">CLINICAL OBSERVATIONS & DIAGNOSTIC NOTES</h3>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-700 min-h-20 bg-slate-50/50 p-4 border border-slate-100 rounded">
            {scan.doctorNotes || 'No clinician remarks or patient-specific observations have been recorded for this MRI scan review session.'}
          </p>
        </div>

        <div className="text-[10px] leading-relaxed text-slate-400 pt-6">
          <p className="font-bold text-slate-500">SYSTEM DISCLAIMER</p>
          <p>
            MastishkNetra is an artificial intelligence-based clinical decision support tool designed to assist medical practitioners. It is not an independent diagnostic replacement for professional radiological evaluations. All finding records must be verified by a board-certified radiologist or medical specialist.
          </p>
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-200">
            <div className="text-center w-48 border-t border-slate-400 pt-2">
              <p className="font-bold">{scan.uploadedBy?.name}</p>
              <p>Reviewing Physician Signature</p>
            </div>
            <div className="text-right">
              <p>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PredictionResult;
