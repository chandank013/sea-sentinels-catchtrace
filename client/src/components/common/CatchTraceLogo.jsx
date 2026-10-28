import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CatchTraceLogo({ size = 'md', showTagline = true, light = false }) {
  const { t } = useLanguage();
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSizes = isSm ? 'w-8 h-8' : isLg ? 'w-12 h-12' : 'w-10 h-10';
  const titleSizes = isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl';
  const tagSizes = isSm ? 'text-[10px]' : 'text-xs';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Dynamic CatchTrace Fish & Wave Emblem */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-ocean-600 to-ocean-400 text-white shadow-sm p-2 ${iconSizes}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Wave ripple */}
          <path
            d="M6 25C11 25 13 22 17 22C21 22 23 25 28 25C33 25 35 22 38 22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Fish silhouette */}
          <path
            d="M32 15C29 11 20 10 13 13C9 14.7 6 18 6 18C6 18 9 21.3 13 23C20 26 29 25 32 21L37 25V11L32 15Z"
            fill="currentColor"
          />
          {/* Fish Eye */}
          <circle cx="12" cy="18" r="1.5" fill="#0B2545" />
          {/* Fin line */}
          <path
            d="M20 15C21 17 23 18 24 17"
            stroke="#0B2545"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <div className="flex items-center">
          <span className={`font-black tracking-tight ${titleSizes} ${light ? 'text-white' : 'text-navy-900'}`}>
            Catch<span className="text-ocean-600">Trace</span>
          </span>
        </div>
        {showTagline && (
          <p className={`font-medium tracking-wide uppercase ${tagSizes} ${light ? 'text-ocean-100' : 'text-textSecondary'}`}>
            {t('brand.tagline')}
          </p>
        )}
      </div>
    </div>
  );
}
