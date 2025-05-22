import { createTheme } from '@mui/material/styles';
import { tajawal } from './fonts';
import { arEG } from '@mui/material/locale';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
    };
  }
}

export const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: tajawal.style.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
  },
  palette: {
    primary: {
      main: '#0052CC', // أزرق
      light: '#4C9AFF',
      dark: '#0747A6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF8B00', // برتقالي
      light: '#FFB84D',
      dark: '#CC6F00',
      contrastText: '#FFFFFF',
    },
    custom: {
      main: '#FFD700', // ذهبي
      light: '#FFE44D',
      dark: '#CCAC00',
      contrastText: '#000000',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
    },
    info: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#047857',
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});
