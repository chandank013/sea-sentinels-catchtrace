import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import UserAvatar from '../components/common/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Building,
  MapPin,
  Shield,
  Key,
  BadgeCheck,
  Mail,
  Hash,
  LogOut,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Award,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [trustData, setTrustData] = useState({
    trustScore: user?.trust_score ?? 100,
    confirmedCount: user?.confirmed_count ?? 0,
    disputedCount: user?.disputed_count ?? 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadScore() {
      if (!user) return;
      try {
        const targetId = user.id || user.email || user.role;
        const res = await api.getUserTrustScore(targetId);
        if (isMounted && res) {
          setTrustData({
            trustScore: res.trust_score ?? 100,
            confirmedCount: res.confirmed_count ?? 0,
            disputedCount: res.disputed_count ?? 0,
            loading: false,
          });
        }
      } catch {
        if (isMounted) {
          setTrustData((prev) => ({ ...prev, loading: false }));
        }
      }
    }
    loadScore();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSignOutAndSwitch = () => {
    logout();
    toast.success(t('profile.confirmSignOut') || 'Signed out successfully. Select your next account on the login page.');
    navigate('/login');
  };

  const roleLabel = t(`roles.${(user?.role || 'admin').toLowerCase()}`, user?.roleLabel || user?.role || 'Fisher');
  const isAdmin = user?.role === 'ADMIN';

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
          
          {/* User Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-borderLight">
            <UserAvatar user={user} size="lg" />
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900">{user?.name}</h2>
                <BadgeCheck className="w-5 h-5 text-ocean-600 shrink-0" />
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('profile.activeSession', 'Active Session')}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-0.5">
                <span className="inline-block text-xs font-bold text-ocean-700 bg-ocean-50 px-3 py-0.5 rounded-full border border-ocean-200">
                  {roleLabel}
                </span>
                <span className="text-xs text-textSecondary font-medium">
                  {user?.org}
                </span>
              </div>

              <p className="text-xs text-textMuted flex items-center justify-center sm:justify-start gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{user?.location || 'Karnataka Coastal Harbour'}</span>
              </p>
            </div>
          </div>

          {/* User Trust Score & Handover Reputation Card */}
          <div className="bg-gradient-to-br from-slate-50 via-white to-ocean-50/40 rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isAdmin || trustData.trustScore >= 90
                    ? 'bg-emerald-100 text-emerald-700'
                    : trustData.trustScore >= 70
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-navy-900">
                      {t('profile.trustScoreTitle', 'My Trust Score & Handover Reputation')}
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isAdmin || trustData.trustScore >= 90
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : trustData.trustScore >= 70
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {isAdmin
                        ? 'Regulatory Authority'
                        : trustData.trustScore >= 90
                        ? 'Top Tier Custodian'
                        : trustData.trustScore >= 70
                        ? 'Good Standing'
                        : 'Under Review'}
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {isAdmin
                      ? 'System Administrator with full compliance monitoring authority across the network'
                      : t('profile.trustScoreSubtitle', 'Calculated across all physical handovers recorded on the CatchTrace ledger')}
                  </p>
                </div>
              </div>

              {/* Large Score Display */}
              <div className="flex items-center gap-3 self-start sm:self-auto bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-textSecondary block">Ledger Trust</span>
                  <span className="text-[11px] font-medium text-textMuted">
                    {isAdmin ? 'System Oversight' : `${trustData.confirmedCount + trustData.disputedCount} Total Handovers`}
                  </span>
                </div>
                <div className={`text-2xl sm:text-3xl font-black ${
                  isAdmin || trustData.trustScore >= 90
                    ? 'text-emerald-600'
                    : trustData.trustScore >= 70
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}>
                  {trustData.loading ? '...' : isAdmin ? '100%' : `${trustData.trustScore}%`}
                </div>
              </div>
            </div>

            {/* Metric Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100/90 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
                      {t('profile.confirmedHandovers', 'Confirmed Handovers')}
                    </span>
                    <span className="text-base font-black text-emerald-700">
                      {isAdmin ? 'All Passed' : trustData.confirmedCount}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Accepted
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-100/90 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
                      {t('profile.disputedHandovers', 'Disputed Handovers')}
                    </span>
                    <span className={`text-base font-black ${!isAdmin && trustData.disputedCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {isAdmin ? '0' : trustData.disputedCount}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  !isAdmin && trustData.disputedCount > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                    : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  {!isAdmin && trustData.disputedCount > 0 ? 'Flagged' : 'Clean'}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-ocean-50 text-ocean-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
                      {t('profile.ledgerAudit', 'Ledger Integrity')}
                    </span>
                    <span className="text-xs font-black text-navy-900 block truncate">
                      100% Cryptographic
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-ocean-700 font-bold bg-ocean-50 px-2 py-0.5 rounded-md border border-ocean-100">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Registered Email */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3 transition-colors hover:bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-sky-700" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider block">
                  {t('profile.registeredEmail', 'Registered Email')}
                </span>
                <span className="font-bold text-navy-900 text-sm truncate block" title={user?.email}>
                  {user?.email || 'N/A'}
                </span>
              </div>
            </div>

            {/* Stakeholder / User ID */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3 transition-colors hover:bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Hash className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider block">
                  {t('profile.accountId', 'Account / Stakeholder ID')}
                </span>
                <span className="font-mono font-bold text-navy-900 text-sm truncate block">
                  {user?.id || 'USR-CT-2026-01'}
                </span>
              </div>
            </div>

            {/* Organization / Vessel */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3 transition-colors hover:bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-ocean-100 flex items-center justify-center shrink-0">
                <Building className="w-4 h-4 text-ocean-700" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider block">
                  {t('profile.organization')}
                </span>
                <span className="font-bold text-navy-900 text-sm truncate block" title={user?.org}>
                  {user?.org || 'N/A'}
                </span>
              </div>
            </div>

            {/* Harbour / Location */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3 transition-colors hover:bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider block">
                  {t('profile.harbourLocation')}
                </span>
                <span className="font-bold text-navy-900 text-sm truncate block" title={user?.location}>
                  {user?.location || 'N/A'}
                </span>
              </div>
            </div>

            {/* Role Access Level */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3 transition-colors hover:bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-amber-700" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider block">
                  {t('profile.roleAccess')}
                </span>
                <span className="font-bold text-navy-900 text-sm">
                  {roleLabel} ({user?.role})
                </span>
              </div>
            </div>

            {/* Session Status */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3 transition-colors hover:bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider block">
                  {t('profile.sessionStatus')}
                </span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-emerald-700 text-sm">
                    {t('profile.authenticated')}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Cryptographic Compliance Notice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-ocean-50/70 to-slate-50 border border-ocean-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ocean-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 flex-1 text-xs">
              <h4 className="font-bold text-navy-900 flex items-center gap-1.5">
                <span>{t('profile.securityNote')}</span>
                <span className="text-[10px] bg-ocean-100 text-ocean-800 font-semibold px-2 py-0.2 rounded-full">
                  {t('profile.ledgerVerified', 'Ledger Node Verified')}
                </span>
              </h4>
              <p className="text-textSecondary text-[11px] leading-relaxed">
                {t('profile.securityNoteDesc')}
              </p>
            </div>
          </div>

          {/* Account Actions / Pitch Switching Bar */}
          <div className="pt-4 border-t border-borderLight flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/settings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-borderLight text-xs font-semibold text-textSecondary hover:text-navy-900 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-textMuted" />
              <span>{t('profile.settingsBtn', 'System Settings')}</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOutAndSwitch}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('profile.signOutSwitch', 'Sign Out & Switch Account')}</span>
            </button>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}