import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Typography,
  Flex,
  Row,
  Col,
  Tag,
  Table,
  message,
} from 'antd';
import {
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  CopyOutlined,
  LinkOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';

const { Text, Title } = Typography;

const ADMIN_WECHAT = 'ccsub_admin';
const SITE_BASE = 'https://www.ccsub.net';

interface AffInfo {
  commission_total: number;
  commission_available: number;
  customer_count: number;
  aff_code: string;
  level: string;
  commission_rate: number;
  customers: Customer[];
}

interface Customer {
  id: string;
  username: string;
  email: string;
  created_time: number;
  orders_count: number;
  total_spent: number;
}

const LEVELS = [
  {
    key: 'ordinary',
    name: '普通合伙人',
    rate: 20,
    desc: '注册即可',
    requirement: null,
  },
  {
    key: 'senior',
    name: '高级合伙人',
    rate: 30,
    desc: '下级>=10人或累计佣金>=500',
    requirement: '下级>=10人或累计佣金>=500',
  },
  {
    key: 'super',
    name: '超级合伙人',
    rate: 40,
    desc: '下级>=50人或累计佣金>=5000',
    requirement: '下级>=50人或累计佣金>=5000',
  },
];

const MOCK_AFF_INFO: AffInfo = {
  commission_total: 0,
  commission_available: 0,
  customer_count: 0,
  aff_code: 'SDEVGNPU',
  level: 'ordinary',
  commission_rate: 20,
  customers: [],
};

const formatDate = (ts: number) => {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
};

export const DistributionPage = () => {
  usePageHeader({
    title: '分销中心',
    description: '分享你的专属推广链接，邀请用户注册并消费，获得佣金奖励。',
  });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [affInfo, setAffInfo] = useState<AffInfo>(MOCK_AFF_INFO);
  const [loading, setLoading] = useState(true);

  const fetchAffInfo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/user/aff');
      if (data) {
        setAffInfo({ ...MOCK_AFF_INFO, ...data });
      }
    } catch {
      setAffInfo(MOCK_AFF_INFO);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAffInfo();
  }, [fetchAffInfo]);

  const refLink = `${SITE_BASE}/register?ref=${affInfo.aff_code}`;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`${label}已复制`);
    });
  };

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const subTextColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const currentLevelIdx = LEVELS.findIndex((l) => l.key === affInfo.level);

  const canWithdraw = affInfo.commission_available >= 100;

  const customerColumns: ColumnsType<Customer> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (val: string) => <Text>{val}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (val: string) => (
        <Text style={{ color: subTextColor }}>{val}</Text>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_time',
      key: 'created_time',
      render: (val: number) => <Text>{formatDate(val)}</Text>,
    },
    {
      title: '订单数',
      dataIndex: 'orders_count',
      key: 'orders_count',
      align: 'right',
      render: (val: number) => <Text>{val}</Text>,
    },
    {
      title: '累计消费',
      dataIndex: 'total_spent',
      key: 'total_spent',
      align: 'right',
      render: (val: number) => (
        <Text strong style={{ color: PRIMARY_COLOR }}>
          ¥{val.toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Banner */}
      <div
        style={{
          background: hexToRgba(PRIMARY_COLOR, isDark ? 0.15 : 0.08),
          border: `1px solid ${hexToRgba(PRIMARY_COLOR, 0.3)}`,
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Text strong style={{ fontSize: 15 }}>
            想成为分销合伙人？
          </Text>
          <br />
          <Text style={{ color: subTextColor, fontSize: 13 }}>
            添加管理员微信获取完整分销文档和专属支持
          </Text>
        </div>
        <Button
          type="primary"
          icon={<WechatOutlined />}
          style={{
            background: PRIMARY_COLOR,
            borderColor: PRIMARY_COLOR,
            borderRadius: 8,
            fontWeight: 600,
          }}
          onClick={() => copyText(ADMIN_WECHAT, '微信号')}
        >
          复制微信号
        </Button>
      </div>

      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {/* 累计佣金 */}
        <Col xs={24} sm={12} md={6}>
          <div
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 12,
              padding: '20px 20px 16px',
              height: '100%',
            }}
          >
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: subTextColor, fontSize: 13 }}>
                累计佣金
              </Text>
              <DollarOutlined style={{ color: subTextColor, fontSize: 18 }} />
            </Flex>
            <div style={{ marginTop: 10 }}>
              <Text
                style={{ color: PRIMARY_COLOR, fontSize: 24, fontWeight: 700 }}
              >
                ¥{(affInfo.commission_total ?? 0).toFixed(2)}
              </Text>
            </div>
            <Text style={{ color: subTextColor, fontSize: 12 }}>
              可提现：¥{(affInfo.commission_available ?? 0).toFixed(2)}
            </Text>
          </div>
        </Col>

        {/* 我的客户 */}
        <Col xs={24} sm={12} md={6}>
          <div
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 12,
              padding: '20px 20px 16px',
              height: '100%',
            }}
          >
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: subTextColor, fontSize: 13 }}>
                我的客户
              </Text>
              <TeamOutlined style={{ color: subTextColor, fontSize: 18 }} />
            </Flex>
            <div style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 24, fontWeight: 700 }}>
                {affInfo.customer_count}
              </Text>
            </div>
            <Text style={{ color: subTextColor, fontSize: 12 }}>
              通过你的链接注册
            </Text>
          </div>
        </Col>

        {/* 合伙人等级 */}
        <Col xs={24} sm={12} md={6}>
          <div
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 12,
              padding: '20px 20px 16px',
              height: '100%',
            }}
          >
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: subTextColor, fontSize: 13 }}>
                合伙人等级
              </Text>
              <UserOutlined style={{ color: subTextColor, fontSize: 18 }} />
            </Flex>
            <div style={{ marginTop: 10 }}>
              <Title level={4} style={{ margin: 0 }}>
                {LEVELS[currentLevelIdx >= 0 ? currentLevelIdx : 0].name}
              </Title>
            </div>
            <Text style={{ color: subTextColor, fontSize: 12 }}>
              佣金比例: {affInfo.commission_rate}%
            </Text>
          </div>
        </Col>

        {/* 申请提现 */}
        <Col xs={24} sm={12} md={6}>
          <div
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 12,
              padding: '20px 20px 16px',
              height: '100%',
            }}
          >
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: subTextColor, fontSize: 13 }}>
                申请提现
              </Text>
              <CopyOutlined style={{ color: subTextColor, fontSize: 18 }} />
            </Flex>
            <div style={{ marginTop: 10 }}>
              <Button
                type="primary"
                disabled={!canWithdraw}
                style={{
                  background: canWithdraw ? PRIMARY_COLOR : undefined,
                  borderColor: canWithdraw ? PRIMARY_COLOR : undefined,
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                提现
              </Button>
            </div>
            <Text style={{ color: subTextColor, fontSize: 12 }}>
              {canWithdraw ? '满足提现条件' : '佣金不足 ¥100'}
            </Text>
          </div>
        </Col>
      </Row>

      {/* 推广链接 */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
          <LinkOutlined style={{ color: subTextColor }} />
          <Text strong style={{ fontSize: 15 }}>
            推广链接
          </Text>
        </Flex>
        <Flex
          align="center"
          gap={12}
          style={{
            marginTop: 14,
            padding: '10px 16px',
            background: isDark ? 'rgba(255,255,255,0.04)' : '#f9f9f9',
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: 13,
              wordBreak: 'break-all',
            }}
          >
            {refLink}
          </Text>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyText(refLink, '推广链接')}
          >
            复制
          </Button>
        </Flex>
        <Flex align="center" gap={8} style={{ marginTop: 12 }}>
          <Text style={{ color: subTextColor, fontSize: 13 }}>邀请码：</Text>
          <Text strong style={{ fontFamily: 'monospace', letterSpacing: 1 }}>
            {affInfo.aff_code}
          </Text>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyText(affInfo.aff_code, '邀请码')}
            style={{ color: subTextColor }}
          >
            复制
          </Button>
        </Flex>
      </Card>

      {/* 佣金等级 */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
          佣金等级
        </Title>
        <Row gutter={12}>
          {LEVELS.map((level, idx) => {
            const isCurrent = idx === currentLevelIdx;
            return (
              <Col key={level.key} xs={24} sm={8}>
                <div
                  style={{
                    border: `1px solid ${
                      isCurrent ? PRIMARY_COLOR : borderColor
                    }`,
                    borderRadius: 10,
                    padding: '16px',
                    background: isCurrent
                      ? hexToRgba(PRIMARY_COLOR, isDark ? 0.12 : 0.06)
                      : 'transparent',
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Text strong style={{ fontSize: 15 }}>
                      {level.name}
                    </Text>
                    <Tag
                      style={{
                        color: isCurrent ? PRIMARY_COLOR : subTextColor,
                        background: isCurrent
                          ? hexToRgba(PRIMARY_COLOR, 0.15)
                          : hexToRgba(isDark ? '#fff' : '#000', 0.05),
                        border: 'none',
                        fontWeight: 700,
                        borderRadius: 6,
                      }}
                    >
                      {level.rate}%
                    </Tag>
                  </Flex>
                  <Text
                    style={{
                      color: subTextColor,
                      fontSize: 13,
                      display: 'block',
                      marginTop: 6,
                    }}
                  >
                    {level.desc}
                  </Text>
                  {isCurrent && (
                    <Text
                      style={{
                        color: PRIMARY_COLOR,
                        fontSize: 13,
                        display: 'block',
                        marginTop: 8,
                      }}
                    >
                      ← 当前等级
                    </Text>
                  )}
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 我的客户 */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
        }}
        styles={{ body: { padding: 0 } }}
        title={
          <Flex align="center" gap={8} style={{ padding: '16px 20px 0' }}>
            <Title level={5} style={{ margin: 0 }}>
              我的客户
            </Title>
          </Flex>
        }
      >
        <Table<Customer>
          columns={customerColumns}
          dataSource={affInfo.customers}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: '暂无客户，快去分享推广链接吧！' }}
          pagination={
            affInfo.customers.length > 10
              ? { pageSize: 10, size: 'small' }
              : false
          }
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};
