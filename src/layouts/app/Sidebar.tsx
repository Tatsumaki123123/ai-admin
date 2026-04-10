import { ConfigProvider, Menu, MenuProps } from 'antd';
import {
  DashboardOutlined,
  KeyOutlined,
  UserOutlined,
  RocketOutlined,
  BarChartOutlined,
  StarOutlined,
  CreditCardOutlined,
  GiftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import logoImg from '../../assets/logo.png';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';

export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 80;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const normalizedPathname = location.pathname;

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/keys',
      icon: <KeyOutlined />,
      label: 'API 密钥',
      onClick: () => navigate('/keys'),
    },
    {
      key: '/deploy',
      icon: <RocketOutlined />,
      label: '一键部署',
      onClick: () => navigate('/deploy'),
    },
    {
      key: '/logs',
      icon: <BarChartOutlined />,
      label: '使用记录',
      onClick: () => navigate('/logs'),
    },
    {
      key: '/subscription',
      icon: <StarOutlined />,
      label: '我的订阅',
      onClick: () => navigate('/subscription'),
    },
    {
      key: '/topup',
      icon: <CreditCardOutlined />,
      label: '充值/订阅',
      onClick: () => navigate('/topup'),
    },
    {
      key: '/redeem',
      icon: <GiftOutlined />,
      label: '兑换',
      onClick: () => navigate('/redeem'),
    },
    {
      key: '/user-profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/user-profile/details'),
    },
  ];

  const selectedKey =
    menuItems
      ?.filter(
        (item: any) =>
          item?.key && normalizedPathname.startsWith(item.key as string)
      )
      .map((item: any) => item?.key as string)[0] || '/dashboard';

  return (
    <div
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        minWidth: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        background: isDark ? '#141414' : '#fff',
        borderRight: `1px solid ${
          isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'
        }`,
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 99,
        overflow: 'hidden',
        transition: 'width 0.2s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: collapsed ? '14px' : '20px',
            borderBottom: `1px solid ${
              isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'
            }`,
            overflow: 'hidden',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={() => navigate('/dashboard')}
        >
          <img
            src={logoImg}
            alt="logo"
            style={{
              width: '32px',
              height: '32px',
              minWidth: '32px',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
          {!collapsed && (
            <span
              style={{
                marginLeft: '10px',
                fontSize: '16px',
                fontWeight: '600',
                color: isDark ? '#fff' : '#1a1a1a',
                whiteSpace: 'nowrap',
              }}
            >
              ApeCode
            </span>
          )}
        </div>

        {/* Menu */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden auto',
            padding: '8px 0 16px',
            overscrollBehavior: 'contain',
          }}
        >
          <ConfigProvider
            theme={{
              token: { colorPrimary: PRIMARY_COLOR },
              components: {
                Menu: {
                  itemSelectedBg: hexToRgba(PRIMARY_COLOR, 0.12),
                  itemSelectedColor: PRIMARY_COLOR,
                },
              },
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              inlineCollapsed={collapsed}
              items={menuItems}
              style={{ background: 'transparent', border: 'none' }}
              theme={isDark ? 'dark' : 'light'}
            />
          </ConfigProvider>
        </div>

        {/* Bottom section */}
        <div
          style={{
            marginTop: 'auto',
            borderTop: `1px solid ${
              isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'
            }`,
            flexShrink: 0,
            background: isDark ? '#141414' : '#fff',
          }}
        >
          <div
            style={{
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              padding: collapsed ? '0 14px' : '0 20px',
              cursor: 'pointer',
              color: isDark ? '#888' : '#666',
            }}
            onClick={() => onCollapse(!collapsed)}
          >
            {!collapsed && <span style={{ fontSize: '13px' }}>收起</span>}
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: '16px' }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: '16px' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
