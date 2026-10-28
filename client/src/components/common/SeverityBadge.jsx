import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function SeverityBadge({ severity }) {
  const { t } = useLanguage();
  const sev = (severity || 'LOW').toUpperCase();

  if (sev === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        {t('severity.high')}
      </span>
    );
  }

  if (sev === 'MED' || sev === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        {t('severity.med')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      <Info className="w-3.5 h-3.5 text-blue-600" />
      {t('severity.low')}
    </span>
  );
}
