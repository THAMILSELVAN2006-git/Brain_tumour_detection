import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-clinical-600 animate-bounce" />
      <h1 className="mt-6 text-4xl font-extrabold text-slate-800 tracking-tight">404 - Page Not Found</h1>
      <p className="mt-3 text-slate-500 max-w-sm font-medium leading-relaxed">
        The diagnostic resource page or route you are searching for does not exist.
      </p>
      <Link 
        to="/dashboard" 
        className="mt-6 inline-flex items-center space-x-1.5 rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-clinical-700 transition shadow"
      >
        <span>Return to Dashboard</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default NotFound;
