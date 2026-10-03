import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, title, subtitle, action }) => {
  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
