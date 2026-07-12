import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Users, Search, UserPlus, Eye, Edit2, AlertCircle, X } from 'lucide-react';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [page, search]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/patients?search=${search}&page=${page}&limit=10`);
      setPatients(res.data.data);
      setPages(res.data.pagination.pages);
    } catch (err) {
      setError('Could not retrieve patient listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await API.post('/api/patients', {
        name,
        age: parseInt(age),
        gender,
        contact
      });
      if (res.data.success) {
        setShowModal(false);
        // Reset fields
        setName('');
        setAge('');
        setContact('');
        fetchPatients();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create patient.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Patient Directory</h1>
          <p className="text-sm text-slate-500 font-medium">Browse, search, and register new patients within the hospital records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition"
        >
          <UserPlus className="h-5 w-5" />
          <span>Register New Patient</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-clinical-500 focus:outline-none text-sm"
            placeholder="Search by name, ID or contact..."
          />
        </div>
      </div>

      {/* Patient Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 animate-pulse bg-slate-100 rounded"></div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-base font-semibold text-slate-400">No patient records found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3">Patient ID</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Age / Gender</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Assigned Physician</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-semibold text-slate-900">{p.patientId}</td>
                      <td className="py-4 font-bold text-clinical-700">{p.name}</td>
                      <td className="py-4">{p.age}y / {p.gender}</td>
                      <td className="py-4 text-slate-500">{p.contact}</td>
                      <td className="py-4 text-slate-600">{p.assignedDoctor?.name || 'Unassigned'}</td>
                      <td className="py-4 text-right space-x-2">
                        <Link
                          to={`/patients/${p._id}`}
                          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-clinical-50 hover:text-clinical-600"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View History</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {pages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition disabled:opacity-50 disabled:hover:bg-white"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-500">Page {page} of {pages}</span>
                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition disabled:opacity-50 disabled:hover:bg-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Register Patient Profile</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm"
                    placeholder="e.g. 45"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-slate-800 bg-white focus:border-clinical-500 focus:outline-none text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Contact Number</label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-clinical-600 hover:bg-clinical-700 text-white rounded-lg py-2.5 text-sm font-semibold transition shadow disabled:bg-slate-200"
              >
                {submitting ? 'Registering...' : 'Register Patient'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientList;
