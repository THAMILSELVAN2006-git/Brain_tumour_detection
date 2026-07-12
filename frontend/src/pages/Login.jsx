import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      // Fetch user role from context
      const token = localStorage.getItem('token');
      // Set short timeout to let context update user state
      setTimeout(() => {
        // Simple decode or fetch user to redirect correctly
        navigate('/dashboard');
      }, 100);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-clinical-600 text-white shadow-md">
            <Activity className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-800">NeuroLens</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Brain MRI Diagnostic Decision Platform</p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
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

            <div>
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
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-semibold text-clinical-600 hover:text-clinical-700">
              Forgot your password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full justify-center rounded-lg bg-clinical-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition focus:outline-none disabled:bg-clinical-400"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Register redirect */}
        <div className="text-center text-sm text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-semibold text-clinical-600 hover:text-clinical-700">
            Create physician profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
