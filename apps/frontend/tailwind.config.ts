import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        background: 'hsl(0 0% 3%)',
        foreground: 'hsl(0 0% 98%)',
        card: 'hsl(0 0% 7%)',
        'card-foreground': 'hsl(0 0% 98%)',
        primary: 'hsl(142 70% 45%)',
        'primary-foreground': 'hsl(0 0% 98%)',
        secondary: 'hsl(0 0% 14%)',
        'secondary-foreground': 'hsl(0 0% 98%)',
        muted: 'hsl(0 0% 14%)',
        'muted-foreground': 'hsl(0 0% 63%)',
        accent: 'hsl(142 70% 45%)',
        'accent-foreground': 'hsl(0 0% 98%)',
        destructive: 'hsl(0 62% 50%)',
        'destructive-foreground': 'hsl(0 0% 98%)',
        border: 'hsl(0 0% 14%)',
        input: 'hsl(0 0% 14%)',
        ring: 'hsl(142 70% 45%)',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
