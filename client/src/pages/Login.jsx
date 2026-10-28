import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CatchTraceLogo from '../components/common/CatchTraceLogo';
import { useLanguage } from '../context/LanguageContext';
import {
  Anchor,
  ShoppingBag,
  Cpu,
  Truck,
  Store,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronDown,
  Lock,
  ArrowRight,
  HelpCircle,
  X,
  Mail,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { loginWithRoleAndPin, loginWithCredentials } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Form State
  const [selectedRole, setSelectedRole] = useState('FISHER');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const dropdownRef = useRef(null);

  const roleOptions = [
    {
      key: 'FISHER',
      label: 'Fisher',
      desc: 'Harbour landings & catch logging',
      email: 'ramesh.fisher@gmail.com',
      icon: Anchor,
    },
    {
      key: 'TRADER',
      label: 'Trader',
      desc: 'Auction procurement & handover',
      email: 'ganesh.trader@gmail.com',
      icon: ShoppingBag,
    },
    {
      key: 'PROCESSOR',
      label: 'Processor',
      desc: 'Intake weight, filleting & yield',
      email: 'sunil.processor@gmail.com',
      icon: Cpu,
    },
    {
      key: 'TRANSPORTER',
      label: 'Transporter',
      desc: 'Reefer transit & temperature log',
      email: 'rafi.logistics@gmail.com',
      icon: Truck,
    },
    {
      key: 'SELLER',
      label: 'Seller',
      desc: 'Wholesale & retail counter sales',
      email: 'anand.seafood@gmail.com',
      icon: Store,
    },
    {
      key: 'ADMIN',
      label: 'Admin',
      desc: 'Regulatory oversight & audit',
      email: 'adiga.fisheries@gmail.com',
      icon: Shield,
    },
  ];

  const currentRole = roleOptions.find((r) => r.key === selectedRole) || roleOptions[0];
  const CurrentIcon = currentRole.icon;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setDropdownOpen(false);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!pin || pin.length < 4) {
      setErrorMsg('Please enter your 4-digit security PIN.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithCredentials(email.trim(), pin.trim());
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(
        err.message || 'Authentication failed. Please verify your email and 4-digit PIN.'
      );
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900 font-sans selection:bg-ocean-100 selection:text-ocean-800">
      
      {/* ========================================================= */}
      {/* 1. COMPACT ENTERPRISE HEADER                              */}
      {/* ========================================================= */}
      <header className="w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <CatchTraceLogo size="sm" showTagline={false} />
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium pl-2 border-l border-slate-200">
              Seafood Supply-Chain Traceability
            </span>
          </NavLink>

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-navy-900 hover:bg-slate-50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-ocean-600" />
            <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT — NARROW FOCUSED FORM AREA                */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px]">
          
          {/* Crisp, restrained form container */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 shadow-xs">
            
            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t('auth.welcomeBack')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t('auth.signInSub')}
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth.selectRole')} <span className="text-rose-500">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full h-11 px-3 rounded-lg border text-left flex items-center justify-between transition-colors bg-white ${
                    dropdownOpen
                      ? 'border-ocean-600 ring-2 ring-ocean-500/20'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <CurrentIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="text-sm font-semibold text-slate-900 block leading-tight">
                        {currentRole.label}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      dropdownOpen ? 'rotate-180 text-ocean-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1.5 max-h-64 overflow-y-auto">
                    {roleOptions.map((role) => {
                      const Icon = role.icon;
                      const isSelected = role.key === selectedRole;
                      return (
                        <button
                          key={role.key}
                          type="button"
                          onClick={() => handleRoleChange(role.key)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-ocean-50/80 text-ocean-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-ocean-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{role.label}</p>
                              <p className="text-[11px] text-slate-400 font-normal">{role.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-ocean-600 mr-1 shrink-0"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth.email', 'Email address')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name1234@gmail.com"
                    autoComplete="off"
                    required
                    className="h-10 w-full pl-9 pr-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 transition-colors"
                  />
                </div>
              </div>

              {/* 4-Digit Security PIN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t('auth.pin', 'Security PIN')} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSupportModalOpen(true)}
                    className="text-[11px] text-slate-500 hover:text-ocean-600 transition-colors flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{t('auth.forgotPin', 'Forgot PIN?')}</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="pin-input"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="h-10 w-full pl-9 pr-10 text-sm font-mono tracking-widest rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-lg bg-ocean-600 hover:bg-ocean-700 active:bg-ocean-800 text-white text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('auth.verifying', 'Verifying credentials...')}</span>
                    </div>
                  ) : (
                    <span>{t('auth.signIn', 'Sign In')}</span>
                  )}
                </button>
              </div>

            </form>

            {/* Bottom Register Link */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                {t('auth.noAccount', "Don't have an account?")}{' '}
                <NavLink
                  to="/register"
                  className="font-semibold text-ocean-600 hover:text-ocean-700 transition-colors"
                >
                  {t('auth.register', 'Register')}
                </NavLink>
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. UNDERSTATED ENTERPRISE FOOTER                          */}
      {/* ========================================================= */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>{t('footer.rights', '© 2026 CatchTrace Platforms Inc. All rights reserved.')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">{t('footer.privacy', 'Privacy Policy')}</span>
            <span>·</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">{t('footer.terms', 'Terms of Service')}</span>
            <span>·</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Security & Compliance</span>
            <span>·</span>
            <button
              onClick={() => setSupportModalOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Support Desk
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* SUPPORT MODAL                                             */}
      {/* ========================================================= */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-ocean-600" />
                <h3 className="font-bold text-slate-900 text-sm">Harbour Terminal Support</h3>
              </div>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                CatchTrace accounts are tied to your registered maritime or logistics identity. If you cannot remember your 4-digit security PIN:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
                <li>Contact your harbour master or fleet supervisor to trigger an in-person PIN reset.</li>
                <li>Ensure you bring your vessel registration or handler license card.</li>
                <li>Or register a new handler account using the registration portal.</li>
              </ul>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold block text-slate-900">Regional Help Desk:</span>
                <span>Mangaluru Coastal Fisheries Division: +91 824 242 1234</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
