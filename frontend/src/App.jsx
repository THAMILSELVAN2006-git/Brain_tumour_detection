import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Router protection
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/common/AppLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadScan from './pages/UploadScan';
import PredictionResult from './pages/PredictionResult';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import ScanHistory from './pages/ScanHistory';
import ModelPerformance from './pages/ModelPerformance';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import About from './pages/About';
import NotFound from './pages/NotFound';

// Inner component to handle initial path routing based on user role
const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-clinical-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Secure Layout Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Common Routes */}
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/history" element={<ScanHistory />} />
              <Route path="/analytics" element={<ModelPerformance />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />

              {/* Role Restricted Routes */}
              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route path="/dashboard" element={<DoctorDashboard />} />
                <Route path="/upload" element={<UploadScan />} />
                <Route path="/scans/:id" element={<PredictionResult />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          {/* Base paths */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
