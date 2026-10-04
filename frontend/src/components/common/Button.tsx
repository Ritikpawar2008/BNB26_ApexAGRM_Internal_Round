import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  const base = "inline-flex items-center justify-center font-medium rounded-[6px] tracking-tight transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none";
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-1.5 text-sm",
    lg: "px-5 py-2.5 text-base"
  };
  const variantClasses = {
    primary: "bg-[#e4f222] hover:bg-[#d8e519] active:bg-[#cad612] text-[#08090a] font-semibold shadow-sm hover:shadow",
    secondary: "bg-[#161718] hover:bg-[#23252a] text-[#d0d6e0] border border-[#23252a] hover:border-[#383b3f]",
    outline: "bg-transparent border border-[#23252a] hover:border-[#383b3f] text-[#d0d6e0] hover:text-white hover:bg-[#0f1011]",
    ghost: "bg-transparent hover:bg-[#161718] text-[#8a8f98] hover:text-[#d0d6e0]",
    danger: "bg-[#eb5757]/10 hover:bg-[#eb5757] border border-[#eb5757]/20 hover:border-[#eb5757] text-[#eb5757] hover:text-white"
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};

