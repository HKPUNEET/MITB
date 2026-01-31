import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 font-sans selection:bg-primary-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-medical-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 mix-blend-screen" />
      </div>

      <Sidebar />

      <main className="pl-64 min-h-screen relative z-10 transition-all duration-300">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
