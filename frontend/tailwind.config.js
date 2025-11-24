/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing App Colors
        primary: '#2563eb',
        secondary: '#475569',
        
        // New Landing Page Colors
        navy: '#1a2332',
        teal: '#4a9b8e',
        coral: '#ff6b6b',
        sage: '#a8c090',
        charcoal: '#2d3748'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        // New Fonts
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
}