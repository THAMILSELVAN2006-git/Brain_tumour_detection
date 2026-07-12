import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  Users, 
  FileText, 
  Activity, 
  Shield, 
  ShieldAlert, 
  Database,
  Clock 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setLoading(true);
        const res = await API.get('/api/analytics/dashboard');
        setMetrics(res.data.data);
      } catch (err) {
        setError('Failed to fetch admin statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100"></div>
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-slate-100"></div>
      </div>
    );
  }

  // Distribution chart data
  const chartData = metrics ? [
    { name: 'Glioma', Scans: metrics.classDistribution.glioma, fill: '#ef4444' },
    { name: 'Meningioma', Scans: metrics.classDistribution.meningioma, fill: '#eab308' },
    { name: 'Pituitary', Scans: metrics.classDistribution.pituitary, fill: '#3b82f6' },
    { name: 'No Tumor', Scans: metrics.classDistribution.notumor, fill: '#22c55e' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Admin Control Center</h1>
          <p className="text-sm text-slate-500 font-medium">System performance metrics and activity auditing log</p>
        </div>
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center space-x-2 rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition"
        >
          <Users className="h-5 w-5" />
          <span>Manage User Accounts</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">System Accounts</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">{metrics?.totalUsers || 0}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">
            <Link to="/users" className="text-clinical-600 hover:underline">Manage Accounts &rarr;</Link>
          </p>
        </div>

        {/* Patients */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Patients</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">{metrics?.totalPatients || 0}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Database className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">
            <Link to="/patients" className="text-clinical-600 hover:underline">Patient Directory &rarr;</Link>
          </p>
        </div>

        {/* Total Scans */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Diagnostic Scans</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">{metrics?.totalScans || 0}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">
            <Link to="/history" className="text-clinical-600 hover:underline">Inspect Scanning Queue &rarr;</Link>
          </p>
        </div>

        {/* ML Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ML Engine Health</p>
              <h3 className="mt-2 flex items-center space-x-2 text-xl font-bold text-slate-800">
                <span className={`h-3 w-3 rounded-full ${metrics?.mlServiceStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                <span className="capitalize">{metrics?.mlServiceStatus || 'offline'}</span>
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              {metrics?.mlServiceStatus === 'online' ? (
                <Shield className="h-6 w-6 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-400">
            Engine Address: <span className="font-semibold text-slate-600">Port 5001</span>
          </p>
        </div>
      </div>

      {/* Graphs and Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Bar chart prediction frequency */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Total Predictions by Class</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} Predictions`, 'Count']} />
                <Bar dataKey="Scans" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Activity logs */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-slate-400" />
            <span>Audit Trail Logs</span>
          </h3>
          <div className="h-[300px] overflow-y-auto pr-1 space-y-4">
            {metrics?.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-12">No activity events recorded yet.</p>
            ) : (
              metrics?.recentActivity.map((log) => (
                <div key={log._id} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-700">{log.user?.name || 'System'}</p>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{log.action}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
