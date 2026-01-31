import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Activity, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Diagnostics', path: '/' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Activity, label: 'Risk Analysis', path: '/risk' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          MediAI
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
              ${isActive
                ? 'bg-primary-500/10 text-primary-400 shadow-[0_0_20px_rgba(14,165,233,0.15)] border border-primary-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
            {item.path === '/' && (
              <span className="absolute right-4 w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <div className="mt-4 flex items-center gap-3 px-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Dr. Smith</span>
            <span className="text-xs text-gray-500">Radiologist</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
