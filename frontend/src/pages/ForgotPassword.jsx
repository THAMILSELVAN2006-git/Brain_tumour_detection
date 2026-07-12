import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, CheckCircle, Key, AlertCircle } from 'lucide-react';
import API from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Reset Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await API.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await API.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      if (res.data.success) {
        setMessage(res.data.message);
        setStep(3); // success view
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
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
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-800">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Verify identity via simulated email OTP</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center space-x-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-100">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
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

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full justify-center rounded-lg bg-clinical-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition focus:outline-none disabled:bg-clinical-400"
            >
              {submitting ? 'Sending Request...' : 'Send OTP Code'}
            </button>
          </form>
        )}

        {/* Step 2: Validate OTP and Set Password */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">One-Time Code (OTP)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Key className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm"
                    placeholder="Enter 123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full justify-center rounded-lg bg-clinical-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition focus:outline-none disabled:bg-clinical-400"
            >
              {submitting ? 'Resetting Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {/* Step 3: Success View */}
        {step === 3 && (
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex w-full justify-center rounded-lg bg-clinical-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-clinical-700 transition focus:outline-none"
            >
              Return to Login
            </Link>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center text-sm">
          <Link to="/login" className="font-semibold text-clinical-600 hover:text-clinical-700">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
