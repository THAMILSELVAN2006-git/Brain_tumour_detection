import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Mail, Lock, Building, FileText, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor');
  const [hospital, setHospital] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await register(name, email, password, role, hospital, licenseId);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-clinical-600 text-white shadow-md">
            <Activity className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-800">Register Account</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Create a doctor or administrator profile</p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm"
                  placeholder="Dr. Siddharth Sharma"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm"
                  placeholder="doctor@mastishk.net"
                />
              </div>
            </div>

            {/* Password */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-slate-800 bg-white focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm"
              >
                <option value="doctor">Doctor/Radiologist</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            {/* Medical License ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">License/ID Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FileText className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={licenseId}
                  onChange={(e) => setLicenseId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm"
                  placeholder="LIC-XXXXX"
                />
              </div>
            </div>

            {/* Hospital Affiliation */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Hospital/Institution</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Building className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm"
                  placeholder="Apollo Hospital Delhi"
                />
              </div>
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full justify-center rounded-lg bg-clinical-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition focus:outline-none disabled:bg-clinical-400"
          >
            {submitting ? 'Registering Account...' : 'Complete Registration'}
          </button>
        </form>

        {/* Login Redirect */}
        <div className="text-center text-sm text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-clinical-600 hover:text-clinical-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
