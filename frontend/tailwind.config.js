export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A2A4F',      // Navy Blue
        accent: '#5ED1D1',       // Teal Blue
        background: '#F5F7FA',   // White Smoke
        charcoal: '#2B2B2B',     // Charcoal
        slate: '#6B7280',        // Slate Gray
        success: '#10B981',      // Emerald
        warning: '#F59E0B',      // Amber
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('flowbite/plugin')],
}