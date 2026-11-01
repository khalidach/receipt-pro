/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        tajawal: ['Tajawal', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        receipt: {
          blue: '#1d4ed8',
          border: '#334155',
          lightBg: '#f8fafc',
          textDark: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}
