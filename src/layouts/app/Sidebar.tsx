import { ConfigProvider, Menu, MenuProps } from 'antd';
import {
  DashboardOutlined,
  KeyOutlined,
  ThunderboltOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  CalendarOutlined,
  GiftOutlined,
  TeamOutlined,
  DollarOutlined,
  SettingOutlined,
  BarChartOutlined,
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

  const findSelectedKey = (items: MenuProps['items']): string | undefined => {
    for (const item of items || []) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      if ('children' in item && Array.isArray(item.children)) {
        const childMatch = findSelectedKey(item.children);
        if (childMatch) {
          return childMatch;
        }
      }

      if (
        'key' in item &&
        typeof item.key === 'string' &&
        normalizedPathname.startsWith(item.key)
      ) {
        return item.key;
      }
    }

    return undefined;
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard'),
    },
    {
      type: 'group',
      label: 'API',
      children: [
        {
          key: '/keys',
          icon: <KeyOutlined />,
          label: 'API 密钥',
          onClick: () => navigate('/keys'),
        },
        {
          key: '/key-test',
          icon: <ThunderboltOutlined />,
          label: 'Key 测试',
          disabled: true,
        },
        {
          key: '/logs',
          icon: <BarChartOutlined />,
          label: '使用记录',
          disabled: true,
        },
        {
          key: '/deploy',
          icon: <ThunderboltOutlined />,
          label: '一键部署',
          onClick: () => navigate('/deploy'),
        },
      ],
    },
    {
      type: 'group',
      label: '账单',
      children: [
        {
          key: '/topup',
          icon: <CreditCardOutlined />,
          label: '充值 / 订阅',
          disabled: true,
        },
        {
          key: '/orders',
          icon: <ShoppingCartOutlined />,
          label: '我的订单',
          disabled: true,
        },
        {
          key: '/quota-records',
          icon: <WalletOutlined />,
          label: '额度记录',
          disabled: true,
        },
        {
          key: '/subscription',
          icon: <CalendarOutlined />,
          label: '我的订阅',
          disabled: true,
        },
        {
          key: '/redeem',
          icon: <GiftOutlined />,
          label: '兑换码',
          onClick: () => navigate('/redeem'),
        },
      ],
    },
    {
      type: 'group',
      label: '分销',
      children: [
        {
          key: '/distribution',
          icon: <TeamOutlined />,
          label: '分销中心',
          disabled: true,
        },
        {
          key: '/commissions',
          icon: <DollarOutlined />,
          label: '佣金明细',
          disabled: true,
        },
      ],
    },
  ];

  const selectedKey = findSelectedKey(menuItems) || '/dashboard';

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
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: isDark ? '#fff' : '#0f172a',
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
                  itemSelectedBg: hexToRgba(PRIMARY_COLOR, 0.16),
                  itemSelectedColor: PRIMARY_COLOR,
                  itemHoverBg: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
                  itemBorderRadius: 6,
                  itemMarginInline: 6,
                  itemPaddingInline: 10,
                  groupTitleColor: isDark
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.3)',
                  groupTitleFontSize: 11,
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
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '0 28px' : '0 20px',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.88)',
              cursor: 'not-allowed',
            }}
          >
            <SettingOutlined style={{ fontSize: '16px' }} />
            {!collapsed && <span style={{ fontSize: '14px' }}>个人设置</span>}
          </div>
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
