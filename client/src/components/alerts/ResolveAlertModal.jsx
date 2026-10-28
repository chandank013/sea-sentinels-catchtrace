import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { X, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import toast from 'react-hot-toast';

export default function ResolveAlertModal({ isOpen, onClose, alert, onResolve }) {
  const { lang, t } = useLanguage();
  const [resolutionNote, setResolutionNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !alert) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      toast.error(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಪರಿಹಾರ ಟಿಪ್ಪಣಿಯನ್ನು ನಮೂದಿಸಿ' : 'Please enter a resolution note');
      return;
    }

    setLoading(true);
    try {
      await onResolve(alert.id, resolutionNote.trim());
      toast.success(lang === 'kn' ? 'ಎಚ್ಚರಿಕೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಹರಿಸಲಾಗಿದೆ!' : 'Alert resolved successfully!');
      setResolutionNote('');
      onClose();
    } catch (err) {
      toast.error(err.message || (lang === 'kn' ? 'ಎಚ್ಚರಿಕೆಯನ್ನು ಪರಿಹರಿಸಲು ವಿಫಲವಾಗಿದೆ' : 'Failed to resolve alert'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-ct max-w-lg w-full overflow-hidden shadow-hover border border-borderLight flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-borderLight flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">
                {lang === 'kn' ? 'ಪೂರೈಕೆ ಜಾಲದ ಎಚ್ಚರಿಕೆ ಪರಿಹರಿಸಿ' : 'Resolve Supply-Chain Alert'}
              </h3>
              <p className="text-xs text-textSecondary">{alert.batch_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-textSecondary hover:text-navy-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-textSecondary uppercase block font-semibold">
                {lang === 'kn' ? 'ಎಚ್ಚರಿಕೆಯ ಪ್ರಕಾರ' : 'Alert Type'}
              </span>
              <span className="text-sm font-bold text-navy-900">{alert.typeLabel || alert.type}</span>
            </div>
            <SeverityBadge severity={alert.severity} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase mb-1">
              {lang === 'kn' ? 'ವಿವರಣೆ' : 'Description'}
            </label>
            <p className="text-sm font-medium text-navy-900 bg-red-50/50 p-3 rounded-lg border border-red-100 leading-relaxed">
              {alert.description}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1.5">
              {lang === 'kn' ? 'ಪರಿಹಾರ ಟಿಪ್ಪಣಿ' : 'Resolution Note'} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder={lang === 'kn' ? 'ಉದಾ. ಬಂದರು ತೂಕ ಕೇಂದ್ರದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ, ಮಾಪನಾಂಕ ವ್ಯತ್ಯಾಸ ಅನುಮೋದಿಸಲಾಗಿದೆ...' : 'e.g. Verified with harbour weight station, calibrated scale variance approved...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderLight">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-textSecondary hover:bg-slate-100 transition-colors"
            >
              {t('actions.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? (lang === 'kn' ? 'ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Resolving...') : (lang === 'kn' ? 'ಪರಿಹಾರ ದೃಢೀಕರಿಸಿ' : 'Mark as Resolved')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
