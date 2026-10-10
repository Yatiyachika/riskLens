/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#071229', 900: '#0B1B3A', 800: '#102650', 700: '#1B3566', 600: '#2A4A85' },
        canvas: '#F7F9FC',
        brand: { 50: '#EFF5FF', 100: '#DBE7FE', 200: '#BCD2FD', 500: '#2F6BEB', 600: '#1D5BD8', 700: '#1749B0' },
      },
      fontFamily: { sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(15,35,75,0.05), 0 1px 3px rgba(15,35,75,0.04)' },
    },
  },
  plugins: [],
};
