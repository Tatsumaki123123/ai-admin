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

// Primary color — warm orange-brown
export const PRIMARY_COLOR = '#da7658';

// Horizon UI semantic colors — adapted for #da7658 warm palette
export const HORIZON = {
  // brand palette (warm orange-brown)
  brand: {
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
  },
  // page backgrounds
  bgLight: '#FBF7F5',       // 极浅暖米色，呼应橙棕主色
  bgDark: '#1A1210',        // 深暖棕黑
  // navy sidebar / dark surfaces
  navyLight: '#2C1A14',
  navyDark: '#1A1210',
  // card backgrounds
  cardLight: '#ffffff',
  cardDark: '#241812',
  // subtle text
  secondaryText: '#A08070',
  // ── 渐变系列 ──────────────────────────────────────────────
  // 主渐变：亮橙 → 橙棕（按钮、左侧装饰区）
  gradient: 'linear-gradient(135deg, #F0956A 0%, #da7658 60%, #C46446 100%)',
  // 深色模式渐变：稍暗，避免过曝
  gradientDark: 'linear-gradient(135deg, #C46446 0%, #A85136 100%)',
  // 柔和渐变：用于 hover、tag、badge 等次要场景
  gradientSoft: 'linear-gradient(135deg, #FDEEE8 0%, #F8D7CC 100%)',
  // 高光渐变：亮橙 → 金黄，用于特殊强调
  gradientGold: 'linear-gradient(135deg, #F0956A 0%, #E8B86D 100%)',
  // 暗色卡片渐变：深棕 → 更深，用于 dark 模式装饰区
  gradientDeep: 'linear-gradient(135deg, #3D2218 0%, #1A1210 100%)',
} as const;
