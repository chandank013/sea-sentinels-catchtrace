import React from 'react';

/**
 * UserAvatar Component
 * Displays a clean, circular initials-based avatar using the first letter of the user's name
 * (no external/stock photo images).
 */
export default function UserAvatar({ user, size = 'sm', className = '' }) {
  const name = (user?.name || user?.role || 'User').trim();
  const initial = (name.charAt(0) || 'U').toUpperCase();

  // Role-based gradient accents to give subtle visual identity while maintaining CatchTrace's ocean theme
  const getRoleGradient = (role) => {
    switch ((role || '').toUpperCase()) {
      case 'FISHER':
        return 'from-blue-600 to-ocean-700 text-white';
      case 'TRADER':
        return 'from-amber-600 to-amber-700 text-white';
      case 'PROCESSOR':
        return 'from-indigo-600 to-indigo-800 text-white';
      case 'TRANSPORTER':
        return 'from-cyan-600 to-blue-700 text-white';
      case 'SELLER':
        return 'from-emerald-600 to-teal-800 text-white';
      case 'ADMIN':
        return 'from-purple-600 to-navy-900 text-white';
      default:
        return 'from-ocean-600 to-ocean-800 text-white';
    }
  };

  const gradient = getRoleGradient(user?.role);

  // Sizing variants
  const sizeClasses = {
    sm: 'w-9 h-9 text-sm font-bold border border-ocean-200 ring-2 ring-ocean-50/50 shadow-sm',
    md: 'w-12 h-12 text-lg font-bold border-2 border-ocean-200 ring-2 ring-ocean-50 shadow-sm',
    lg: 'w-24 h-24 text-3xl sm:text-4xl font-extrabold border-4 border-ocean-100 shadow-md',
  }[size] || 'w-9 h-9 text-sm font-bold border border-ocean-200 ring-2 ring-ocean-50/50 shadow-sm';

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 select-none uppercase tracking-wide ${sizeClasses} ${className}`}
      title={name}
      aria-label={`Avatar for ${name}`}
    >
      <span>{initial}</span>
    </div>
  );
}
