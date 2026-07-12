import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Search, History, Eye, AlertCircle, FileText, Download } from 'lucide-react';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter variables
  const [predictedClass, setPredictedClass] = useState('');
  const [status, setStatus] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  useEffect(() => {
    fetchScanHistory();
  }, [predictedClass, status, dateStart, dateEnd]);

  const fetchScanHistory = async () => {
    try {
      setLoading(true);
      let queryStr = `?predictedClass=${predictedClass}&status=${status}`;
      if (dateStart) queryStr += `&dateStart=${dateStart}`;
      if (dateEnd) queryStr += `&dateEnd=${dateEnd}`;

      const res = await API.get(`/api/scans${queryStr}`);
      setScans(res.data.data);
    } catch (err) {
      setError('Could not retrieve scan prediction list.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV format
    const headers = ['Patient ID', 'Patient Name', 'Age', 'Gender', 'Predicted Class', 'Confidence', 'Status', 'Date Uploaded', 'Doctor Notes'];
    const rows = scans.map(s => [
      s.patient?.patientId,
      s.patient?.name,
      s.patient?.age,
      s.patient?.gender,
      s.predictedClass,
      (s.confidenceScores[s.predictedClass] * 100).toFixed(1) + '%',
      s.status,
      new Date(s.createdAt).toLocaleDateString(),
      s.doctorNotes ? s.doctorNotes.replace(/,/g, ';') : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mri_prediction_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Scan Pipeline Log</h1>
          <p className="text-sm text-slate-500 font-medium">Verify system-wide diagnostic logs, model classifications, and download reports</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={scans.length === 0}
          className="inline-flex items-center space-x-2 rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Download className="h-5 w-5" />
          <span>Export Logs to CSV</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Tumor Type</label>
          <select
            value={predictedClass}
            onChange={(e) => setPredictedClass(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 py-1.5 px-3 text-slate-800 bg-white focus:outline-none focus:border-clinical-500 font-medium"
          >
            <option value="">All Types</option>
            <option value="glioma">Glioma</option>
            <option value="meningioma">Meningioma</option>
            <option value="pituitary">Pituitary</option>
            <option value="notumor">No Tumor</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Review Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 py-1.5 px-3 text-slate-800 bg-white focus:outline-none focus:border-clinical-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="finalized">Finalized</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Start Date</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 py-1.5 px-3 text-slate-800 focus:outline-none focus:border-clinical-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">End Date</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 py-1.5 px-3 text-slate-800 focus:outline-none focus:border-clinical-500 font-medium"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 animate-pulse bg-slate-100 rounded"></div>
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-base font-semibold text-slate-400">No matching scans found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Patient ID</th>
                  <th className="pb-3">Patient Name</th>
                  <th className="pb-3">Date Processed</th>
                  <th className="pb-3">Predicted Class</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {scans.map((scan) => {
                  const predicted = scan.predictedClass;
                  return (
                    <tr key={scan._id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-semibold text-slate-900">{scan.patient?.patientId}</td>
                      <td className="py-4 font-bold text-slate-800">{scan.patient?.name}</td>
                      <td className="py-4 text-slate-500">{new Date(scan.createdAt).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                          ${predicted === 'glioma' ? 'bg-red-50 text-red-700 border border-red-100' : ''}
                          ${predicted === 'meningioma' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : ''}
                          ${predicted === 'pituitary' ? 'bg-blue-50 text-blue-700 border border-blue-100' : ''}
                          ${predicted === 'notumor' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : ''}
                        `}>
                          {predicted === 'notumor' ? 'No Tumor' : predicted}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-slate-700">
                        {(scan.confidenceScores[predicted] * 100).toFixed(1)}%
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize
                          ${scan.status === 'finalized' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${scan.status === 'reviewed' ? 'bg-indigo-100 text-indigo-800' : ''}
                          ${scan.status === 'pending_review' ? 'bg-amber-100 text-amber-800' : ''}
                        `}>
                          {scan.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          to={`/scans/${scan._id}`}
                          className="inline-flex items-center space-x-1 rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-clinical-50 hover:text-clinical-600 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ScanHistory;
