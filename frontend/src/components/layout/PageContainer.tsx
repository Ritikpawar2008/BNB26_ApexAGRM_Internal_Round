import React from 'react';
import { cn } from '../common/utils';

export interface PageContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ children, title, subtitle, action, className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn("flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full", className)}
        {...props}
      >
        {(title || action) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              {title && (
                <h1 className="text-xl md:text-2xl font-bold text-slate-100">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);
PageContainer.displayName = 'PageContainer';
