import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, iconColor = 'text-ocean-600', iconBg = 'bg-ocean-50' }) {
  return (
    <div className="bg-white rounded-ct p-6 border border-borderLight shadow-subtle hover:shadow-card transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-textSecondary">{title}</p>
          <h3 className="text-3xl font-bold text-navy-900 mt-2 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          {trend.startsWith('+') ? (
            <span className="flex items-center text-statusSuccess font-semibold">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {trend}
            </span>
          ) : (
            <span className="flex items-center text-statusDanger font-semibold">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              {trend}
            </span>
          )}
          <span className="text-textSecondary">{trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
}
