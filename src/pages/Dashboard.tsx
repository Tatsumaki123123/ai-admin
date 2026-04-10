import { Card, Row, Col, Button, Table, Tag, Space, Select, Flex } from 'antd';
import {
  KeyOutlined,
  DollarOutlined,
  FileTextOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  BgColorsOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useTranslation } from 'react-i18next';
import { usePageHeader } from '../hooks/usePageContext';

const cardIcons = [
  { icon: DollarOutlined, color: '#52c41a' },
  { icon: KeyOutlined, color: '#1890ff' },
  { icon: FileTextOutlined, color: '#faad14' },
  { icon: DollarOutlined, color: '#f5222d' },
  { icon: ThunderboltOutlined, color: '#faad14' },
  { icon: BgColorsOutlined, color: '#722ed1' },
  { icon: RiseOutlined, color: '#13c2c2' },
  { icon: ClockCircleOutlined, color: '#eb2f96' },
];

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { mytheme } = useSelector((state: RootState) => state.theme);

  usePageHeader({
    title: t('dashboard.title'),
    description: t('dashboard.subtitle'),
  });

  // 统计卡片数据
  const statCards = [
    {
      title: t('dashboard.balance'),
      value: '$0.00',
      subtitle: t('dashboard.available'),
    },
    {
      title: t('dashboard.apiKeys'),
      value: '0',
      subtitle: t('dashboard.apiKeyCount'),
    },
    {
      title: t('dashboard.balancePool'),
      value: '0',
      subtitle: t('dashboard.balancePoolSubtitle'),
    },
    {
      title: t('dashboard.dailyConsumption'),
      value: '$0.0000',
      subtitle: t('dashboard.dailyConsumptionSubtitle'),
    },
    {
      title: t('dashboard.dailyToken'),
      value: '0',
      subtitle: t('dashboard.dailyTokenSubtitle'),
    },
    {
      title: t('dashboard.totalToken'),
      value: '0',
      subtitle: t('dashboard.totalTokenSubtitle'),
    },
    {
      title: t('dashboard.virtualCreation'),
      value: '0',
      subtitle: t('dashboard.virtualCreationSubtitle'),
    },
    {
      title: t('dashboard.dailyRate'),
      value: '0ms',
      subtitle: t('dashboard.dailyRateSubtitle'),
    },
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
    <>
      {/* 统计卡片网格 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {statCards.map((card, index) => {
          const IconComponent = cardIcons[index].icon;
          const iconColor = cardIcons[index].color;
          return (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              <Card
                style={{
                  border: `1px solid ${
                    mytheme === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.06)'
                  }`,
                  boxShadow:
                    mytheme === 'dark'
                      ? '0 1px 4px rgba(0,0,0,0.25)'
                      : '0 1px 2px rgba(0,0,0,0.03)',
                  background: mytheme === 'dark' ? '#141414' : '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                }}
                hoverable
              >
                <Flex gap="middle" align="flex-start">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      background: `${iconColor}15`,
                      flexShrink: 0,
                    }}
                  >
                    <IconComponent
                      style={{
                        fontSize: '24px',
                        color: iconColor,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: mytheme === 'dark' ? '#8c8c8c' : '#666',
                        marginBottom: '4px',
                        fontWeight: '500',
                      }}
                    >
                      {card.title}
                    </div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: mytheme === 'dark' ? '#fff' : '#000',
                        marginBottom: '4px',
                      }}
                    >
                      {card.value}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: mytheme === 'dark' ? '#595959' : '#999',
                      }}
                    >
                      {card.subtitle}
                    </div>
                  </div>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 时间范围和粒度选择 */}
      <Flex
        justify="space-between"
        align="center"
        style={{
          marginBottom: 24,
          padding: '12px 16px',
          background: mytheme === 'dark' ? '#141414' : '#ffffff',
          borderRadius: '8px',
          border: `1px solid ${
            mytheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
          }`,
        }}
      >
        <Space>
          <span
            style={{
              color: mytheme === 'dark' ? '#fff' : '#000',
              fontSize: '14px',
            }}
          >
            {t('dashboard.time')}:
          </span>
          <Select
            defaultValue="7days"
            style={{ width: 120 }}
            options={[
              { label: '近 7 天', value: '7days' },
              { label: '近 30 天', value: '30days' },
              { label: '近 90 天', value: '90days' },
              { label: '本年', value: 'year' },
            ]}
          />
        </Space>
        <Space>
          <span
            style={{
              color: mytheme === 'dark' ? '#fff' : '#000',
              fontSize: '14px',
            }}
          >
            粒度:
          </span>
          <Select
            defaultValue="daily"
            style={{ width: 100 }}
            options={[
              { label: '按天', value: 'daily' },
              { label: '按小时', value: 'hourly' },
              { label: '按周', value: 'weekly' },
            ]}
          />
        </Space>
      </Flex>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={t('dashboard.modelDistribution')}
            style={{
              border: `1px solid ${
                mytheme === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.06)'
              }`,
              boxShadow:
                mytheme === 'dark'
                  ? '0 1px 4px rgba(0,0,0,0.25)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
              background: mytheme === 'dark' ? '#141414' : '#fafafa',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                height: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: mytheme === 'dark' ? '#595959' : '#bfbfbf',
              }}
            >
              {t('dashboard.noData')}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={t('dashboard.tokenTrend')}
            style={{
              border: `1px solid ${
                mytheme === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.06)'
              }`,
              boxShadow:
                mytheme === 'dark'
                  ? '0 1px 4px rgba(0,0,0,0.25)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
              background: mytheme === 'dark' ? '#141414' : '#fafafa',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                height: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: mytheme === 'dark' ? '#595959' : '#bfbfbf',
              }}
            >
              {t('dashboard.noData')}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近使用和快捷操作 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={t('dashboard.recentUsage')}
            extra={
              <span
                style={{
                  color: mytheme === 'dark' ? '#8c8c8c' : '#999',
                  fontSize: '12px',
                }}
              >
                最近 7 天
              </span>
            }
            style={{
              border: `1px solid ${
                mytheme === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.06)'
              }`,
              boxShadow:
                mytheme === 'dark'
                  ? '0 1px 4px rgba(0,0,0,0.25)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
              background: mytheme === 'dark' ? '#141414' : '#fafafa',
              borderRadius: '12px',
            }}
          >
            <Table
              dataSource={recentData}
              columns={[
                {
                  title: t('dashboard.operation'),
                  dataIndex: 'type',
                  key: 'type',
                  render: (text) => <span>{text}</span>,
                },
                {
                  title: t('dashboard.time'),
                  dataIndex: 'date',
                  key: 'date',
                  render: (text) => <span>{text}</span>,
                },
                {
                  title: t('dashboard.status'),
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'success' ? 'green' : 'red'}>
                      {status === 'success'
                        ? t('dashboard.success')
                        : t('dashboard.failed')}
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
            title={t('dashboard.quickActions')}
            style={{
              border: `1px solid ${
                mytheme === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.06)'
              }`,
              boxShadow:
                mytheme === 'dark'
                  ? '0 1px 4px rgba(0,0,0,0.25)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
              background: mytheme === 'dark' ? '#141414' : '#fafafa',
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<KeyOutlined />}>
                {t('dashboard.createApiKey')}
              </Button>
              <Button block>{t('dashboard.generateToken')}</Button>
              <Button block>{t('dashboard.viewDocs')}</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};
