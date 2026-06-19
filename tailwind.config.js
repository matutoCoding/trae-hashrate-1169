/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-card': 'var(--color-bg-card)',
        'bg-hover': 'var(--color-bg-hover)',
        'primary': {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
        },
        'accent': 'var(--color-accent)',
        'warning': 'var(--color-warning)',
        'success': 'var(--color-success)',
        'danger': 'var(--color-danger)',
        'info': 'var(--color-info)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'border': 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
      },
      fontFamily: {
        display: ['Rajdhani', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-primary': 'var(--shadow-glow-primary)',
        'glow-accent': 'var(--shadow-glow-accent)',
        'glow-warning': 'var(--shadow-glow-warning)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.4)',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(249, 115, 22, 0.7)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.4s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)`,
      },
    },
  },
  plugins: [],
};
