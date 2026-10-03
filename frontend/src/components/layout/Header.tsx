import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuToggle}
            className="md:hidden mr-1"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">CreatorAI</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge variant="info" text="MVP v0.1" className="font-mono hidden sm:inline-flex" />
      </div>
    </header>
  );
};
