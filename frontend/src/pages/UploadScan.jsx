import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Upload, UserPlus, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

const UploadScan = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Quick add patient inline fields
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newPatientContact, setNewPatientContact] = useState('');

  // Upload fields
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // App state
  const [loading, setLoading] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setPatientLoading(true);
      const res = await API.get('/api/patients?limit=100');
      setPatients(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedPatientId(res.data.data[0]._id);
      }
    } catch (err) {
      setError('Could not retrieve patient list.');
    } finally {
      setPatientLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError('');
    } else {
      setError('Only image files (JPEG, JPG, PNG) are supported.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/api/patients', {
        name: newPatientName,
        age: parseInt(newPatientAge),
        gender: newPatientGender,
        contact: newPatientContact
      });
      if (res.data.success) {
        const created = res.data.data;
        setPatients([created, ...patients]);
        setSelectedPatientId(created._id);
        
        // Reset quick add inputs
        setNewPatientName('');
        setNewPatientAge('');
        setNewPatientContact('');
        setShowQuickAdd(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create patient profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatientId) {
      setError('Please select or add a patient record first.');
      return;
    }
    if (!file) {
      setError('Please select or drop an MRI scan image to analyze.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('patientId', selectedPatientId);

    try {
      const res = await API.post('/api/scans/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        // Redirect to prediction result page
        navigate(`/scans/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please verify that the ML microservice is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Analyze MRI Scan</h1>
        <p className="text-sm text-slate-500 font-medium">Select a patient record and upload their brain MRI image to initiate classification</p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Upload and Patient Selection Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: Patient Selector Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800">1. Select Patient</h3>
            <button
              type="button"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="inline-flex items-center space-x-1 text-xs font-bold text-clinical-600 hover:text-clinical-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>{showQuickAdd ? 'Select Patient' : 'Create Patient'}</span>
            </button>
          </div>

          {!showQuickAdd ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Select from Registry</label>
                {patientLoading ? (
                  <div className="h-10 w-full animate-pulse bg-slate-100 rounded"></div>
                ) : patients.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400">No patient records found. Click 'Create Patient' to add one.</p>
                ) : (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-800 bg-white focus:border-clinical-500 focus:outline-none text-sm font-semibold"
                  >
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.patientId} - {p.age}y/o {p.gender})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ) : (
            // Quick add patient inline form
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
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
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm"
                    placeholder="e.g. 45"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Gender</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value)}
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
                  value={newPatientContact}
                  onChange={(e) => setNewPatientContact(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-slate-800 focus:border-clinical-500 focus:outline-none text-sm"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-clinical-600 hover:bg-clinical-700 text-white rounded-lg py-2 text-xs font-bold transition shadow"
              >
                Add to Registry
              </button>
            </form>
          )}
        </div>

        {/* Center/Right: Dropzone upload card */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">2. Upload & Run AI Engine</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <RefreshCw className="h-10 w-10 animate-spin text-clinical-600" />
              <div>
                <h4 className="font-bold text-slate-800 flex items-center justify-center space-x-1.5">
                  <Sparkles className="h-5 w-5 text-clinical-500 fill-clinical-100" />
                  <span>ResNet50 Classifier Running...</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">Extracting spatial structures and computing softmax probabilities</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dropzone container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  isDragging ? 'border-clinical-600 bg-clinical-50/50' : 'border-slate-200 hover:bg-slate-50/50'
                }`}
                onClick={() => document.getElementById('mri-file-input').click()}
              >
                <input
                  id="mri-file-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {preview ? (
                  <div className="relative max-w-xs mx-auto rounded-lg overflow-hidden shadow">
                    <img src={preview} alt="MRI Preview" className="h-48 w-full object-cover" />
                    <div className="absolute bottom-0 w-full bg-slate-900/60 py-1 text-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wide">Image Selected</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Drag & Drop MRI Image Here</p>
                      <p className="text-xs text-slate-400 mt-1">Accepts PNG, JPEG or JPG (Max size 10MB)</p>
                    </div>
                    <span className="inline-flex rounded bg-clinical-50 px-3 py-1 text-xs font-bold text-clinical-700">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>

              {/* Trigger */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!file}
                className="w-full bg-clinical-600 hover:bg-clinical-700 text-white rounded-lg py-2.5 text-sm font-semibold transition shadow disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                Analyze Scan
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UploadScan;
