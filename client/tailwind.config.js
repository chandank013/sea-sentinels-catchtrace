/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B2545',
          800: '#123B63',
          700: '#1A4A7A',
        },
        ocean: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0879D9',
          700: '#0284C7',
          800: '#0369A1',
        },
        tealbrand: {
          500: '#0D9488',
          600: '#0F766E',
        },
        page: '#F3F7FB',
        card: '#FFFFFF',
        textPrimary: '#102A43',
        textSecondary: '#62748A',
        borderLight: '#DCE6F0',
        statusSuccess: '#16A34A',
        statusWarning: '#F59E0B',
        statusDanger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(16, 42, 67, 0.05), 0 1px 2px -1px rgba(16, 42, 67, 0.05)',
        card: '0 4px 6px -1px rgba(11, 37, 69, 0.06), 0 2px 4px -2px rgba(11, 37, 69, 0.04)',
        hover: '0 10px 15px -3px rgba(11, 37, 69, 0.08), 0 4px 6px -4px rgba(11, 37, 69, 0.04)',
      },
      borderRadius: {
        'ct': '14px',
      }
    },
  },
  plugins: [],
}
