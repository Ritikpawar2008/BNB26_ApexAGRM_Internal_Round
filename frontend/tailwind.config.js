/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        creator: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: '#334155',
          primary: '#6366F1',
          primaryHover: '#4F46E5',
          accent: '#10B981',
        }
      }
    },
  },
  plugins: [],
}
