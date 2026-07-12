import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Headers */}
      <Navbar />
      
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Workspace */}
      <main className="pt-16 md:pl-64 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
