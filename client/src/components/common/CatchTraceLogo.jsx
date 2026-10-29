import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Reusable CatchTrace Brand Logo Component
 * Uses the official blue fish-and-wave emblem on a transparent background.
 *
 * @param {string} size - 'public' | 'lg' | 'md' | 'sm' | 'xl'
 * @param {boolean} showTagline - whether to show "From Ocean to Your Plate"
 * @param {boolean} light - white text theme for dark backgrounds
 * @param {string} className - extra wrapper classes
 * @param {boolean} iconOnly - only render the emblem image
 */
export default function CatchTraceLogo({
  size = 'md',
  showTagline = true,
  light = false,
  className = '',
  iconOnly = false,
}) {
  const { t } = useLanguage();

  // Strict sizing per specification:
  // - Public navbar: approximately 40–48px icon height
  // - Authenticated navbar: approximately 32–40px icon height
  // - Footer & small headers: scaled cleanly (~30-32px)
  // - Auth form / large headers: ~52-56px
  let iconHeightClass = 'h-9'; // 36px default for authenticated navbar
  let titleSizes = 'text-lg sm:text-xl';
  let tagSizes = 'text-[10px] sm:text-xs';
  let defaultWidth = 54;
  let defaultHeight = 36;

  if (size === 'public' || size === 'lg') {
    iconHeightClass = 'h-11 sm:h-12'; // 44px - 48px
    titleSizes = 'text-xl sm:text-2xl';
    tagSizes = 'text-[10px] sm:text-xs';
    defaultWidth = 66;
    defaultHeight = 44;
  } else if (size === 'md' || size === 'auth') {
    iconHeightClass = 'h-9 sm:h-10'; // 36px - 40px
    titleSizes = 'text-lg sm:text-xl';
    tagSizes = 'text-[10px] sm:text-xs';
    defaultWidth = 54;
    defaultHeight = 36;
  } else if (size === 'sm') {
    iconHeightClass = 'h-8'; // 32px
    titleSizes = 'text-base sm:text-lg';
    tagSizes = 'text-[9px] sm:text-[10px]';
    defaultWidth = 48;
    defaultHeight = 32;
  } else if (size === 'xl') {
    iconHeightClass = 'h-14'; // 56px
    titleSizes = 'text-2xl sm:text-3xl';
    tagSizes = 'text-xs';
    defaultWidth = 84;
    defaultHeight = 56;
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official Blue Fish & Ocean Wave Emblem (Preserves pure transparent background, no box/border) */}
      <img
        src="/images/catchtrace-logo.png"
        alt="CatchTrace logo"
        className={`${iconHeightClass} w-auto object-contain shrink-0`}
        style={{ aspectRatio: '1024/682' }}
        width={defaultWidth}
        height={defaultHeight}
        loading="eager"
      />

      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center">
            <span
              className={`font-black tracking-tight ${titleSizes} ${
                light ? 'text-white' : 'text-navy-900'
              }`}
            >
              Catch<span className="text-ocean-600">Trace</span>
            </span>
          </div>

          {showTagline && (
            <p
              className={`font-semibold tracking-wide uppercase mt-1 leading-tight hidden sm:block ${tagSizes} ${
                light ? 'text-ocean-100' : 'text-textSecondary'
              }`}
            >
              {t('brand.tagline', 'From Ocean to Your Plate')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
