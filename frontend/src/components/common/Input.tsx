import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-[#8a8f98] mb-1.5">{label}</label>}
      <input
        className={`w-full bg-[#08090a] border ${
          error ? 'border-[#eb5757]' : 'border-[#23252a]'
        } rounded-[6px] px-3 py-2 text-sm text-[#ffffff] placeholder-[#62666d] focus:outline-none focus:border-[#8a8f98] transition-colors duration-150 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#eb5757] mt-1">{error}</p>}
    </div>
  );
};

