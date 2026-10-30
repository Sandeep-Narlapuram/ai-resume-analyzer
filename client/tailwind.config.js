/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0A0E1A',
          soft: '#0F1524',
          deep: '#060812',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0F1524',
        },
        violet: {
          50: '#F3F1FF',
          100: '#E9E5FF',
          300: '#B7A9FF',
          400: '#9C87FF',
          500: '#7C5CFF',
          600: '#6941F0',
          700: '#5731CC',
        },
        aqua: {
          400: '#5EEAF9',
          500: '#22D3EE',
          600: '#0EA5C4',
        },
        amber: {
          400: '#FCD34D',
          500: '#FBBF24',
        },
        rose: {
          400: '#FDA4AF',
          500: '#FB7185',
          600: '#E11D48',
        },
        ink_text: {
          primary: '#F5F6FA',
          muted: '#94A3B8',
          faint: '#5B6478',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.28)',
        glow: '0 0 40px -10px rgba(124, 92, 255, 0.55)',
        'glow-aqua': '0 0 40px -10px rgba(34, 211, 238, 0.5)',
      },
      backgroundImage: {
        'grid-glow': 'radial-gradient(circle at 20% 20%, rgba(124,92,255,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(34,211,238,0.14), transparent 35%)',
        'scan-gradient': 'conic-gradient(from 0deg, transparent 0%, rgba(124,92,255,0.9) 8%, transparent 16%)',
      },
      keyframes: {
        'scan-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'scan-rotate': 'scan-rotate 6s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'scale-in': 'scale-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}
