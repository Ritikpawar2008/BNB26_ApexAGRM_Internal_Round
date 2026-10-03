import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none";
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-800",
    outline: "border border-slate-600 hover:bg-slate-800 text-slate-200",
    danger: "bg-rose-600 hover:bg-rose-700 text-white"
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};
