import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Shield } from 'lucide-react';

interface HeaderProps {
  currentRole?: 'editor' | 'client';
  onRoleToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole = 'editor', onRoleToggle }) => {
  return (
    <header className="h-14 border-b border-[#23252a] bg-[#08090a]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#e4f222] group-hover:border-[#383b3f] transition-colors">
          <Video className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-[#ffffff] tracking-tight">CreatorAI</span>
          <span className="text-[10px] text-[#62666d] font-mono tracking-normal">studio</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {onRoleToggle && (
          <button
            onClick={onRoleToggle}
            className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#161718] hover:bg-[#23252a] border border-[#23252a] text-xs font-mono text-[#d0d6e0] transition-colors"
            title="Click to toggle perspective between Editor and Client"
          >
            <Shield className="w-3 h-3 text-[#e4f222]" />
            <span>Role:</span>
            <span className={currentRole === 'editor' ? 'text-[#e4f222] font-semibold' : 'text-[#02b8cc] font-semibold'}>
              {currentRole === 'editor' ? 'Editor Team' : 'Client Mode'}
            </span>
          </button>
        )}
        <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-white/[0.04] text-[#8a8f98] border border-[#23252a] font-mono">
          v0.2-pro
        </span>
      </div>
    </header>
  );
};

