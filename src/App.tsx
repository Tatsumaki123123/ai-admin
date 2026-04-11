import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';

import { HelmetProvider } from 'react-helmet-async';
import { StylesContext } from './context';
import routes from './routes/routes.tsx';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { PRIMARY_COLOR } from './theme/colors';
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
            borderRadius: 6,
            borderRadiusSM: 4,
            borderRadiusLG: 8,
            borderRadiusXS: 2,
            // ── 字体 ──────────────────────────────────────────────
            fontFamily:
              "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 14,
            // ── 间距 ──────────────────────────────────────────────
            lineHeight: 1.6,
            // ── 颜色 ──────────────────────────────────────────────
            colorBorder: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
            colorBorderSecondary: isDark ? 'rgba(255,255,255,0.07)' : '#f0f0f0',
            colorBgContainer: isDark ? '#141414' : '#ffffff',
            colorBgElevated: isDark ? '#1e1e1e' : '#ffffff',
          },
          components: {
            // ── Button ────────────────────────────────────────────
            Button: {
              fontWeight: 500,
              primaryShadow: 'none',
              defaultShadow: 'none',
              dangerShadow: 'none',
              controlHeight: 34,
              controlHeightLG: 40,
              controlHeightSM: 28,
              paddingContentHorizontal: 16,
            },
            // ── Input ─────────────────────────────────────────────
            Input: {
              controlHeight: 34,
              controlHeightLG: 40,
              controlHeightSM: 28,
              paddingBlock: 5,
              activeShadow: `0 0 0 2px ${PRIMARY_COLOR}33`,
            },
            Select: {
              controlHeight: 34,
              controlHeightLG: 40,
              controlHeightSM: 28,
            },
            // ── Card ──────────────────────────────────────────────
            Card: {
              paddingLG: 20,
              colorBorderSecondary: isDark
                ? 'rgba(255,255,255,0.08)'
                : '#e5e7eb',
            },
            // ── Tag ───────────────────────────────────────────────
            Tag: {
              defaultBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              borderRadiusSM: 20,
              lineHeight: 1.8,
            },
            // ── Table ─────────────────────────────────────────────
            Table: {
              colorBgContainer: isDark ? '#141414' : '#ffffff',
              headerBg: isDark ? '#141414' : '#ffffff',
              rowHoverBg: isDark ? '#1f1f1f' : '#fafafa',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0',
              headerSplitColor: 'transparent',
              cellPaddingBlock: 12,
              cellPaddingInline: 16,
            },
            // ── Dropdown ──────────────────────────────────────────
            Dropdown: {
              borderRadiusLG: 8,
              paddingBlock: 5,
            },
            // ── Modal  ────────────────────────────────────────────
            Modal: {
              borderRadiusLG: 10,
            },
            // ── Popover ───────────────────────────────────────────
            Popover: {
              borderRadiusLG: 8,
            },
            // ── Divider ───────────────────────────────────────────
            Divider: {
              colorSplit: isDark ? 'rgba(255,255,255,0.07)' : '#f0f0f0',
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
