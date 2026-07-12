import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Users, Trash2, Power, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/users');
      setUsers(res.data.data);
    } catch (err) {
      setError('Could not retrieve system users list.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setError('');
    setMessage('');
    try {
      const res = await API.put(`/api/users/${id}/status`, {
        isActive: !currentStatus
      });
      if (res.data.success) {
        setUsers(users.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
        setMessage(`Account status successfully updated.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change user account status.');
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you absolutely sure you want to delete account ${email}? This action is permanent.`)) {
      return;
    }
    
    setError('');
    setMessage('');
    try {
      const res = await API.delete(`/api/users/${id}`);
      if (res.data.success) {
        setUsers(users.filter(u => u._id !== id));
        setMessage(`Account ${email} deleted successfully.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">User Account Directory</h1>
        <p className="text-sm text-slate-500 font-medium">Activate, deactivate, and remove physician or administrator login profiles</p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {message && (
        <div className="flex items-center space-x-2 rounded-lg bg-emerald-50 p-3.5 text-sm text-emerald-700 border border-emerald-100">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 animate-pulse bg-slate-100 rounded"></div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-base font-semibold text-slate-400">No registered users in the database</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                  <th className="pb-3 col-span-2">User Details</th>
                  <th className="pb-3">Institution / Hospital</th>
                  <th className="pb-3">Medical License</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => {
                  const isSelf = u._id === currentUser.id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="py-4">
                        <div>
                          <p className="font-bold text-slate-800 flex items-center space-x-2">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="rounded bg-clinical-100 px-2 py-0.5 text-[9px] font-semibold text-clinical-800">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{u.email} | Role: <span className="uppercase text-[10px]">{u.role}</span></p>
                        </div>
                      </td>
                      <td className="py-4 text-slate-600">{u.hospital || 'N/A'}</td>
                      <td className="py-4 text-slate-500 font-semibold">{u.licenseId || 'N/A'}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                          ${u.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}
                        `}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        {/* Toggle active state */}
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          disabled={isSelf}
                          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition"
                          title={u.isActive ? 'Suspend account' : 'Activate account'}
                        >
                          <Power className="h-3.5 w-3.5" />
                          <span>{u.isActive ? 'Suspend' : 'Activate'}</span>
                        </button>
                        
                        {/* Delete account */}
                        <button
                          onClick={() => handleDeleteUser(u._id, u.email)}
                          disabled={isSelf}
                          className="inline-flex items-center space-x-1.5 rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-semibold hover:bg-red-50 disabled:opacity-30 transition"
                          title="Delete account permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
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

export default UserManagement;
