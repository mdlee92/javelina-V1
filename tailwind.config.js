/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: {
            500: '#FF8524',
            600: '#E66D10',
          },
          blue: {
            100: '#E5ECF2',
            500: '#6583A8',
            600: '#4F6A8E',
          },
          navy: {
            700: '#203F57',
            800: '#182E40',
          },
        },
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E4E7EB',
          400: '#B1B8C0',
          700: '#4D5661',
          900: '#1C2026',
        },
        semantic: {
          success: {
            500: '#10B981',
          },
          error: {
            500: '#EF4444',
          },
        },
      },
      fontSize: {
        'heading': ['2.5rem', { lineHeight: '1.25', fontWeight: '700' }],
        'subheading': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        'label': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        'lg': '0.375rem',  // 6px (was 8px, -25%)
        'xl': '0.5rem',    // 8px (was 12px, -33%)
        '2xl': '0.75rem',  // 12px (was 16px, -25%)
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'sm': '4px',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'swift': 'cubic-bezier(0.4, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}
