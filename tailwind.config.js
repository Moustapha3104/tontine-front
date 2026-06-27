/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#06060A',
          900: '#0B0B12',
          850: '#10101A',
          800: '#151521',
          700: '#1D1D2B',
          600: '#2A2A3D',
          500: '#3A3A52',
          400: '#5D5D7A',
          300: '#8D8DA6',
          200: '#B9B9C9',
          100: '#E7E7F0',
          50: '#F7F7FB',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(0,0,0,.35)',
        card: '0 1px 0 rgba(255,255,255,.06), 0 16px 50px rgba(0,0,0,.40)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(1200px 600px at 30% -10%, rgba(26,122,46,.35), transparent 55%), radial-gradient(1000px 500px at 80% 10%, rgba(16,185,129,.22), transparent 55%), radial-gradient(900px 450px at 45% 85%, rgba(5,150,105,.10), transparent 65%)',
      },
    },
  },
  plugins: [],
};
