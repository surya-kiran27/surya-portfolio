/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          black: '#000000',
          green: '#00FF00',
          bright: {
            green: '#00bf00',
            cyan: '#00d8d8',
            blue: '#0066ff',
            red: '#ff0000',
            yellow: '#ffff00',
            magenta: '#ff00ff',
            white: '#f0f0f0',
          },
          gray: '#808080',
          darkGray: '#1E1E1E',
          background: '#1E1E1E',
          text: '#f0f0f0',
          prompt: '#00bf00',
          selection: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'Lucida Console', 'monospace']
      },
      boxShadow: {
        'terminal': '0 0 10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
} 