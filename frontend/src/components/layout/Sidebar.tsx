import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Video, Scissors, Download } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'New Project', icon: Video, path: '/projects/new' },
  ];

  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-900 p-4 flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
};
