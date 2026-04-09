import { Layout, Button, Avatar, Dropdown, MenuProps } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';

const { Header } = Layout;

interface TopbarProps {
  collapsed?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      message.success('已退出登录');
      navigate('/auth/signin', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      message.error('退出登录失败');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('dashboard.profileCenter'),
      onClick: () => navigate('/user-profile/details'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('dashboard.accountSettings'),
      onClick: () => navigate('/user-profile/security'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('dashboard.logout'),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 999,
        height: '64px',
        marginLeft: collapsed ? 80 : 200,
        transition: 'margin-left 0.2s',
      }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ fontSize: '18px', color: '#666' }}
        />
      </div>

      <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <Avatar size={32} icon={<UserOutlined />} />
          <span>{user?.email || '用户'}</span>
        </div>
      </Dropdown>
    </Header>
  );
};
