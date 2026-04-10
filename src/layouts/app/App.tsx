import {
  Dropdown,
  Flex,
  FloatButton,
  Layout,
  MenuProps,
  message,
  theme,
  Tooltip,
  Switch,
  Divider,
  Badge,
} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  LogoutOutlined,
  QuestionOutlined,
  SettingOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  FileTextOutlined,
  GlobalOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  CSSTransition,
  SwitchTransition,
  TransitionGroup,
} from 'react-transition-group';
import { useMediaQuery } from 'react-responsive';
import {
  Sidebar,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from './Sidebar.tsx';
import HeaderNav from './HeaderNav.tsx';
import FooterNav from './FooterNav.tsx';
import { NProgress, LoginModal } from '../../components';
import { PATH_LANDING } from '../../constants';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/theme/themeSlice.ts';
import { logoutUser, setToken, setUser } from '../../redux/auth/authSlice';
import { enableMockData } from '../../redux/dataMode/dataModeSlice';
import { RootState } from '../../redux/store.ts';
import { useAuth } from '../../contexts/AuthContext';
const { Content } = Layout;

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const {
    token: { borderRadius },
  } = theme.useToken();
  const isMobile = useMediaQuery({ maxWidth: 769 });
  const [collapsed, setCollapsed] = useState(true);
  const [navFill, setNavFill] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const nodeRef = useRef(null);
  const floatBtnRef = useRef(null);
  const dispatch = useDispatch();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { user: authUser } = useAuth();
  const displayName =
    (authUser as any)?.display_name ||
    (authUser as any)?.username ||
    (authUser as any)?.email?.split('@')[0] ||
    user?.email?.split('@')[0] ||
    'User';
  const userInitials = displayName.substring(0, 2).toUpperCase();
  const userRole = (authUser as any)?.role === 0 ? 'Admin' : 'User';
  const userBalance = `$${(((authUser as any)?.quota || 0) / 500000).toFixed(
    2
  )}`;

  const handleLogout = async () => {
    message.open({
      type: 'loading',
      content: 'signing you out',
    });

    // If authenticated, logout from API
    if (isAuthenticated && user?.email) {
      await dispatch(logoutUser(user.email) as any);
    }

    // Switch back to mock data mode
    dispatch(enableMockData());

    setTimeout(() => {
      navigate(PATH_LANDING.root);
    }, 1000);
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
    setCollapsed(isMobile);
  }, [isMobile]);

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
      <NProgress isAnimating={isLoading} key={location.key} />
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
              top: 0,
              left: collapsed
                ? `${SIDEBAR_COLLAPSED_WIDTH}px`
                : `${SIDEBAR_WIDTH}px`,
              right: 0,
              padding: '0 2rem',
              background: navFill
                ? mytheme === 'dark'
                  ? 'rgba(20, 20, 20, 0.9)'
                  : 'rgba(255, 255, 255, 0.95)'
                : mytheme === 'dark'
                  ? '#141414'
                  : '#fff',
              backdropFilter: navFill ? 'blur(10px)' : 'none',
              boxShadow: navFill
                ? mytheme === 'dark'
                  ? '0 1px 8px rgba(0, 0, 0, 0.3)'
                  : '0 1px 8px rgba(0, 0, 0, 0.08)'
                : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '64px',
              zIndex: 100,
              transition: 'all .25s',
              borderBottom: `1px solid ${
                mytheme === 'dark' ? 'rgba(255,255,255,0.08)' : '#f0f0f0'
              }`,
            }}
          >
            {/* 右侧: 功能菜单 */}
            <Flex align="center" gap="middle" style={{ marginLeft: 'auto' }}>
              {/* 通知图标 */}
              <Badge dot offset={[-2, 2]}>
                <Tooltip title="通知">
                  <BellOutlined
                    style={{
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: mytheme === 'dark' ? '#fff' : '#000',
                    }}
                  />
                </Tooltip>
              </Badge>

              <Divider
                type="vertical"
                style={{
                  height: '24px',
                  borderColor:
                    mytheme === 'dark'
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.1)',
                }}
              />

              {/* 文档链接 */}
              <Tooltip title="文档">
                <Flex
                  align="center"
                  gap={4}
                  style={{
                    cursor: 'pointer',
                    color: mytheme === 'dark' ? '#fff' : '#000',
                    fontSize: '14px',
                  }}
                >
                  <FileTextOutlined style={{ fontSize: '16px' }} />
                  <span style={{ display: isMobile ? 'none' : 'inline' }}>
                    文档
                  </span>
                </Flex>
              </Tooltip>

              {/* 语言选择 */}
              <Tooltip title="语言">
                <Flex
                  align="center"
                  gap={4}
                  style={{
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: mytheme === 'dark' ? '#fff' : '#000',
                    fontSize: '12px',
                    border:
                      mytheme === 'dark'
                        ? '1px solid rgba(255,255,255,0.2)'
                        : '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <GlobalOutlined style={{ fontSize: '14px' }} />
                  <span style={{ display: isMobile ? 'none' : 'inline' }}>
                    CN
                  </span>
                  <span style={{ display: isMobile ? 'none' : 'inline' }}>
                    ZH
                  </span>
                </Flex>
              </Tooltip>

              <Divider
                type="vertical"
                style={{
                  height: '24px',
                  borderColor:
                    mytheme === 'dark'
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.1)',
                }}
              />

              {/* 主题切换 */}
              <Tooltip title={mytheme === 'dark' ? '浅色模式' : '深色模式'}>
                <Switch
                  checked={mytheme === 'dark'}
                  onClick={() => dispatch(toggleTheme())}
                  checkedChildren={<MoonOutlined />}
                  unCheckedChildren={<SunOutlined />}
                  style={{ marginRight: '4px' }}
                />
              </Tooltip>

              {/* Balance */}
              <Flex
                align="center"
                gap={4}
                style={{
                  background: 'rgba(0, 200, 160, 0.1)',
                  border: '1px solid rgba(0, 200, 160, 0.3)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  color: '#00c8a0',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                <DollarOutlined style={{ fontSize: '14px' }} />
                <span>{userBalance}</span>
              </Flex>

              <Divider
                type="vertical"
                style={{
                  height: '24px',
                  borderColor:
                    mytheme === 'dark'
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.1)',
                }}
              />

              {/* 用户菜单 */}
              <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Flex
                  align="center"
                  gap="small"
                  style={{
                    cursor: 'pointer',
                    padding: '4px 8px 4px 4px',
                    borderRadius: '6px',
                    transition: 'background-color 0.3s',
                    color: mytheme === 'dark' ? '#fff' : '#000',
                  }}
                  className="header-user-menu"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      mytheme === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00d589, #00b8d9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {userInitials}
                  </div>
                  <Flex
                    style={{
                      display: isMobile ? 'none' : 'flex',
                      flexDirection: 'column',
                      gap: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: mytheme === 'dark' ? '#fff' : '#000',
                        lineHeight: '1.2',
                      }}
                    >
                      {displayName}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: mytheme === 'dark' ? '#8c8c8c' : '#999',
                        lineHeight: '1.2',
                      }}
                    >
                      {userRole}
                    </span>
                  </Flex>
                </Flex>
              </Dropdown>
            </Flex>
          </HeaderNav>
          <Content
            style={{
              marginLeft: collapsed
                ? `${SIDEBAR_COLLAPSED_WIDTH}px`
                : `${SIDEBAR_WIDTH}px`,
              marginTop: '64px',
              borderRadius: collapsed ? 0 : borderRadius,
              transition: 'all .25s',
              padding: '32px',
              minHeight: 360,
              background: mytheme === 'dark' ? '#000' : '#f5f5f5',
            }}
          >
            <TransitionGroup>
              <SwitchTransition>
                <CSSTransition
                  key={`css-transition-${location.key}`}
                  nodeRef={nodeRef}
                  onEnter={() => {
                    setIsLoading(true);
                  }}
                  onEntered={() => {
                    setIsLoading(false);
                  }}
                  timeout={300}
                  classNames="bottom-to-top"
                  unmountOnExit
                >
                  {() => (
                    <div ref={nodeRef} style={{ background: 'none' }}>
                      {children}
                    </div>
                  )}
                </CSSTransition>
              </SwitchTransition>
            </TransitionGroup>
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
              background: 'none',
            }}
          />
        </Layout>
      </Layout>
      <LoginModal />
    </>
  );
};
