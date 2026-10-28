import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4 border-b border-borderLight/60 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm md:text-base text-textSecondary mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3 flex-wrap">{children}</div>}
    </div>
  );
}
