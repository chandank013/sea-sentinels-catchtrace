import React from 'react';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User,
  Building,
  MapPin,
  Shield,
  Key,
  BadgeCheck,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, loginWithRoleAndPin } = useAuth();
  const { t } = useLanguage();

  const handleSwitchAccount = async (roleKey) => {
    const demo = DEMO_ACCOUNTS[roleKey];
    if (demo) {
      await loginWithRoleAndPin(roleKey, demo.pin);
      toast.success(`Switched role to ${demo.user.roleLabel}!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
        <PageHeader
          title={t('profile.title')}
          subtitle={t('profile.subtitle')}
        />

        {/* Profile Card */}
        <div className="bg-white rounded-ct p-6 sm:p-8 border border-borderLight shadow-card space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-borderLight">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-ocean-100 shadow-md"
            />
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-navy-900">{user?.name}</h2>
                <BadgeCheck className="w-5 h-5 text-ocean-600" />
              </div>
              <span className="inline-block text-xs font-bold text-ocean-700 bg-ocean-50 px-3 py-0.5 rounded-full border border-ocean-200">
                {t(`roles.${(user?.role||'admin').toLowerCase()}`, user?.roleLabel || user?.role)}
              </span>
              <p className="text-xs text-textSecondary pt-1">{user?.org}</p>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Building className="w-5 h-5 text-ocean-600 shrink-0" />
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-bold block">{t('profile.organization')}</span>
                <span className="font-bold text-navy-900 text-sm">{user?.org}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-bold block">{t('profile.harbourLocation')}</span>
                <span className="font-bold text-navy-900 text-sm">{user?.location}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-bold block">{t('profile.roleAccess')}</span>
                <span className="font-bold text-navy-900 text-sm">{user?.role}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Key className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] text-textSecondary uppercase font-bold block">{t('profile.sessionStatus')}</span>
                <span className="font-bold text-emerald-700 text-sm">{t('profile.authenticated')}</span>
              </div>
            </div>
          </div>

          {/* Fast Switch Role Helper for Demo */}
          <div className="pt-4 border-t border-borderLight">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-ocean-600" />
              <span>{t('profile.fastSwitch')}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(DEMO_ACCOUNTS).map((key) => {
                const acc = DEMO_ACCOUNTS[key];
                const isCurrent = user?.role === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSwitchAccount(key)}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                      isCurrent
                        ? 'border-ocean-600 bg-ocean-50/80 text-ocean-800 font-bold'
                        : 'border-borderLight hover:bg-slate-50 text-textSecondary'
                    }`}
                  >
                    <span className="font-bold block text-navy-900">{acc.user.roleLabel}</span>
                    <span className="text-[11px] text-textSecondary">{acc.user.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
