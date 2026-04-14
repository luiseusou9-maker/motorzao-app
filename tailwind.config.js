/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas do projeto
        'motor-orange': '#ff8c00',
        'motor-red': '#FF0000',
      },
      boxShadow: {
        // Sombras que brilham como Neon
        'neon-orange': '0 0 20px rgba(255, 140, 0, 0.3)',
        'neon-red': '0 0 20px rgba(255, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}