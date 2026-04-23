import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090d',
        bg2: '#111116',
        bg3: '#17171e',
        bg4: '#1e1e28',
        bg5: '#252533',
        orange: {
          DEFAULT: '#f97316',
          2: '#fb923c',
          3: '#fed7aa',
          glow: 'rgba(249,115,22,0.3)',
        },
        green: '#10d9a0',
        red: '#f43f5e',
        blue: '#60a5fa',
        purple: '#a78bfa',
        text: '#ededf5',
        muted: '#5e5e72',
        muted2: '#8f8fa8',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}

export default config
