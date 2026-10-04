import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { label: 'All Projects', icon: LayoutDashboard, path: '/' },
    { label: 'New Project', icon: PlusCircle, path: '/projects/new' },
  ];

  return (
    <aside className="w-56 border-r border-[#23252a] bg-[#08090a] p-3 flex flex-col gap-1 select-none">
      <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[#62666d]">
        Workspace
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all duration-150 ${
              active
                ? 'bg-[#161718] text-[#ffffff] border border-[#23252a] shadow-sm'
                : 'text-[#8a8f98] hover:text-[#d0d6e0] hover:bg-[#0f1011]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#e4f222]' : 'text-[#62666d]'}`} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
};

