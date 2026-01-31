import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard', icon: '📊', text: 'Dashboard' },
    { id: 'analyze', icon: '🔬', text: 'Analyze Images' },
    { id: 'results', icon: '📋', text: 'Results' },
    { id: 'reports', icon: '📄', text: 'Reports' },
    { id: 'history', icon: '🕒', text: 'History' },
    { id: 'settings', icon: '⚙️', text: 'Settings' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🏥</div>
          MediVision AI
        </div>
        <p className="subtitle">Pneumonia Detection System</p>
      </div>
      
      <nav className="nav-menu">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.text}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;