import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import SeverityBadge from '../common/SeverityBadge';
import { CheckCircle2, AlertCircle, ArrowUpRight, Check } from 'lucide-react';

export default function AlertTable({ alerts = [], onSelectAlert }) {
  const { lang, t } = useLanguage();

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-ct border border-borderLight p-10 text-center text-textSecondary text-sm">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        {lang === 'kn'
          ? 'ಪ್ರಸ್ತುತ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ. ಎಲ್ಲಾ ಮೀನು ಪೂರೈಕೆ ದಾಖಲೆಗಳು ಸಹಜವಾಗಿವೆ.'
          : 'No active alerts matching your current filter. All fish supply chain records are nominal.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-ct border border-borderLight shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-borderLight text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                <th className="py-3 px-4">{lang === 'kn' ? 'ತೀವ್ರತೆ' : 'Severity'}</th>
                <th className="py-3 px-4">{lang === 'kn' ? 'ಎಚ್ಚರಿಕೆಯ ಪ್ರಕಾರ' : 'Alert Type'}</th>
                <th className="py-3 px-4">{t('batches.batchId', 'Batch ID')}</th>
                <th className="py-3 px-4 min-w-[280px]">{lang === 'kn' ? 'ವಿವರಣೆ' : 'Description'}</th>
                <th className="py-3 px-4">{lang === 'kn' ? 'ಪತ್ತೆಯಾದ ಸಮಯ' : 'Detected'}</th>
                <th className="py-3 px-4">{t('batches.status', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('batches.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight/60 text-xs">
              {alerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Severity Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <SeverityBadge severity={alt.severity} />
                  </td>

                  {/* Alert Type */}
                  <td className="py-3 px-4 font-semibold text-navy-900 whitespace-nowrap">
                    {alt.typeLabel || alt.type}
                  </td>

                  {/* Batch ID */}
                  <td className="py-3 px-4 font-mono font-bold text-ocean-700 whitespace-nowrap">
                    <NavLink to={`/batches/${alt.batch_id}`} className="hover:underline flex items-center gap-1">
                      <span>{alt.batch_id}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                    </NavLink>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 text-textPrimary leading-relaxed">
                    {alt.description}
                    {alt.resolution_note && (
                      <div className="mt-1 text-[11px] text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100">
                        <strong>{lang === 'kn' ? 'ಪರಿಹಾರ:' : 'Resolution:'}</strong> {alt.resolution_note}
                      </div>
                    )}
                  </td>

                  {/* Detected Time */}
                  <td className="py-3 px-4 text-textSecondary whitespace-nowrap">
                    {alt.time || (lang === 'kn' ? 'ಇತ್ತೀಚಿನದು' : 'Recent')}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {alt.resolved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {lang === 'kn' ? 'ಪರಿಹರಿಸಲಾಗಿದೆ' : 'Resolved'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        {lang === 'kn' ? 'ತೆರೆದಿದೆ' : 'Open'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {!alt.resolved ? (
                      <button
                        onClick={() => onSelectAlert(alt)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-ocean-50 text-ocean-700 hover:bg-ocean-100 transition-colors"
                      >
                        {lang === 'kn' ? 'ಪರಿಹರಿಸಿ' : 'Resolve'}
                      </button>
                    ) : (
                      <span className="text-textSecondary text-[11px]">{lang === 'kn' ? 'ಮುಕ್ತಾಯ' : 'Closed'}</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (shown only on mobile) */}
      <div className="md:hidden space-y-3">
        {alerts.map((alt) => (
          <div key={alt.id} className="bg-white rounded-ct p-4 border border-borderLight shadow-subtle space-y-3">
            <div className="flex items-center justify-between gap-2">
              <SeverityBadge severity={alt.severity} />
              {alt.resolved ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {lang === 'kn' ? 'ಪರಿಹರಿಸಲಾಗಿದೆ' : 'Resolved'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  {lang === 'kn' ? 'ತೆರೆದಿದೆ' : 'Open'}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-navy-900 text-xs">{alt.typeLabel || alt.type}</span>
                <NavLink to={`/batches/${alt.batch_id}`} className="font-mono font-bold text-ocean-700 text-xs hover:underline flex items-center gap-0.5">
                  <span>{alt.batch_id}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </NavLink>
              </div>
              <p className="text-xs text-textPrimary mt-1.5 leading-relaxed">{alt.description}</p>
              {alt.resolution_note && (
                <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded border border-emerald-100">
                  <strong>{lang === 'kn' ? 'ಪರಿಹಾರ:' : 'Resolution:'}</strong> {alt.resolution_note}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-borderLight flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-textSecondary">{alt.time || (lang === 'kn' ? 'ಇತ್ತೀಚಿನದು' : 'Recent')}</span>
              {!alt.resolved ? (
                <button
                  onClick={() => onSelectAlert(alt)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-ocean-600 hover:bg-ocean-700 text-white transition-colors shadow-xs"
                >
                  {lang === 'kn' ? 'ಪರಿಹರಿಸಿ' : 'Resolve'}
                </button>
              ) : (
                <span className="text-textSecondary text-[11px] font-semibold">{lang === 'kn' ? 'ಮುಕ್ತಾಯ' : 'Closed'}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
