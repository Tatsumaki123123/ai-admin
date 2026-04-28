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
} from '@ant-design/icons';
import { PRIMARY_COLOR } from '../../theme/colors';

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  iconBg: string;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    label: 'General',
    items: [
      { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘',      iconBg: '#6366f1' },
    ],
  },
  {
    label: 'API',
    items: [
      { key: '/keys',   icon: <KeyOutlined />,        label: 'API 密钥',  iconBg: '#f59e0b' },
      { key: '/logs',   icon: <BarChartOutlined />,    label: '使用记录',  iconBg: '#10b981' },
      { key: '/deploy', icon: <ThunderboltOutlined />, label: '一键部署',  iconBg: '#3b82f6' },
    ],
  },
  {
    label: '账单',
    items: [
      { key: '/purchase',      icon: <CreditCardOutlined />,  label: '充值 / 订阅', iconBg: PRIMARY_COLOR },
      { key: '/orders',        icon: <ShoppingCartOutlined />, label: '我的订单',    iconBg: '#8b5cf6'     },
      { key: '/quota-records', icon: <WalletOutlined />,       label: '额度记录',    iconBg: '#06b6d4'     },
      { key: '/subscription',  icon: <CalendarOutlined />,     label: '我的订阅',    iconBg: '#ec4899'     },
      { key: '/redeem',        icon: <GiftOutlined />,         label: '兑换码',      iconBg: '#f97316'     },
    ],
  },
  {
    label: '分销',
    items: [
      { key: '/distribution', icon: <TeamOutlined />,   label: '分销中心', iconBg: '#14b8a6' },
      { key: '/commissions',  icon: <DollarOutlined />, label: '佣金明细', iconBg: '#84cc16' },
    ],
  },
  {
    label: '设置',
    items: [
      { key: '/settings', icon: <SettingOutlined />, label: '个人设置', iconBg: '#64748b' },
    ],
  },
];

export const ALL_MENU_ITEMS = MENU_GROUPS.flatMap(g => g.items);

/** 根据当前路径找到对应菜单项的 iconBg 颜色 */
export function getActiveColor(pathname: string): string {
  const match = ALL_MENU_ITEMS.find(item => pathname.startsWith(item.key));
  return match?.iconBg ?? PRIMARY_COLOR;
}
