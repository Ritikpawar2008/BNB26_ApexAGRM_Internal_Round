import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>}
      <input
        className={`w-full bg-slate-900 border ${error ? 'border-rose-500' : 'border-slate-700'} rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
};
