import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Video, X } from 'lucide-react';
import { cn } from '../common/utils';
import { Button } from '../common/Button';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'New Project', icon: Video, path: '/projects/new' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-950 p-4 flex flex-col gap-2 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-60 md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between md:hidden mb-4 px-2">
          <span className="font-semibold text-slate-200">Menu</span>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
