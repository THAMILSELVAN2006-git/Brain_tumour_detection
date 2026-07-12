import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  Users, 
  FileText, 
  UploadCloud, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const DoctorDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // Get analytics
        const analyticRes = await API.get('/api/analytics/dashboard');
        setMetrics(analyticRes.data.data);

        // Get recent scans
        const scansRes = await API.get('/api/scans?limit=5');
        setRecentScans(scansRes.data.data.slice(0, 5));
      } catch (err) {
        setError('Failed to retrieve dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100"></div>
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-slate-100"></div>
      </div>
    );
  }

  // Distribution chart data
  const chartData = metrics ? [
    { name: 'Glioma', value: metrics.classDistribution.glioma, color: '#ef4444' },      // Red
    { name: 'Meningioma', value: metrics.classDistribution.meningioma, color: '#eab308' },  // Yellow
    { name: 'Pituitary', value: metrics.classDistribution.pituitary, color: '#3b82f6' },    // Blue
    { name: 'No Tumor', value: metrics.classDistribution.notumor, color: '#22c55e' },      // Green
  ].filter(item => item.value > 0) : [];

  // Fallback if no scans are processed yet
  const hasChartData = chartData.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Physician Control Console</h1>
          <p className="text-sm text-slate-500 font-medium">Review patient scan distribution and diagnostic queues</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center space-x-2 rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition"
        >
          <UploadCloud className="h-5 w-5" />
          <span>Upload MRI Scan</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Patients card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Patients</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">{metrics?.totalPatients || 0}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">
            <Link to="/patients" className="text-clinical-600 hover:underline">View Patient Directory &rarr;</Link>
          </p>
        </div>

        {/* Scans card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">MRI Scans Processed</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">{metrics?.totalScans || 0}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">
            <Link to="/history" className="text-clinical-600 hover:underline">View Prediction Logs &rarr;</Link>
          </p>
        </div>

        {/* Service health card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ML Microservice Status</p>
              <h3 className="mt-2 flex items-center space-x-2 text-xl font-bold text-slate-800">
                <span className={`h-3 w-3 rounded-full ${metrics?.mlServiceStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                <span className="capitalize">{metrics?.mlServiceStatus || 'offline'}</span>
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-400">
            Serving model: <span className="font-semibold text-slate-600">ResNet50-Transfer-v1.0</span>
          </p>
        </div>
      </div>

      {/* Dashboard Analytics & Recent list split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: Recent Scans */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-bold text-slate-800">Recent Scanning Pipeline</h3>
            <Link to="/history" className="text-xs font-semibold text-clinical-600 hover:underline">View All Scans</Link>
          </div>
          {recentScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-400">No scans processed yet</p>
              <Link to="/upload" className="mt-4 text-xs font-bold text-clinical-600 hover:underline">Process first MRI Scan</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Upload Date</th>
                    <th className="pb-3">Predicted Tumor Class</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recentScans.map((scan) => (
                    <tr key={scan._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5">
                        <div>
                          <p className="font-semibold text-slate-800">{scan.patient?.name}</p>
                          <p className="text-xs text-slate-400">{scan.patient?.patientId}</p>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {new Date(scan.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                          ${scan.predictedClass === 'glioma' ? 'bg-red-50 text-red-700 border border-red-100' : ''}
                          ${scan.predictedClass === 'meningioma' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : ''}
                          ${scan.predictedClass === 'pituitary' ? 'bg-blue-50 text-blue-700 border border-blue-100' : ''}
                          ${scan.predictedClass === 'notumor' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : ''}
                        `}>
                          {scan.predictedClass === 'notumor' ? 'No Tumor Detected' : scan.predictedClass}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize
                          ${scan.status === 'finalized' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${scan.status === 'reviewed' ? 'bg-indigo-100 text-indigo-800' : ''}
                          ${scan.status === 'pending_review' ? 'bg-amber-100 text-amber-800' : ''}
                        `}>
                          {scan.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/scans/${scan._id}`}
                          className="rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-clinical-50 hover:text-clinical-600 transition"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Pie chart distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Diagnosis Distribution</h3>
          {hasChartData ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Scans`, 'Frequency']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center">
              <Clock className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-semibold text-slate-400 leading-relaxed">
                Distribution data updates automatically once MRI scans are processed.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
