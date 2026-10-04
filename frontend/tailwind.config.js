/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#08090a',
        carbon: '#0f1011',
        obsidian: '#161718',
        graphite: '#23252a',
        smoke: '#383b3f',
        ash: '#62666d',
        fog: '#8a8f98',
        mist: '#d0d6e0',
        bone: '#e5e5e6',
        paper: '#ffffff',
        'acid-lime': '#e4f222',
        'pulse-green': '#27a644',
        'coral-red': '#eb5757',
        'signal-teal': '#02b8cc',
        'iris-violet': '#6366f1',
        lavender: '#8b5cf6',
        creator: {
          bg: '#08090a',
          surface: '#0f1011',
          border: '#23252a',
          primary: '#e4f222',
          primaryHover: '#d4e212',
          accent: '#27a644',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Berkeley Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '6px',
        badge: '4px',
        pill: '9999px',
      },
      letterSpacing: {
        tightest: '-0.022em',
        tighter: '-0.012em',
        tight: '-0.011em',
      },
      boxShadow: {
        hairline: 'rgb(35, 37, 42) 0px 0px 0px 1px inset',
        'hairline-hover': 'rgb(56, 59, 63) 0px 0px 0px 1px inset',
      }
    },
  },
  plugins: [],
}

