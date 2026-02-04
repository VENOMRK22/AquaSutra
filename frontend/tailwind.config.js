/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // iOS System Colors (Light Mode)
        ios: {
          bg: '#F2F2F7', // System Grouped Background
          card: '#FFFFFF', // Secondary System Grouped Background (Cards)
          text: '#000000', // Label
          subtext: '#8E8E93', // Secondary Label
          separator: '#C6C6C8', // Separator
          blue: '#007AFF',
          teal: '#30B0C7',
          green: '#34C759',
          red: '#FF3B30',
          yellow: '#FFCC00',
          orange: '#FF9500',
          indigo: '#5856D6',
          purple: '#AF52DE',
          gray: '#8E8E93',
        },
        // Brand Colors maintained but adapted
        aqua: {
          500: '#30B0C7', // Use iOS Teal as main brand or similar
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        display: [
          'Inter',
          '-apple-system',
          '"SF Pro Display"',
          'sans-serif'
        ]
      },
      boxShadow: {
        'ios': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'ios-lg': '0 8px 16px rgba(0, 0, 0, 0.04), 0 4px 6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)', // iOS spring-like bezier
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
