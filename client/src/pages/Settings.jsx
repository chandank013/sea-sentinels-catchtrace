import React, { useState } from 'react';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Globe,
  Bell,
  Sliders,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { lang, setLang, t } = useLanguage();
  const [notifyAlerts, setNotifyAlerts] = useState(() => {
    try {
      const stored = localStorage.getItem('catchtrace_pref_notify_alerts');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });
  const [notifyHandovers, setNotifyHandovers] = useState(() => {
    try {
      const stored = localStorage.getItem('catchtrace_pref_notify_handovers');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });
  const [coldChainAlerts, setColdChainAlerts] = useState(() => {
    try {
      const stored = localStorage.getItem('catchtrace_pref_coldchain_alerts');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const togglePref = (key, val, setter) => {
    setter(val);
    localStorage.setItem(key, JSON.stringify(val));
    toast.success(lang === 'kn' ? 'ಅಧಿಸೂಚನೆ ಪ್ರಾಶಸ್ತ್ಯ ನವೀಕರಿಸಲಾಗಿದೆ' : 'Notification preference updated');
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo batches and alerts to original seed state?')) {
      try {
        await api.resetData();
        toast.success('Seed data reset successfully! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (err) {
        toast.error('Failed to reset data');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
        <PageHeader
          title={t('settings.title')}
          subtitle={t('settings.subtitle')}
        />

        <div className="bg-white rounded-ct p-4 sm:p-6 md:p-8 border border-borderLight shadow-card space-y-8">
          
          {/* Language Setting */}
          <div className="space-y-3 pb-6 border-b border-borderLight">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-ocean-600" />
              <h3 className="text-base font-bold text-navy-900">{t('settings.languagePref')}</h3>
            </div>
            <p className="text-xs text-textSecondary">
              {t('settings.languagePrefSub')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md pt-1">
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  toast.success('Language set to English');
                }}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-colors ${
                  lang === 'en'
                    ? 'border-ocean-600 bg-ocean-50 text-ocean-800 font-bold'
                    : 'border-borderLight hover:bg-slate-50 text-navy-900'
                }`}
              >
                <div>
                  <span className="text-sm font-bold block">{t('settings.englishName')}</span>
                  <span className="text-xs text-textSecondary">{t('settings.englishSub')}</span>
                </div>
                {lang === 'en' && <CheckCircle className="w-5 h-5 text-ocean-600" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLang('kn');
                  toast.success('ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ');
                }}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-colors ${
                  lang === 'kn'
                    ? 'border-ocean-600 bg-ocean-50 text-ocean-800 font-bold'
                    : 'border-borderLight hover:bg-slate-50 text-navy-900'
                }`}
              >
                <div>
                  <span className="text-sm font-bold block">{t('settings.kannadaName')}</span>
                  <span className="text-xs text-textSecondary">{t('settings.kannadaSub')}</span>
                </div>
                {lang === 'kn' && <CheckCircle className="w-5 h-5 text-ocean-600" />}
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4 pb-6 border-b border-borderLight">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-ocean-600" />
              <h3 className="text-base font-bold text-navy-900">{t('settings.notificationsTitle')}</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-navy-900 block">{t('settings.alertWeightLoss')}</span>
                  <span className="text-[11px] text-textSecondary">
                    Receive immediate notification when weight drops exceed 20% or steps are missed.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyAlerts}
                  onChange={(e) => togglePref('catchtrace_pref_notify_alerts', e.target.checked, setNotifyAlerts)}
                  className="w-4 h-4 text-ocean-600 rounded focus:ring-ocean-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-navy-900 block">{t('settings.alertColdChain')}</span>
                  <span className="text-[11px] text-textSecondary">
                    Alert when refrigerated vehicle temp exceeds 4°C during highway transit.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={coldChainAlerts}
                  onChange={(e) => togglePref('catchtrace_pref_coldchain_alerts', e.target.checked, setColdChainAlerts)}
                  className="w-4 h-4 text-ocean-600 rounded focus:ring-ocean-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-navy-900 block">{t('settings.alertHandovers')}</span>
                  <span className="text-[11px] text-textSecondary">
                    Notify when downstream partners sign off on a batch transfer.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyHandovers}
                  onChange={(e) => togglePref('catchtrace_pref_notify_handovers', e.target.checked, setNotifyHandovers)}
                  className="w-4 h-4 text-ocean-600 rounded focus:ring-ocean-500"
                />
              </label>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-navy-900 uppercase">{t('settings.resetDataTitle')}</h4>
              <p className="text-xs text-textSecondary">
                {t('settings.resetDataSub')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-statusDanger font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-red-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('settings.resetDataBtn')}</span>
            </button>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
