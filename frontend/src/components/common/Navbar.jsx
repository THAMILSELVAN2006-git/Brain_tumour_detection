import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Activity, AlertCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed top-0 z-40 w-full border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Brand Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinical-600 text-white">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Neurolens</span>
          </div>
        </div>

        {/* User profile & controls */}
        <div className="flex items-center space-x-6">
          {/* Hospital indicator */}
          {user.hospital && (
            <div className="hidden border-r border-slate-200 pr-6 md:block text-right">
              <p className="text-xs font-medium text-slate-400">AFFILIATION</p>
              <p className="text-sm font-semibold text-slate-700">{user.hospital}</p>
            </div>
          )}

          {/* User metadata */}
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-700">{user.name}</p>
              <p className="text-xs font-medium uppercase text-slate-400">
                {user.role} {user.licenseId ? `(${user.licenseId})` : ''}
              </p>
            </div>
          </div>

          {/* Logout Trigger */}
          <button
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
