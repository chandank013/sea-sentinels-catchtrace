import React from 'react';
import { NavLink } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { Eye, PlusCircle, QrCode, ArrowRight, Anchor, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BatchTable({ batches = [], onOpenQR }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!batches || batches.length === 0) {
    return (
      <div className="bg-white rounded-ct border border-borderLight p-12 text-center text-textSecondary text-sm shadow-subtle">
        <Anchor className="w-10 h-10 text-ocean-400 mx-auto mb-3 opacity-60" />
        <h4 className="font-bold text-navy-900 text-base mb-1">{t('batches.noBatchesFound')}</h4>
        <p className="text-xs">{t('batches.noBatchesMatch')}</p>
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
                <th className="py-3 px-4">{t('batches.batchId')}</th>
                <th className="py-3 px-4">{t('batches.species')}</th>
                <th className="py-3 px-4">{t('batches.landingCentre')}</th>
                <th className="py-3 px-4">{t('batches.initialWeight')}</th>
                <th className="py-3 px-4">{t('batches.currentWeight')}</th>
                <th className="py-3 px-4">{t('batches.currentHandler')}</th>
                <th className="py-3 px-4">{t('batches.landedAt')}</th>
                <th className="py-3 px-4">{t('batches.status')}</th>
                <th className="py-3 px-4 text-right">{t('batches.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight/60 text-xs">
              {batches.map((batch) => (
                <tr key={batch.batch_id} className="hover:bg-slate-50/60 transition-colors group">
                  
                  {/* Batch ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-ocean-700 whitespace-nowrap">
                    <NavLink to={`/batches/${batch.batch_id}`} className="hover:underline flex items-center gap-1.5">
                      <span>{batch.batch_id}</span>
                    </NavLink>
                  </td>

                  {/* Species */}
                  <td className="py-3.5 px-4 font-semibold text-navy-900 whitespace-nowrap">
                    {t(`species.${batch.species}`, batch.species)}
                  </td>

                  {/* Landing Centre */}
                  <td className="py-3.5 px-4 text-textPrimary whitespace-nowrap">
                    {t(`harbours.${batch.landing_centre}`, batch.landing_centre)}
                  </td>

                  {/* Initial Weight */}
                  <td className="py-3.5 px-4 text-textSecondary whitespace-nowrap font-medium">
                    {batch.initial_weight_kg} kg
                  </td>

                  {/* Current Weight */}
                  <td className="py-3.5 px-4 text-navy-900 font-bold whitespace-nowrap">
                    {batch.current_weight_kg} kg
                  </td>

                  {/* Handler */}
                  <td className="py-3.5 px-4 text-textSecondary truncate max-w-[150px]" title={batch.current_handler}>
                    {batch.current_handler || 'Harbour Landing'}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-textSecondary whitespace-nowrap">
                    {batch.landed_at ? new Date(batch.landed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={batch.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {onOpenQR && (
                        <button
                          onClick={() => onOpenQR(batch)}
                          className="p-1.5 rounded-lg text-ocean-600 hover:bg-ocean-50 transition-colors"
                          title={t('actions.downloadQr')}
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      )}

                      <NavLink
                        to={`/batches/${batch.batch_id}?print=true`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                        title={t('actions.downloadPdf')}
                      >
                        <FileText className="w-4 h-4" />
                      </NavLink>

                      {batch.status !== 'SOLD' && (
                        <NavLink
                          to={`/batches/${batch.batch_id}/add-event`}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title={t('actions.addEvent')}
                        >
                          <PlusCircle className="w-4 h-4" />
                        </NavLink>
                      )}

                      <NavLink
                        to={`/batches/${batch.batch_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-ocean-50 hover:text-ocean-700 text-navy-900 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('actions.viewDetails')}</span>
                      </NavLink>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (shown only on mobile) */}
      <div className="md:hidden space-y-3">
        {batches.map((batch) => (
          <div key={batch.batch_id} className="bg-white rounded-ct p-4 border border-borderLight shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-ocean-700 text-sm">{batch.batch_id}</span>
              <StatusBadge status={batch.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-textSecondary block text-[10px] uppercase">{t('batches.species')}</span>
                <span className="font-bold text-navy-900">{t(`species.${batch.species}`, batch.species)}</span>
              </div>
              <div>
                <span className="text-textSecondary block text-[10px] uppercase">{t('batches.currentWeight')}</span>
                <span className="font-bold text-navy-900">{batch.current_weight_kg} kg</span>
              </div>
              <div className="col-span-2">
                <span className="text-textSecondary block text-[10px] uppercase">{t('batches.landingCentre')}</span>
                <span className="text-textPrimary">{t(`harbours.${batch.landing_centre}`, batch.landing_centre)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-borderLight flex items-center justify-between">
              <span className="text-[11px] text-textSecondary">
                {batch.events?.length || 1} {t('batchDetails.eventsLogged')}
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {onOpenQR && (
                  <button
                    onClick={() => onOpenQR(batch)}
                    className="p-1.5 text-ocean-600 hover:bg-ocean-50 rounded"
                    title={t('actions.downloadQr')}
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                )}
                <NavLink
                  to={`/batches/${batch.batch_id}?print=true`}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                  title={t('actions.downloadPdf')}
                >
                  <FileText className="w-4 h-4" />
                </NavLink>
                <NavLink
                  to={`/batches/${batch.batch_id}`}
                  className="px-3 py-1.5 rounded-lg bg-ocean-600 text-white font-semibold text-xs flex items-center gap-1"
                >
                  <span>{t('actions.viewDetails')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
