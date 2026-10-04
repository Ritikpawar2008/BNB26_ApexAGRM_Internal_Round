import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, title, subtitle, action }) => {
  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full bg-[#08090a]">
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#23252a] gap-4">
          <div>
            {title && <h1 className="text-xl md:text-2xl font-semibold text-[#ffffff] tracking-tight">{title}</h1>}
            {subtitle && <p className="text-xs md:text-sm text-[#8a8f98] mt-1">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

