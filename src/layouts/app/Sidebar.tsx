import { ConfigProvider, Layout, Menu, MenuProps } from 'antd';
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
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

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
          item?.key && location.pathname.startsWith(item.key as string)
      )
      .map((item: any) => item?.key as string)[0] || '/dashboard';

  return (
    <Sider
      trigger={null}
      collapsed={collapsed}
      width={220}
      collapsedWidth={60}
      style={{
        background: isDark ? '#141414' : '#fff',
        borderRight: `1px solid ${
          isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'
        }`,
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 99,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
        <div
          style={{
            width: '32px',
            height: '32px',
            minWidth: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00d589, #00b8d9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowUpOutlined style={{ color: '#fff', fontSize: '16px' }} />
        </div>
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
            XueDingToken
          </span>
        )}
      </div>

      {/* Menu */}
      <div style={{ flex: 1, overflow: 'hidden auto', padding: '8px 0' }}>
        <ConfigProvider
          theme={{
            token: { colorPrimary: '#00c8a0' },
            components: {
              Menu: {
                itemSelectedBg: 'rgba(0, 200, 160, 0.1)',
                itemSelectedColor: '#00c8a0',
              },
            },
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ background: 'transparent', border: 'none' }}
            theme={isDark ? 'dark' : 'light'}
          />
        </ConfigProvider>
      </div>

      {/* Bottom section */}
      <div
        style={{
          borderTop: `1px solid ${
            isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'
          }`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '48px',
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
    </Sider>
  );
};
