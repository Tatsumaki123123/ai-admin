// Theme-aware color palettes
// Generated from primary color #da7658

export const LIGHT_COLORS = {
  50: '#fdf0eb',
  100: '#f8d7cc',
  200: '#f1b8a7',
  300: '#ea9982',
  400: '#e17f64',
  500: '#da7658',
  600: '#c46446',
  700: '#a85136',
  800: '#7f3c28',
  900: '#55281b',
} as const;

export const DARK_COLORS = {
  50: '#55281b',
  100: '#7f3c28',
  200: '#a85136',
  300: '#c46446',
  400: '#da7658',
  500: '#e17f64',
  600: '#ea9982',
  700: '#f1b8a7',
  800: '#f8d7cc',
  900: '#fdf0eb',
} as const;

export type ColorPalette = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export const getThemeColors = (theme: 'light' | 'dark'): ColorPalette => {
  return theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
};

export const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;

  const r = Number.parseInt(fullHex.slice(0, 2), 16);
  const g = Number.parseInt(fullHex.slice(2, 4), 16);
  const b = Number.parseInt(fullHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Primary color (same for both themes as the algorithm adjusts it)
export const PRIMARY_COLOR = '#da7658';
