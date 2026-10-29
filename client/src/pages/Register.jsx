import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Building,
  MapPin,
  User,
  Mail,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function Register() {
  const { registerUser } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('FISHER');
  const [orgName, setOrgName] = useState('');
  const [location, setLocation] = useState('Mangaluru Harbour');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const roleOptions = [
    {
      key: 'FISHER',
      label: t('roles.fisher', 'Fisher'),
      desc: lang === 'kn' ? 'ಬಂದರು ಮೀನು ಇಳಿಸುವಿಕೆ ಮತ್ತು ಕ್ಯಾಚ್ ಲಾಗ್' : 'Harbour landings & catch logging',
      icon: Anchor,
      defaultOrg: 'Sea Queen Trawlers',
    },
    {
      key: 'TRADER',
      label: t('roles.trader', 'Trader'),
      desc: lang === 'kn' ? 'ಹರಾಜು ಖರೀದಿ ಮತ್ತು ಹಸ್ತಾಂತರ' : 'Auction procurement & handover',
      icon: ShoppingBag,
      defaultOrg: 'Coastal Auctions & Trading',
    },
    {
      key: 'PROCESSOR',
      label: t('roles.processor', 'Processor'),
      desc: lang === 'kn' ? 'ತೂಕ ಪರಿಶೀಲನೆ, ಸಂಸ್ಕರಣೆ ಮತ್ತು ಫಿಲ್ಲೆಟಿಂಗ್' : 'Intake weight, filleting & yield',
      icon: Cpu,
      defaultOrg: 'Coastal Seafoods Facility',
    },
    {
      key: 'TRANSPORTER',
      label: t('roles.transporter', 'Transporter'),
      desc: lang === 'kn' ? 'ಕೋಲ್ಡ್ ಚೈನ್ ವಾಹನ ಮತ್ತು ತಾಪಮಾನ ಲಾಗ್' : 'Reefer transit & temperature log',
      icon: Truck,
      defaultOrg: 'Express Cold Logistics',
    },
    {
      key: 'SELLER',
      label: t('roles.seller', 'Seller'),
      desc: lang === 'kn' ? 'ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ ಮಾರಾಟ' : 'Wholesale & retail counter sales',
      icon: Store,
      defaultOrg: 'Ocean Fresh Seafood Market',
    },
    {
      key: 'ADMIN',
      label: t('roles.admin', 'Admin'),
      desc: lang === 'kn' ? 'ನಿಯಂತ್ರಕ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಲೆಕ್ಕಪರಿಶೋಧನೆ' : 'Regulatory oversight & audit',
      icon: Shield,
      defaultOrg: 'Karnataka Fisheries Dept',
    },
  ];

  const currentRole = roleOptions.find((r) => r.key === selectedRole) || roleOptions[0];
  const CurrentIcon = currentRole.icon;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setRoleDropdownOpen(false);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!pin || pin.length < 4) {
      setErrorMsg('Please choose a 4-digit security PIN.');
      return;
    }

    if (pin !== confirmPin) {
      setErrorMsg('PINs do not match. Please re-enter your PIN.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser({
        name: fullName.trim(),
        role: selectedRole,
        org: orgName.trim() || `${fullName.trim()}'s Facility`,
        location: location.trim(),
        email: email.trim(),
        pin: pin.trim(),
      });

      toast.success(`Account registered! Welcome to CatchTrace, ${user.name}!`);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-slate-900 font-sans selection:bg-ocean-100 selection:text-ocean-800 relative">
      
      {/* Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/30 bg-white/80 hover:bg-white text-navy-900 backdrop-blur-md transition-all shadow-sm"
          title="Change Language / ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ"
        >
          <Globe className="w-3.5 h-3.5 text-ocean-600" />
          <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
        </button>
      </div>

      {/* Main Centered Form Area */}
      <div className="w-full max-w-[420px] my-auto">
        {/* Crisp, restrained form container */}
        <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-5 sm:p-8 shadow-2xl">
          
          {/* Centered CatchTrace Brand Emblem */}
          <div className="flex justify-center mb-5">
            <img
              src="/images/catchtrace-logo.png"
              alt="CatchTrace logo"
              className="h-14 w-auto object-contain"
              style={{ aspectRatio: '1024/682' }}
              width={84}
              height={56}
              loading="eager"
            />
          </div>

            {/* Title & Subtitle */}
            <div className="mb-6 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t('auth.registerTitle', 'Create your account')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t('auth.registerSubtitle', 'Join CatchTrace to manage and track your seafood supply chain.')}
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth.fullName', 'Full name')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Naik"
                    className="h-10 w-full pl-9 pr-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Role Selection Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth.role', 'Role in supply chain')} <span className="text-rose-500">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`w-full h-10 px-3 rounded-lg border text-left flex items-center justify-between transition-colors bg-white ${
                    roleDropdownOpen
                      ? 'border-ocean-600 ring-2 ring-ocean-500/20'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={roleDropdownOpen}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
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
                      roleDropdownOpen ? 'rotate-180 text-ocean-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {roleDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 max-h-56 overflow-y-auto">
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
                              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-ocean-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-3 h-3" />
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

              {/* Organization or Vessel Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth.orgName', 'Organization or vessel name')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={currentRole.defaultOrg || 'e.g. Coastal Seafoods'}
                    className="h-10 w-full pl-9 pr-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 transition-colors"
                  />
                </div>
              </div>

              {/* Operational Base / Harbour */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth.operationalBase', 'Operational base or harbour')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-10 w-full pl-9 pr-8 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="Mangaluru Harbour">{t('harbours.mangaluru', 'Mangaluru Harbour (ಬಂದರು)')}</option>
                    <option value="Malpe Harbour">{t('harbours.malpe', 'Malpe Harbour (ಮಲ್ಪೆ)')}</option>
                    <option value="Karwar Harbour">{t('harbours.karwar', 'Karwar Harbour (ಕಾರವಾರ)')}</option>
                    <option value="Baikampady Industrial Estate">{t('harbours.baikampady', 'Baikampady Industrial Area')}</option>
                    <option value="Bengaluru Wholesale Market">{t('harbours.bengaluru', 'Bengaluru Wholesale Market')}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
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

              {/* 4-Digit Security PIN & Confirm PIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('auth.pin', 'Security PIN')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="h-10 w-full px-3 text-center text-sm font-mono tracking-widest rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      {t('auth.confirmPin', 'Confirm PIN')} <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="h-10 w-full px-3 text-center text-sm font-mono tracking-widest rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-lg bg-ocean-600 hover:bg-ocean-700 active:bg-ocean-800 text-white text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('auth.creatingAccount', 'Creating Account...')}</span>
                    </div>
                  ) : (
                    <span>{t('auth.createAccount', 'Create Account')}</span>
                  )}
                </button>
              </div>

            </form>

            {/* Bottom Login Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                {t('auth.alreadyRegistered', 'Already registered?')}{' '}
                <NavLink
                  to="/login"
                  className="font-medium text-ocean-600 hover:text-ocean-700 transition-colors"
                >
                  {t('auth.signInLink', 'Sign in with your PIN')}
                </NavLink>
              </p>
            </div>

          </div>

      </div>

    </div>
  );
}
