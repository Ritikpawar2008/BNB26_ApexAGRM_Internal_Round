import React from 'react';

interface StudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  icon?: React.ReactNode;
}

/**
 * Pill button with the editorial "rolling label" hover — the label
 * slides up and is replaced by an identical copy.
 */
export const StudioButton: React.FC<StudioButtonProps> = ({
  variant = 'ghost',
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}) => (
  <button type={type} className={`st-btn st-btn--${variant} ${className}`} {...props}>
    <span className="st-roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
    {icon}
  </button>
);
