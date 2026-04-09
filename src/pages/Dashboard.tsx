import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Tooltip,
  Switch,
  message,
  Select,
  MenuProps,
} from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  FileTextOutlined,
  DashboardOutlined,
  KeyOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { toggleTheme } from '../redux/theme/themeSlice';

const { Header, Content, Sider } = Layout;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const dispatch = useDispatch();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const [collapsed, setCollapsed] = useState(false);

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

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'api-keys',
      icon: <KeyOutlined />,
      label: 'API 密钥',
    },
    {
      key: 'menu1',
      label: '一级菜单',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人资料',
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
    {
      type: 'divider',
    } as any,
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleUserMenuClick = (e: any) => {
    if (e.key === 'logout') {
      handleLogout();
    }
  };

  // 统计卡片数据
  const statCards = [
    { title: '余额', value: '$0.00', subtitle: '可用' },
    { title: 'API 密钥', value: '0', subtitle: '0 密钥' },
    { title: '余额池', value: '0', subtitle: '余计: 0' },
    { title: '今日流素', value: '$0.0000', subtitle: '余计: $0.0000' },
    { title: '今日 Token', value: '0', subtitle: '输入 0 / 输出: 0' },
    { title: '累计 Token', value: '0', subtitle: '输入 0 / 输出: 0' },
    { title: '虚拟创建', value: '0', subtitle: 'RPM: 0, TPM: 0' },
    { title: '今日速率', value: '0ms', subtitle: '平均时间' },
  ];

  const recentData = [
    {
      key: '1',
      id: 'api_1',
      type: 'Create API Key',
      date: '2024-04-07 10:30',
      status: 'success',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={200}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: collapsed ? '16px' : '18px',
              fontWeight: 'bold',
              color: '#1890ff',
              transition: 'all 0.3s',
            }}
          >
            {collapsed ? 'XD' : 'XueDingToken'}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            width: '100%',
            padding: '0 16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 16px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  fontSize: '12px',
                  color: '#fff',
                }}
              >
                深色模式
              </div>
              <Switch
                checked={mytheme === 'dark'}
                onChange={() => dispatch(toggleTheme())}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
            </Space>
          </div>
        </div>
      </Sider>

      {/* 主布局 */}
      <Layout>
        {/* 顶部栏 */}
        <Header
          style={{
            background: mytheme === 'dark' ? '#141414' : '#fff',
            padding: '16px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${
              mytheme === 'dark' ? '#333' : '#e8e8e8'
            }`,
            height: 'auto',
            minHeight: '64px',
          }}
        >
          <div>
            <h2
              style={{ margin: 0, color: mytheme === 'dark' ? '#fff' : '#000' }}
            >
              仪表盘
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: mytheme === 'dark' ? '#8c8c8c' : '#999',
              }}
            >
              记是您专户的概述。
            </p>
          </div>

          <Space size="large" style={{ display: 'flex' }}>
            <Tooltip title="通知">
              <BellOutlined
                style={{
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: mytheme === 'dark' ? '#fff' : '#000',
                }}
              />
            </Tooltip>

            <Tooltip title="文档">
              <FileTextOutlined
                style={{
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: mytheme === 'dark' ? '#fff' : '#000',
                }}
              />
            </Tooltip>

            <Select
              defaultValue="zh"
              style={{ width: 70 }}
              options={[
                { label: '中文', value: 'zh' },
                { label: 'English', value: 'en' },
              ]}
            />

            <div style={{ color: '#1890ff', fontWeight: 'bold' }}>$0.00</div>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  style={{ backgroundColor: '#1890ff' }}
                  icon={<UserOutlined />}
                />
                <span style={{ color: mytheme === 'dark' ? '#fff' : '#000' }}>
                  {user?.email || 'User'}
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 主内容 */}
        <Content
          style={{
            padding: '24px 24px',
            background: mytheme === 'dark' ? '#000' : '#f5f5f5',
          }}
        >
          {/* 统计卡片网格 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {statCards.map((card, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    border: 'none',
                    boxShadow:
                      mytheme === 'dark'
                        ? '0 2px 8px rgba(0,0,0,0.45)'
                        : '0 2px 8px rgba(0,0,0,0.06)',
                    background: mytheme === 'dark' ? '#1f1f1f' : '#fff',
                  }}
                  hoverable
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: mytheme === 'dark' ? '#8c8c8c' : '#999',
                          marginBottom: '8px',
                        }}
                      >
                        {card.title}
                      </div>
                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#1890ff',
                          marginBottom: '4px',
                        }}
                      >
                        {card.value}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: mytheme === 'dark' ? '#8c8c8c' : '#ccc',
                        }}
                      >
                        {card.subtitle}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* 图表区域 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                title="模型分布"
                style={{
                  border: 'none',
                  boxShadow:
                    mytheme === 'dark'
                      ? '0 2px 8px rgba(0,0,0,0.45)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                  background: mytheme === 'dark' ? '#1f1f1f' : '#fff',
                }}
              >
                <div
                  style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: mytheme === 'dark' ? '#8c8c8c' : '#ccc',
                  }}
                >
                  暂无数据
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="Token 使用趋势"
                style={{
                  border: 'none',
                  boxShadow:
                    mytheme === 'dark'
                      ? '0 2px 8px rgba(0,0,0,0.45)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                  background: mytheme === 'dark' ? '#1f1f1f' : '#fff',
                }}
              >
                <div
                  style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: mytheme === 'dark' ? '#8c8c8c' : '#ccc',
                  }}
                >
                  暂无数据
                </div>
              </Card>
            </Col>
          </Row>

          {/* 最近使用和快捷操作 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card
                title="最近使用"
                style={{
                  border: 'none',
                  boxShadow:
                    mytheme === 'dark'
                      ? '0 2px 8px rgba(0,0,0,0.45)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                  background: mytheme === 'dark' ? '#1f1f1f' : '#fff',
                }}
              >
                <Table
                  dataSource={recentData}
                  columns={[
                    {
                      title: '操作',
                      dataIndex: 'type',
                      key: 'type',
                      render: (text) => <span>{text}</span>,
                    },
                    {
                      title: '时间',
                      dataIndex: 'date',
                      key: 'date',
                      render: (text) => <span>{text}</span>,
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={status === 'success' ? 'green' : 'red'}>
                          {status === 'success' ? '成功' : '失败'}
                        </Tag>
                      ),
                    },
                  ]}
                  pagination={false}
                />
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card
                title="快捷操作"
                style={{
                  border: 'none',
                  boxShadow:
                    mytheme === 'dark'
                      ? '0 2px 8px rgba(0,0,0,0.45)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                  background: mytheme === 'dark' ? '#1f1f1f' : '#fff',
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" block icon={<KeyOutlined />}>
                    创建 API 密钥
                  </Button>
                  <Button block>生成访问令牌</Button>
                  <Button block>查看文档</Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};
