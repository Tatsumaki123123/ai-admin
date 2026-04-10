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

  return (
    <HelmetProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: PRIMARY_COLOR,
            borderRadius: 6,
            fontFamily: 'Lato, sans-serif',
          },
          components: {
            Calendar: {
              colorBgContainer: 'none',
            },
            Carousel: {
              dotWidth: 8,
            },
            Table: {
              colorBgContainer: 'transparent',
              headerBg: 'transparent',
              rowHoverBg:
                mytheme === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.04)',
            },
            Timeline: {
              dotBg: 'none',
            },
            Typography: {
              linkHoverDecoration: 'underline',
            },
          },
          algorithm:
            mytheme === 'dark'
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
