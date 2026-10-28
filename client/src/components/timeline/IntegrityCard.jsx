import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle, RefreshCw, Hash } from 'lucide-react';

export default function IntegrityCard({ verificationResult, onReverify, loading = false }) {
  const { lang, t } = useLanguage();

  if (!verificationResult) return null;

  const { isValid, batch_id, totalSteps, verifiedAt, lastHash, brokenStep } = verificationResult;

  return (
    <div className={`rounded-ct border p-6 transition-all duration-200 shadow-card ${
      isValid ? 'bg-white border-emerald-200' : 'bg-white border-red-200'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-borderLight/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${isValid ? 'text-emerald-600' : 'text-red-600'}`} />
          <h3 className="text-base font-bold text-navy-900">
            {lang === 'kn' ? 'ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಸಮಗ್ರತೆ ಫಲಿತಾಂಶ' : 'Cryptographic Integrity Result'}
          </h3>
        </div>

        {onReverify && (
          <button
            onClick={onReverify}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-navy-900 border border-borderLight transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-ocean-600' : ''}`} />
            <span>{loading ? (lang === 'kn' ? 'ಮರು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Re-hashing...') : (lang === 'kn' ? 'ಹ್ಯಾಶ್ ಸರಪಳಿ ಮರುಪರಿಶೀಲಿಸಿ' : 'Re-verify Hash Chain')}</span>
          </button>
        )}
      </div>

      {/* Main Status Display matching reference mockup #9 */}
      <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Status indicator */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
          }`}>
            {isValid ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
          </div>

          <div>
            <h4 className={`text-lg font-bold ${isValid ? 'text-emerald-800' : 'text-red-800'}`}>
              {isValid
                ? (lang === 'kn' ? 'ಮಾನ್ಯವಾದ ದಾಖಲೆ' : 'Valid Record')
                : (lang === 'kn' ? 'ಸಮಗ್ರತೆ ತಪಾಸಣೆ ವಿಫಲವಾಗಿದೆ' : 'Integrity Check Failed')}
            </h4>
            <p className="text-xs text-textSecondary mt-0.5 max-w-md">
              {isValid
                ? (lang === 'kn'
                    ? 'ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ, ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿವೆ ಮತ್ತು ಯಾವುದೇ ತಿರುಚುವಿಕೆ ಇಲ್ಲ.'
                    : 'All records are intact, cryptographically verified, and completely untampered.')
                : brokenStep
                ? (lang === 'kn'
                    ? `ಹಂತ #${brokenStep.seq} (${brokenStep.title}) ನಲ್ಲಿ ಹ್ಯಾಶ್ ವ್ಯತ್ಯಾಸ ಕಂಡುಬಂದಿದೆ. ದಾಖಲೆಯನ್ನು ಬದಲಾಯಿಸಲಾಗಿದೆ!`
                    : `Hash chain anomaly detected at Step #${brokenStep.seq} (${brokenStep.title}). Record was altered in storage!`)
                : (lang === 'kn'
                    ? 'ಸಂಗ್ರಹಿಸಿದ ಹ್ಯಾಶ್ ಗಣಿತದ SHA-256 ಹ್ಯಾಶ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.'
                    : 'A stored event hash does not match mathematical SHA-256 expectation.')}
            </p>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-textSecondary uppercase block font-semibold">
              {t('batches.batchId', 'Batch ID')}
            </span>
            <span className="font-mono font-bold text-navy-900">{batch_id}</span>
          </div>

          <div>
            <span className="text-[10px] text-textSecondary uppercase block font-semibold">
              {lang === 'kn' ? 'ಒಟ್ಟು ಹಂತಗಳು' : 'Total Steps'}
            </span>
            <span className="font-bold text-navy-900">
              {totalSteps} {lang === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'verified'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-textSecondary uppercase block font-semibold">
              {lang === 'kn' ? 'ಕೊನೆಯ ಪರಿಶೀಲನೆ' : 'Last Verified'}
            </span>
            <span className="text-navy-900 font-medium">
              {new Date(verifiedAt).toLocaleTimeString(lang === 'kn' ? 'kn-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-textSecondary uppercase block font-semibold">
              {lang === 'kn' ? 'ಸರಪಳಿ ಹ್ಯಾಶ್' : 'Chain Hash'}
            </span>
            <span className="font-mono text-ocean-700 font-semibold block truncate max-w-[100px]" title={lastHash}>
              {lastHash ? `${lastHash.slice(0, 6)}...${lastHash.slice(-6)}` : 'GENESIS'}
            </span>
          </div>
        </div>

      </div>

      {/* Broken Step Alert if integrity failed */}
      {!isValid && brokenStep && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{lang === 'kn' ? 'ಮುರಿದ ಅನುಕ್ರಮದ ವಿವರಗಳು:' : 'Broken Sequence Details:'}</span>
          </div>
          <p className="text-red-700 leading-relaxed">
            {lang === 'kn'
              ? `ಹಂತ #${brokenStep.seq} (${brokenStep.title}) ಬ್ಲಾಕ್‌ಚೈನ್-ರೀತಿಯ ಹ್ಯಾಶ್ ಲಿಂಕ್ ಅನ್ನು ಮುರಿದ ಮಾರ್ಪಡಿಸಿದ ವಿಷಯಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. ಕಾರಣ: ${brokenStep.reason}`
              : `Step #${brokenStep.seq} (${brokenStep.title}) contains modified contents that broke the blockchain-like hash link. Reason: ${brokenStep.reason}`}
          </p>
        </div>
      )}

    </div>
  );
}
