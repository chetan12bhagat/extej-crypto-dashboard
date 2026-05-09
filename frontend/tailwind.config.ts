import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        bg2: '#141414',
        bg3: '#1a1a1a',
        bg4: '#222222',
        bg5: '#2a2a2a',
        primary: {
          DEFAULT: '#ffffff',
          2: '#e5e5e5',
          3: '#a3a3a3',
          glow: 'rgba(255,255,255,0.1)',
        },
        green: '#4ade80',
        red: '#f43f5e',
        blue: '#60a5fa',
        purple: '#a855f7',
        text: '#ffffff',
        muted: '#71717a',
        muted2: '#a1a1aa',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
  plugins: [],
}

export default config
