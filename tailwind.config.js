/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#020815',
          900: '#071428',
          800: '#0c2341',
        },
        cyanGlow: '#3be3ff',
        magentaGlow: '#ff4f9a',
      },
      boxShadow: {
        panel: '0 10px 40px rgba(2, 8, 21, 0.5)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
