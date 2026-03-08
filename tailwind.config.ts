import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        whatever: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          muted: '#64748b',
          surface: '#f8fafc',
        },
      },
    },
  },
  plugins: [],
};

export default config;
