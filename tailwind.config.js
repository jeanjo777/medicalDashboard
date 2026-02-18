/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0891B2',
        'primary-light': '#22D3EE',
        'primary-dark': '#0E7490',
        secondary: '#F0FDFA',
        accent: '#22C55E',
        'accent-light': '#4ADE80',
        'text-primary': '#134E4A',
        'text-secondary': '#475569',
        'surface': '#F8FAFC',
        'surface-dark': '#0F172A',
        'card': '#FFFFFF',
        'card-dark': '#1E293B',
        'border-light': '#E2E8F0',
        'border-dark': '#334155',
      },
      fontFamily: {
        'sans': ['Noto Sans', 'sans-serif'],
        'heading': ['Figtree', 'sans-serif'],
      },
      borderRadius: {
        'button': '10px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px rgba(8, 145, 178, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
        'sidebar': '4px 0 15px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
