import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Users, 
  History, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  UserCog 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const doctorLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload MRI Scan', path: '/upload', icon: UploadCloud },
    { name: 'Patient Directory', path: '/patients', icon: Users },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'Settings', path: '/profile', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Admin Control Center', path: '/admin', icon: LayoutDashboard },
    { name: 'Patient Records', path: '/patients', icon: Users },
    { name: 'All Scans', path: '/history', icon: History },
    { name: 'User Management', path: '/users', icon: UserCog },
    { name: 'Settings', path: '/profile', icon: Settings },
  ];

  const activeClassName = "flex items-center space-x-3 rounded-lg bg-clinical-50 px-4 py-3 text-sm font-semibold text-clinical-700 transition duration-150";
  const inactiveClassName = "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition duration-150";

  const links = user.role === 'admin' ? adminLinks : doctorLinks;

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 border-r border-slate-200 bg-white pt-20 md:block">
      <div className="flex h-full flex-col justify-between p-4">
        {/* Nav Link List */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>


      </div>
    </aside>
  );
};

export default Sidebar;
