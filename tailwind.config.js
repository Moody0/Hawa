/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8A6305',
          hover: '#735204',
          light: '#FAF4E8',
          dark: '#E5B54A',
        },
        gold: {
          DEFAULT: '#8A6305',
          hover: '#735204',
          light: '#FAF4E8',
          dark: '#E5B54A',
        },
        heading: '#0B192C',
        body: '#0F172A',
        muted: '#475569',
        background: {
          light: '#ffffff',
          dark: '#0B192C',
        },
        surface: {
          light: '#ffffff',
          dark: '#132035',
        },
        text: {
          main: {
            light: '#0B192C',
            dark: '#F8FAFC',
          },
          body: {
            light: '#0F172A',
            dark: '#E2E8F0',
          },
          muted: {
            light: '#475569',
            dark: '#94A3B8',
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: 'class',
}