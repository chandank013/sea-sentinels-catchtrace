import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import CatchTraceLogo from '../common/CatchTraceLogo';
import UserAvatar from '../common/UserAvatar';
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  QrCode,
  AlertTriangle,
  FileBarChart,
  Bell,
  LogOut,
  User,
  Settings,
  Globe,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, notifications, unreadCount, markAllNotificationsRead, markNotificationRead } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = (user?.role || 'ADMIN').toUpperCase();
  const isAdmin = role === 'ADMIN';

  // Role-aware navigation links: Alerts is strictly reserved for ADMIN role
  const getNavLinks = () => {
    const commonDashboard = {
      to: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
    };
    const commonScan = {
      to: '/scan',
      label: t('nav.scanQr'),
      icon: QrCode,
    };

    if (role === 'FISHER') {
      return [
        commonDashboard,
        { to: '/batches', label: t('nav.myBatches'), icon: Boxes },
        { to: '/batches/new', label: t('nav.createBatch'), icon: PlusCircle },
        commonScan,
      ];
    }

    if (role === 'TRADER') {
      return [
        commonDashboard,
        { to: '/batches', label: t('nav.availableBatches'), icon: Boxes },
        { to: '/add-event', label: t('nav.recordPurchase'), icon: PlusCircle },
        commonScan,
      ];
    }

    if (role === 'PROCESSOR') {
      return [
        commonDashboard,
        { to: '/batches', label: t('nav.myBatches'), icon: Boxes },
        { to: '/add-event', label: t('nav.recordProcessing'), icon: PlusCircle },
        commonScan,
      ];
    }

    if (role === 'TRANSPORTER') {
      return [
        commonDashboard,
        { to: '/batches', label: t('nav.assignedBatches'), icon: Boxes },
        { to: '/add-event', label: t('nav.recordTransport'), icon: PlusCircle },
        commonScan,
      ];
    }

    if (role === 'SELLER') {
      return [
        commonDashboard,
        { to: '/batches', label: t('nav.availableBatches'), icon: Boxes },
        { to: '/add-event', label: t('nav.recordSale'), icon: PlusCircle },
        commonScan,
      ];
    }

    // Default / ADMIN (Includes statewide Alerts & Reports)
    return [
      commonDashboard,
      { to: '/batches', label: t('nav.allBatches'), icon: Boxes },
      { to: '/add-event', label: t('nav.addEvent'), icon: PlusCircle },
      { to: '/alerts', label: t('nav.alerts'), icon: AlertTriangle, badge: unreadCount > 0 ? unreadCount : undefined },
      { to: '/reports', label: t('nav.reports'), icon: FileBarChart },
      commonScan,
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-borderLight h-[72px] shadow-sm select-none print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Left Section: Logo, Brand name, Tagline */}
        <div className="flex items-center">
          <NavLink to="/dashboard" className="flex items-center">
            <CatchTraceLogo size="md" showTagline={true} />
          </NavLink>
        </div>

        {/* Center Section: Horizontal Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 relative ${
                  isActive
                    ? 'text-ocean-600 bg-ocean-50/80 shadow-xs'
                    : 'text-textSecondary hover:text-navy-900 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Language Toggle, Notifications, User Avatar, Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
          
          {/* English / Kannada Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-borderLight text-navy-900 hover:bg-slate-50 transition-colors shrink-0"
            title="Switch Language (English / ಕನ್ನಡ)"
          >
            <Globe className="w-3.5 h-3.5 text-ocean-600" />
            <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Notification Bell - Strictly displayed for ADMIN oversight */}
          {isAdmin && (
            <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg text-textSecondary hover:text-navy-900 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-statusDanger text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-ct shadow-hover border border-borderLight py-3 z-50 animate-fade-in">
                <div className="px-4 pb-2 border-b border-borderLight flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-navy-900">{t('nav.notifications')}</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-statusDanger bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        {unreadCount} {lang === 'kn' ? 'ಹೊಸ' : 'new'}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs text-ocean-600 hover:text-ocean-700 font-semibold transition-colors"
                    >
                      {lang === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ಓದಿದೆ ಎಂದು ಗುರುತಿಸಿ' : 'Mark all read'}
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-borderLight/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-textSecondary space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <p className="font-semibold text-navy-900">
                        {lang === 'kn' ? 'ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ' : 'All clear!'}
                      </p>
                      <p className="text-[11px]">
                        {lang === 'kn' ? 'ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ವಿವಾದಗಳು ಅಥವಾ ಉಲ್ಲಂಘನೆಗಳಿಲ್ಲ.' : 'No active system alert notifications.'}
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          if (markNotificationRead) markNotificationRead(n.id);
                          setNotifOpen(false);
                          if (n.batchId) navigate(`/batches/${n.batchId}`);
                          else navigate('/alerts');
                        }}
                        className={`w-full text-left p-3 text-xs transition-colors flex items-start gap-2.5 hover:bg-slate-50 ${
                          n.unread ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                            n.severity === 'HIGH' ? 'bg-red-500 ring-2 ring-red-100' : 'bg-amber-500'
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                n.severity === 'HIGH'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {n.title}
                            </span>
                            <span className="text-[10px] text-textSecondary font-medium">{n.time}</span>
                          </div>
                          <p className="text-navy-900 font-medium leading-relaxed line-clamp-2">{n.text}</p>
                          {n.batchId && (
                            <span className="text-[10px] text-ocean-600 font-mono font-bold mt-1 inline-block hover:underline">
                              {n.batchId} →
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-borderLight/60 bg-slate-50/80 text-center">
                  <NavLink
                    to="/alerts"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-bold text-ocean-600 hover:text-ocean-700 flex items-center justify-center gap-1"
                  >
                    <span>{lang === 'kn' ? 'ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'View all alerts'}</span>
                    <span>→</span>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
          )}

          {/* User Profile Button & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors"
              aria-expanded={profileOpen}
            >
              <UserAvatar user={user} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-navy-900 leading-none">{user?.name || 'User'}</p>
                <span className="text-[11px] font-semibold text-ocean-600 uppercase tracking-wider block mt-0.5">
                  {t(`roles.${(user?.role || 'admin').toLowerCase()}`, user?.roleLabel || user?.role || 'Guest')}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-textSecondary hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-ct shadow-hover border border-borderLight py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-borderLight mb-1 md:hidden">
                  <p className="text-xs font-bold text-navy-900">{user?.name}</p>
                  <p className="text-[11px] text-textSecondary">{user?.org}</p>
                </div>

                <NavLink
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-textPrimary hover:bg-ocean-50 hover:text-ocean-600 transition-colors"
                >
                  <User className="w-4 h-4 text-textSecondary" />
                  <span>{t('nav.myProfile')}</span>
                </NavLink>

                <NavLink
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-textPrimary hover:bg-ocean-50 hover:text-ocean-600 transition-colors"
                >
                  <Settings className="w-4 h-4 text-textSecondary" />
                  <span>{t('nav.accountSettings')}</span>
                </NavLink>

                <div className="border-t border-borderLight my-1.5"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-statusDanger hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-navy-900 hover:bg-slate-100"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation (Temporary Overlay Menu - STRICTLY NOT A PERMANENT SIDEBAR) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-borderLight px-4 pt-2 pb-6 space-y-2 shadow-lg animate-fade-in">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-ocean-600 bg-ocean-50'
                    : 'text-textSecondary hover:text-navy-900 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <div className="pt-3 border-t border-borderLight flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-textSecondary">Signed in as:</span>
              <span className="text-xs font-bold text-navy-900">{t(`roles.${(user?.role || 'admin').toLowerCase()}`, user?.roleLabel || user?.role)}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-statusDanger hover:underline"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
