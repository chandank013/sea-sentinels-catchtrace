import React from 'react';
import { NavLink } from 'react-router-dom';
import CatchTraceLogo from '../common/CatchTraceLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Globe, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PublicNavbar({ isTracePage = false, isVerified = true }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-borderLight h-[72px] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/" className="flex items-center">
          <CatchTraceLogo size="md" showTagline={true} />
        </NavLink>

        {/* Trace Page Badge or Landing Links */}
        {isTracePage ? (
          <div className="flex items-center gap-2">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {t('nav.verifiedAuthentic')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {t('nav.unverifiedRecord')}
              </span>
            )}
          </div>
        ) : (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-textSecondary">
            <NavLink to="/" className="hover:text-ocean-600 transition-colors">
              {t('nav.home')}
            </NavLink>
            <a href="#about" className="hover:text-ocean-600 transition-colors">
              {t('nav.about')}
            </a>
            <a href="#trace" className="hover:text-ocean-600 transition-colors">
              {t('nav.trace')}
            </a>
            <a href="#process" className="hover:text-ocean-600 transition-colors">
              {t('nav.forHandlers')}
            </a>
          </nav>
        )}

        {/* Right Section: Language Toggle + Login / Dashboard */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-borderLight text-navy-900 hover:bg-slate-50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-ocean-600" />
            <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {isAuthenticated ? (
            <NavLink
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 transition-colors shadow-sm"
            >
              <span>{t('nav.dashboard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/register"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-ocean-700 bg-ocean-50 border border-ocean-200 hover:bg-ocean-100 transition-colors"
              >
                {t('nav.register')}
              </NavLink>
              <NavLink
                to="/login"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 transition-colors shadow-sm"
              >
                {t('nav.login')}
              </NavLink>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
