import React from 'react';
import { NavLink } from 'react-router-dom';
import CatchTraceLogo from '../common/CatchTraceLogo';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-borderLight text-textSecondary text-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <CatchTraceLogo size="sm" showTagline={true} />
            <p className="text-textSecondary text-xs leading-relaxed max-w-sm mt-2">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-navy-900 mb-3 text-sm">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <NavLink to="/" className="hover:text-ocean-600 transition-colors">{t('footer.homeLanding')}</NavLink>
              </li>
              <li>
                <NavLink to="/scan" className="hover:text-ocean-600 transition-colors">{t('footer.scanQrCode')}</NavLink>
              </li>
              <li>
                <NavLink to="/trace/FB-20261028-0001" className="hover:text-ocean-600 transition-colors">{t('footer.sampleTrace')}</NavLink>
              </li>
              <li>
                <NavLink to="/login" className="hover:text-ocean-600 transition-colors">{t('footer.loginPortal')}</NavLink>
              </li>
            </ul>
          </div>

          {/* Compliance & Info */}
          <div>
            <h4 className="font-bold text-navy-900 mb-3 text-sm">{t('footer.traceabilitySafety')}</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-textSecondary">{t('footer.compliant')}</span>
              </li>
              <li>
                <span className="text-textSecondary">{t('footer.tamperEvident')}</span>
              </li>
              <li>
                <span className="text-textSecondary">{t('footer.regionalHarbours')}</span>
              </li>
              <li>
                <span className="text-textSecondary">{t('footer.tempMonitoring')}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-borderLight/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-textSecondary text-[11px]">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="hover:underline cursor-pointer">{t('footer.privacyPolicy')}</span>
            <span className="hover:underline cursor-pointer">{t('footer.termsOfService')}</span>
            <span className="hover:underline cursor-pointer">{t('footer.support')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
