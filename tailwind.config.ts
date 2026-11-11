import type { Config } from 'tailwindcss';
import { colors, radius } from './src/design/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      borderRadius: {
        card: `${radius.card}px`,
        button: `${radius.button}px`,
        chip: `${radius.chip}px`,
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(48, 56, 64, 0.04)',
        phone: '0 14px 35px rgba(40, 67, 86, 0.20), 0 0 0 2px rgba(40, 57, 70, 0.10)',
      },
      screens: {
        frame: '520px',
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
