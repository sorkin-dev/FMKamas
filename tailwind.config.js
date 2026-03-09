/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0f0f23',
        surface: '#1a1a2e',
        border: '#2a2a4a',
        primary: '#f59e0b',
        secondary: '#8b5cf6',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
};
