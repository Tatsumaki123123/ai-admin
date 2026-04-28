import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';

import { HelmetProvider } from 'react-helmet-async';
import { StylesContext } from './context';
import routes from './routes/routes.tsx';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { PRIMARY_COLOR, HORIZON, hexToRgba } from './theme/colors';
import './App.css';

// Legacy COLOR export for backward compatibility
// TODO: Migrate all usages to theme-aware colors from theme/colors.ts
export const COLOR = {
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
  borderColor: '#E7EAF3B2',
};

function App() {
  const { mytheme } = useSelector((state: RootState) => state.theme);

  const isDark = mytheme === 'dark';

  return (
    <HelmetProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: PRIMARY_COLOR,
            // ── 圆角 ──────────────────────────────────────────────
            borderRadius: 10,
            borderRadiusSM: 6,
            borderRadiusLG: 14,
            borderRadiusXS: 4,
            // ── 字体 ──────────────────────────────────────────────
            fontFamily:
              "'DM Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 14,
            lineHeight: 1.6,
            // ── 颜色 ──────────────────────────────────────────────
            colorBorder: isDark ? 'rgba(255,255,255,0.10)' : '#E2E8F0',
            colorBorderSecondary: isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0',
            colorBgContainer: isDark ? '#1e1e1e' : '#ffffff',
            colorBgElevated: isDark ? '#252525' : '#ffffff',
            colorBgLayout: isDark ? '#111318' : '#F8FAFC',
            colorTextBase: isDark ? '#e2e8f0' : '#0f172a',
            colorTextSecondary: isDark ? 'rgba(255,255,255,0.45)' : '#64748b',
          },
          components: {
            // ── Button — 渐变 + 大圆角 ───────────────────────────
            Button: {
              fontWeight: 700,
              primaryShadow: '0 4px 15px rgba(218,118,88,0.40)',
              defaultShadow: 'none',
              dangerShadow: 'none',
              controlHeight: 46,
              controlHeightLG: 52,
              controlHeightSM: 34,
              paddingContentHorizontal: 24,
              borderRadius: 10,
              borderRadiusSM: 6,
              borderRadiusLG: 14,
            },
            // ── Input — 大圆角 ────────────────────────────────────
            Input: {
              controlHeight: 46,
              controlHeightLG: 52,
              controlHeightSM: 34,
              paddingBlock: 10,
              paddingInline: 16,
              activeShadow: `0 0 0 3px rgba(218,118,88,0.18)`,
              borderRadius: 10,
              colorBgContainer: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
              colorBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
              hoverBorderColor: PRIMARY_COLOR,
              activeBorderColor: PRIMARY_COLOR,
            },
            Select: {
              controlHeight: 46,
              controlHeightLG: 52,
              controlHeightSM: 34,
              borderRadius: 10,
              colorBgContainer: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
              colorBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
              optionSelectedBg: isDark ? hexToRgba(PRIMARY_COLOR, 0.15) : hexToRgba(PRIMARY_COLOR, 0.08),
              optionSelectedColor: PRIMARY_COLOR,
              optionActiveBg: isDark ? 'rgba(255,255,255,0.05)' : hexToRgba(PRIMARY_COLOR, 0.05),
            },
            // ── Card ─────────────────────────────────────────────
            Card: {
              paddingLG: 24,
              borderRadiusLG: 14,
              colorBorderSecondary: isDark ? 'rgba(255,255,255,0.08)' : '#EAECF0',
              colorBgContainer: isDark ? '#1e1e1e' : '#ffffff',
            },
            // ── Tag ───────────────────────────────────────────────
            Tag: {
              defaultBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              borderRadiusSM: 20,
              lineHeight: 1.8,
            },
            // ── Table ─────────────────────────────────────────────
            Table: {
              colorBgContainer: isDark ? '#1e1e1e' : '#ffffff',
              headerBg: isDark ? '#252525' : '#f8fafc',
              rowHoverBg: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0',
              headerSplitColor: 'transparent',
              cellPaddingBlock: 14,
              cellPaddingInline: 16,
              borderRadius: 12,
            },
            // ── Dropdown ──────────────────────────────────────────
            Dropdown: {
              borderRadiusLG: 12,
              paddingBlock: 6,
            },
            // ── Modal  ────────────────────────────────────────────
            Modal: {
              borderRadiusLG: 14,
            },
            // ── Popover ───────────────────────────────────────────
            Popover: {
              borderRadiusLG: 12,
            },
            // ── Divider ───────────────────────────────────────────
            Divider: {
              colorSplit: isDark ? 'rgba(255,255,255,0.07)' : '#EAECF0',
            },
            // ── Badge ─────────────────────────────────────────────
            Badge: {
              fontSizeSM: 11,
            },
            // ── Calendar ──────────────────────────────────────────
            Calendar: {
              colorBgContainer: 'none',
            },
            // ── Carousel ──────────────────────────────────────────
            Carousel: {
              dotWidth: 8,
            },
            // ── Timeline ──────────────────────────────────────────
            Timeline: {
              dotBg: 'none',
            },
            // ── Typography ────────────────────────────────────────
            Typography: {
              linkHoverDecoration: 'underline',
              fontWeightStrong: 600,
            },
          },
          algorithm: isDark
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        }}
      >
        <StylesContext.Provider
          value={{
            rowProps: {
              gutter: [
                { xs: 8, sm: 16, md: 24, lg: 32 },
                { xs: 8, sm: 16, md: 24, lg: 32 },
              ],
            },
            carouselProps: {
              autoplay: true,
              dots: true,
              dotPosition: 'bottom',
              infinite: true,
              slidesToShow: 3,
              slidesToScroll: 1,
            },
          }}
        >
          <RouterProvider router={routes} />
        </StylesContext.Provider>
      </ConfigProvider>
    </HelmetProvider>
  );
}

export default App;
