import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0052CC', // main
          600: '#0047B3',
          700: '#003D99',
          800: '#003380',
          900: '#002966',
        },
        secondary: {
          50: '#FFF4E5',
          100: '#FFE9CC',
          200: '#FFD399',
          300: '#FFBD66',
          400: '#FFA733',
          500: '#FF8B00', // main
          600: '#E67E00',
          700: '#CC7000',
          800: '#B36200',
          900: '#995400',
        },
        custom: {
          50: '#FFFBE5',
          100: '#FFF7CC',
          200: '#FFEF99',
          300: '#FFE766',
          400: '#FFDF33',
          500: '#FFD700', // main
          600: '#E6C200',
          700: '#CCAC00',
          800: '#B39700',
          900: '#998200',
        },
      },
      fontFamily: {
        tajawal: ['var(--font-tajawal)'],
        cairo: ['var(--font-cairo)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config;
