import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function StatusBadge({ status }) {
  const { t } = useLanguage();

  if (!status) return null;

  const normalized = status.toUpperCase();

  if (normalized === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
        {t('status.active')}
      </span>
    );
  }

  if (normalized === 'SOLD') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5"></span>
        {t('status.sold')}
      </span>
    );
  }

  if (normalized === 'FLAGGED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        {t('status.flagged')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  );
}
