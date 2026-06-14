/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hms: {
          dark: '#0a1628',
          card: '#111f38',
          primary: '#0891b2',    // Medical Teal/Cyan
          secondary: '#059669',  // Surgical Green
          accent: '#0284c7',     // Clinical Blue
          danger: '#dc2626',     // Emergency Red
          warning: '#d97706',    // Alert Amber
          text: '#f1f5f9',
          muted: '#8ba3c4',
          surface: '#152240',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '0.15' }, '50%': { opacity: '0.25' } },
      }
    },
  },
  plugins: [],
}
