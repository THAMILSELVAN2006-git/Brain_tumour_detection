import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Activity, 
  Edit, 
  Clock, 
  AlertCircle, 
  FileText, 
  ExternalLink 
} from 'lucide-react';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [scans, setScans] = useState([]);
  
  // Demographics edit states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [contact, setContact] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/patients/${id}`);
      if (res.data.success) {
        const p = res.data.data.patient;
        setPatient(p);
        setScans(res.data.data.scans || []);
        
        // Populate edit fields
        setName(p.name);
        setAge(p.age);
        setGender(p.gender);
        setContact(p.contact);
      }
    } catch (err) {
      setError('Could not retrieve patient file.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await API.put(`/api/patients/${id}`, {
        name,
        age: parseInt(age),
        gender,
        contact
      });
      if (res.data.success) {
        setPatient(res.data.data);
        setIsEditing(false);
        setSuccess('Patient demographics updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update demographics.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-xl bg-slate-100"></div>
          <div className="lg:col-span-2 h-96 animate-pulse rounded-xl bg-slate-100"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-bold">Patient Record Missing</h3>
        <p className="mt-2 text-sm">Please verify the URL or search for another record.</p>
        <Link to="/patients" className="mt-4 inline-flex text-sm font-bold text-clinical-600 underline">Return to directory</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link to="/patients" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">{patient.name}</h1>
          <p className="text-sm text-slate-500 font-medium">Record ID: {patient.patientId} | Assigned to {patient.assignedDoctor?.name}</p>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="rounded-lg bg-emerald-50 p-3.5 text-sm text-emerald-700 border border-emerald-100">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-100">
          {error}
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: Demographics card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 h-fit">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800">Demographics</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-clinical-600 hover:underline flex items-center space-x-1"
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          {!isEditing ? (
            <div className="space-y-4 text-sm font-medium text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Gender</span>
                <span className="font-semibold text-slate-700">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age</span>
                <span className="font-semibold text-slate-700">{patient.age} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact</span>
                <span className="font-semibold text-slate-700 flex items-center space-x-1">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{patient.contact}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered</span>
                <span className="font-semibold text-slate-700">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-1.5 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm"
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
                    className="block w-full rounded-lg border border-slate-200 py-1.5 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-1.5 px-3 text-slate-800 bg-white focus:border-clinical-500 focus:outline-none text-sm"
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
                  className="block w-full rounded-lg border border-slate-200 py-1.5 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-clinical-600 hover:bg-clinical-700 text-white rounded-lg py-2 text-xs font-bold transition shadow"
              >
                {saving ? 'Saving...' : 'Save Demographics'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Scan history timeline */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800">Diagnostic Scan Timeline</h3>
            <Link
              to="/upload"
              state={{ preselectedPatient: patient._id }} // pass state for quick selection
              className="text-xs font-bold text-clinical-600 hover:underline"
            >
              Analyze New MRI Scan
            </Link>
          </div>

          {scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Clock className="h-10 w-10 text-slate-300 animate-pulse" />
              <p className="mt-3 text-sm font-semibold text-slate-400">No scans processed for this patient yet.</p>
              <Link
                to="/upload"
                className="mt-3 inline-flex bg-clinical-50 text-clinical-700 px-4 py-2 rounded-lg text-xs font-bold border border-clinical-100 hover:bg-clinical-100 transition"
              >
                Initiate first scan
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {scans.map((scan, idx) => {
                const predicted = scan.predictedClass;
                return (
                  <div key={scan._id} className="relative pl-6 border-l-2 border-slate-150 pb-6 last:pb-0">
                    {/* Timeline bullet indicator */}
                    <div className="absolute -left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-clinical-600 shadow-sm"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                            ${predicted === 'glioma' ? 'bg-red-50 text-red-700 border border-red-100' : ''}
                            ${predicted === 'meningioma' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : ''}
                            ${predicted === 'pituitary' ? 'bg-blue-50 text-blue-700 border border-blue-100' : ''}
                            ${predicted === 'notumor' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : ''}
                          `}>
                            {predicted === 'notumor' ? 'No Tumor' : `${predicted} tumor`}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {(scan.confidenceScores[predicted] * 100).toFixed(1)}% Confidence
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-400">Processed {new Date(scan.createdAt).toLocaleString()} | Model: {scan.modelVersion}</p>
                        {scan.doctorNotes && (
                          <p className="text-xs text-slate-600 border-l-2 border-slate-200 pl-3 italic mt-2">"{scan.doctorNotes}"</p>
                        )}
                      </div>
                      
                      <div className="self-end sm:self-center">
                        <Link
                          to={`/scans/${scan._id}`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-clinical-600 hover:text-clinical-700"
                        >
                          <span>Review Full Case</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatientDetail;
