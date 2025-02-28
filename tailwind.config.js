/** @type {import('tailwindcss').Config} */
const themeConfig = require('./theme.json')

module.exports = {
  content: ['./src/renderer/**/*.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: themeConfig
    }
  },
  plugins: [],
  safelist:[
    'bg-gray-200',
    {
      pattern: /text-\w+-(sub|main)/
    },
    {
      pattern: /bg-\w+-(sub|main)/
    }
  ]
}

