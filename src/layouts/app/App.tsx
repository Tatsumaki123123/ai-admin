import {
  Dropdown,
  Flex,
  FloatButton,
  Layout,
  MenuProps,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LogoutOutlined,
  QuestionOutlined,
  SettingOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  FileTextOutlined,
  DollarOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { Sidebar, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from './Sidebar.tsx';
import HeaderNav from './HeaderNav.tsx';
import FooterNav from './FooterNav.tsx';
import { NProgress, LoginModal } from '../../components';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/theme/themeSlice.ts';
import { setToken, setUser, clearAuth } from '../../redux/auth/authSlice';
import { RootState } from '../../redux/store.ts';
import { useAuth } from '../../contexts/AuthContext';
import {
  PageContextProvider,
  PageHeaderState,
} from '../../hooks/usePageContext';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/api/apiClient';
import { getActiveColor } from './menuConfig';

const { Content } = Layout;

/** Poll interval for balance refresh: 60 seconds */
const BALANCE_POLL_INTERVAL = 60_000;

type AppLayoutProps = {
  children?: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const {
    token: { borderRadius },
  } = theme.useToken();
  const isMobile = useMediaQuery({ maxWidth: 769 });
  const [collapsed, setCollapsed] = useState(false);
  const [navFill, setNavFill] = useState(false);
  const [pageHeader, setPageHeader] = useState<PageHeaderState>({
    title: null,
    description: null,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const floatBtnRef = useRef(null);
  const dispatch = useDispatch();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { user: authUser, logout: authLogout, updateUser, isAuthenticated: authIsAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('zh') ? 'zh' : 'en';

  // 当前路由对应的菜单颜色，驱动顶部导航联动
  const activeColor = getActiveColor(location.pathname);

  // ── Live balance (polled from /user/self every 60s) ──────────────────────
  const [liveQuota, setLiveQuota] = useState<number | null>(null);

  const refreshBalance = useCallback(async () => {
    try {
      const data: any = await apiClient.get('/user/self');
      if (data && typeof data.quota === 'number') {
        setLiveQuota(data.quota);
        updateUser(data);
      }
    } catch {
      // silently ignore — stale value stays
    }
  }, [updateUser]);

  useEffect(() => {
    if (!authIsAuthenticated) return;
    refreshBalance();
    const timer = setInterval(refreshBalance, BALANCE_POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [authIsAuthenticated, refreshBalance]);

  // Use live quota when available, fall back to authUser.quota
  const rawQuota = liveQuota ?? (authUser as any)?.quota ?? 0;
  const userBalance = `$${(rawQuota / 500000).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const displayName =
    (authUser as any)?.display_name ||
    (authUser as any)?.username ||
    (authUser as any)?.email?.split('@')[0] ||
    user?.email?.split('@')[0] ||
    'User';
  const userInitials = displayName.substring(0, 1).toUpperCase();
  const userRole = (authUser as any)?.role === 100 ? 'Admin' : 'User';
  const setPageContext = useCallback((context: PageHeaderState) => {
    setPageHeader({
      title: context.title ?? null,
      description: context.description ?? null,
    });
  }, []);
  const clearPageContext = useCallback(() => {
    setPageHeader({ title: null, description: null });
  }, []);
  const pageContextValue = useMemo(
    () => ({
      ...pageHeader,
      setPageContext,
      clearPageContext,
    }),
    [clearPageContext, pageHeader, setPageContext]
  );

  const handleLogout = async () => {
    await authLogout();
    dispatch(clearAuth());
    navigate('/auth/signin', { replace: true });
  };

  // ── 胶囊按钮样式辅助 ──────────────────────────────────────────────────────
  const pillBtnStyle = (theme: string): React.CSSProperties => ({
    width: 34,
    height: 34,
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: theme === 'dark' ? 'rgba(255,255,255,0.65)' : '#475569',
    fontSize: 15,
    transition: 'background 0.15s, color 0.15s',
    position: 'relative',
    flexShrink: 0,
    background: 'transparent',
  });

  const pillHover = (e: React.MouseEvent, theme: string, enter: boolean) => {
    const el = e.currentTarget as HTMLDivElement;
    el.style.background = enter
      ? theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'
      : 'transparent';
    el.style.color = enter
      ? theme === 'dark' ? '#fff' : '#0f172a'
      : theme === 'dark' ? 'rgba(255,255,255,0.65)' : '#475569';
  };

  const items: MenuProps['items'] = [
    {
      key: 'user-profile-link',
      label: 'profile',
      icon: <UserOutlined />,
    },
    {
      key: 'user-settings-link',
      label: 'settings',
      icon: <SettingOutlined />,
    },
    {
      key: 'user-help-link',
      label: 'help center',
      icon: <QuestionOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'user-logout-link',
      label: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 5) {
        setNavFill(true);
      } else {
        setNavFill(false);
      }
    });
  }, []);

  // Initialize auth from localStorage on mount / HMR
  useEffect(() => {
    // If Redux auth state is empty but localStorage has auth data, restore it
    if (!isAuthenticated) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Token exists in localStorage, update Redux state
        dispatch(setToken(token));
        // Try to extract user info from token or get from localStorage
        const storedUser = localStorage.getItem('user_email');
        if (storedUser) {
          dispatch(setUser({ email: storedUser }));
        }
      }
    }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      <NProgress isAnimating={false} key={location.key} />
      <Layout
        style={{
          minHeight: '100vh',
          // backgroundColor: 'white',
        }}
      >
        <Sidebar
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        />
        <Layout
          style={
            {
              // background: 'none',
            }
          }
        >
          <HeaderNav
            style={{
              position: 'fixed',
              top: 12,
              left: collapsed
                ? `${SIDEBAR_COLLAPSED_WIDTH + 12}px`
                : `${SIDEBAR_WIDTH + 12}px`,
              right: 12,
              padding: '0 6px 0 18px',
              background: mytheme === 'dark'
                ? 'rgba(26,26,26,0.96)'
                : 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: mytheme === 'dark'
                ? '0 4px 32px rgba(0,0,0,0.7), 0 1px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)'
                : '0 4px 32px rgba(0,0,0,0.14), 0 1px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              height: '58px',
              zIndex: 100,
              transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease',
              borderRadius: '999px',
              border: 'none',
            }}
          >
            <Flex
              align="center"
              style={{ minWidth: 0, flex: 1, overflow: 'hidden', padding: '0 14px', gap: 12 }}
            >
              {/* 彩色竖条 — 联动当前页面颜色 */}
              <div style={{
                width: 4,
                height: 28,
                borderRadius: '999px',
                background: activeColor,
                flexShrink: 0,
                transition: 'background 0.35s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 0 8px ${hexToRgba(activeColor, 0.5)}`,
              }} />

              <Flex vertical justify="center" style={{ minWidth: 0, overflow: 'hidden' }}>
                <Typography.Text
                  strong
                  style={{
                    fontSize: isMobile ? '15px' : '16px',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    color: mytheme === 'dark' ? '#f1f5f9' : '#0f172a',
                  }}
                >
                  {pageHeader.title ?? ''}
                </Typography.Text>
                {!isMobile && pageHeader.description && (
                  <Typography.Text
                    style={{
                      fontSize: '12px',
                      color: mytheme === 'dark' ? 'rgba(255,255,255,0.38)' : '#94a3b8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pageHeader.description}
                  </Typography.Text>
                )}
              </Flex>
            </Flex>

            {/* 右侧胶囊按钮组 */}
            <Flex
              align="center"
              style={{
                flexShrink: 0,
                background: mytheme === 'dark'
                  ? hexToRgba(activeColor, 0.08)
                  : hexToRgba(activeColor, 0.06),
                borderRadius: '999px',
                padding: '3px',
                gap: 1,
                border: `1px solid ${mytheme === 'dark' ? hexToRgba(activeColor, 0.18) : hexToRgba(activeColor, 0.15)}`,
                transition: 'background 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.35s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* 通知 */}
              <Tooltip title="通知">
                <div style={pillBtnStyle(mytheme)}
                  onMouseEnter={e => pillHover(e, mytheme, true)}
                  onMouseLeave={e => pillHover(e, mytheme, false)}
                >
                  <BellOutlined style={{ fontSize: 15 }} />
                  <span style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#ef4444',
                    border: `2px solid ${mytheme === 'dark' ? hexToRgba(activeColor, 0.08) : hexToRgba(activeColor, 0.06)}`,
                    transition: 'border-color 0.35s',
                  }} />
                </div>
              </Tooltip>

              {/* 文档 */}
              {!isMobile && (
                <Tooltip title="文档">
                  <div style={pillBtnStyle(mytheme)}
                    onMouseEnter={e => pillHover(e, mytheme, true)}
                    onMouseLeave={e => pillHover(e, mytheme, false)}
                  >
                    <FileTextOutlined style={{ fontSize: 15 }} />
                  </div>
                </Tooltip>
              )}

              {/* 分隔线 */}
              <div style={{ width: 1, height: 20, background: mytheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0', margin: '0 2px', flexShrink: 0 }} />

              {/* 语言切换 */}
              <Dropdown
                trigger={['click']}
                placement="bottomRight"
                menu={{
                  selectedKeys: [currentLang],
                  items: [
                    { key: 'en', label: <Flex align="center" gap={8}><span>🇺🇸</span><span>English</span></Flex>, onClick: () => i18n.changeLanguage('en') },
                    { key: 'zh', label: <Flex align="center" gap={8}><span>🇨🇳</span><span>中文</span></Flex>, onClick: () => i18n.changeLanguage('zh') },
                  ],
                }}
              >
                <div
                  style={{ ...pillBtnStyle(mytheme), gap: 4, padding: '0 10px', width: 'auto' }}
                  onMouseEnter={e => pillHover(e, mytheme, true)}
                  onMouseLeave={e => pillHover(e, mytheme, false)}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{currentLang === 'zh' ? '🇨🇳' : '🇺🇸'}</span>
                  {!isMobile && <span style={{ fontSize: 12, fontWeight: 500 }}>{currentLang === 'zh' ? '中文' : 'EN'}</span>}
                  <CaretDownOutlined style={{ fontSize: 8, opacity: 0.5 }} />
                </div>
              </Dropdown>

              {/* 主题切换 */}
              <Tooltip title={mytheme === 'dark' ? '浅色模式' : '深色模式'}>
                <div
                  style={pillBtnStyle(mytheme)}
                  onClick={() => dispatch(toggleTheme())}
                  onMouseEnter={e => pillHover(e, mytheme, true)}
                  onMouseLeave={e => pillHover(e, mytheme, false)}
                >
                  {mytheme === 'dark' ? <SunOutlined style={{ fontSize: 15 }} /> : <MoonOutlined style={{ fontSize: 15 }} />}
                </div>
              </Tooltip>

              {/* 分隔线 */}
              <div style={{ width: 1, height: 20, background: mytheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0', margin: '0 2px', flexShrink: 0 }} />

              {/* Balance 胶囊 — 固定绿色 */}
              <div
                style={{
                  height: 32,
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '0 12px',
                  cursor: 'pointer',
                  background: 'rgba(34,197,94,0.12)',
                  color: '#16a34a',
                  fontSize: 12,
                  fontWeight: 700,
                  transition: 'background 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(34,197,94,0.22)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(34,197,94,0.12)'; }}
              >
                <DollarOutlined style={{ fontSize: 13 }} />
                <span>{userBalance}</span>
              </div>

              {/* 分隔线 */}
              <div style={{ width: 1, height: 20, background: mytheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0', margin: '0 2px', flexShrink: 0 }} />

              {/* 用户菜单 */}
              <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                <div
                  style={{ ...pillBtnStyle(mytheme), gap: 7, padding: '0 8px 0 4px', width: 'auto' }}
                  onMouseEnter={e => pillHover(e, mytheme, true)}
                  onMouseLeave={e => pillHover(e, mytheme, false)}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #c46446)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {userInitials}
                  </div>
                  {!isMobile && (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 600, color: mytheme === 'dark' ? '#fff' : '#0f172a', whiteSpace: 'nowrap' }}>
                        {displayName}
                      </span>
                      <CaretDownOutlined style={{ fontSize: 9, opacity: 0.4, flexShrink: 0 }} />
                    </>
                  )}
                </div>
              </Dropdown>
            </Flex>
          </HeaderNav>
          <Content
            style={{
              marginLeft: collapsed
                ? `${SIDEBAR_COLLAPSED_WIDTH}px`
                : `${SIDEBAR_WIDTH}px`,
              marginTop: '82px',
              borderRadius: collapsed ? 0 : borderRadius,
              transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
              padding: '0 16px 24px',
              minHeight: 360,
              background: mytheme === 'dark' ? '#111318' : '#F8FAFC',
            }}
          >
            <PageContextProvider value={pageContextValue}>
              <div style={{ background: 'none' }}>{children ?? <Outlet />}</div>
            </PageContextProvider>
            <div ref={floatBtnRef}>
              <FloatButton.BackTop />
            </div>
          </Content>
          <FooterNav
            style={{
              textAlign: 'center',
              marginLeft: collapsed
                ? `${SIDEBAR_COLLAPSED_WIDTH}px`
                : `${SIDEBAR_WIDTH}px`,
              transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
              background: 'none',
            }}
          />
        </Layout>
      </Layout>
      <LoginModal />
    </>
  );
};
