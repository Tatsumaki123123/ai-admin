import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Typography,
  Flex,
  Row,
  Col,
  Table,
  Tag,
  Empty,
} from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface CommissionSummary {
  total_commission: number;
  available: number;
  withdrawn: number;
  pending: number;
}

interface CommissionRecord {
  id: string;
  type: 'earned' | 'withdrawn' | 'pending';
  description: string;
  amount: number;
  created_time: number;
  order_no?: string;
}

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  earned: {
    label: '已入账',
    color: '#52c41a',
    bg: 'rgba(82,196,26,0.12)',
    border: 'rgba(82,196,26,0.3)',
    icon: <CheckCircleOutlined />,
  },
  pending: {
    label: '待结算',
    color: '#faad14',
    bg: 'rgba(250,173,20,0.12)',
    border: 'rgba(250,173,20,0.3)',
    icon: <ClockCircleOutlined />,
  },
  withdrawn: {
    label: '已提现',
    color: '#8c8c8c',
    bg: 'rgba(140,140,140,0.12)',
    border: 'rgba(140,140,140,0.3)',
    icon: <WalletOutlined />,
  },
};

const MOCK_SUMMARY: CommissionSummary = {
  total_commission: 0,
  available: 0,
  withdrawn: 0,
  pending: 0,
};

const formatDate = (ts: number) => {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
};

export const CommissionsPage = () => {
  usePageHeader({
    title: '佣金明细',
    description: '查看你的佣金收入和提现记录。',
  });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const navigate = useNavigate();

  const [summary, setSummary] = useState<CommissionSummary>(MOCK_SUMMARY);
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/user/commissions');
      if (data) {
        setSummary({ ...MOCK_SUMMARY, ...data.summary });
        setRecords(data.records ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const subTextColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const canWithdraw = summary.available >= 100;

  const statItems = [
    {
      label: '累计佣金',
      value: `¥${(summary.total_commission ?? 0).toFixed(2)}`,
      color: PRIMARY_COLOR,
      icon: <DollarOutlined style={{ color: subTextColor, fontSize: 18 }} />,
      sub: '历史总收入',
    },
    {
      label: '可提现',
      value: `¥${(summary.available ?? 0).toFixed(2)}`,
      color: '#52c41a',
      icon: <WalletOutlined style={{ color: subTextColor, fontSize: 18 }} />,
      sub: '满 ¥100 可提现',
    },
    {
      label: '待结算',
      value: `¥${(summary.pending ?? 0).toFixed(2)}`,
      color: '#faad14',
      icon: (
        <ClockCircleOutlined style={{ color: subTextColor, fontSize: 18 }} />
      ),
      sub: '订单确认后入账',
    },
    {
      label: '已提现',
      value: `¥${(summary.withdrawn ?? 0).toFixed(2)}`,
      color: subTextColor,
      icon: (
        <CheckCircleOutlined style={{ color: subTextColor, fontSize: 18 }} />
      ),
      sub: '历史累计提现',
    },
  ];

  const columns: ColumnsType<CommissionRecord> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (val: string) => {
        const cfg = TYPE_CONFIG[val] ?? TYPE_CONFIG.earned;
        return (
          <Tag
            icon={cfg.icon}
            style={{
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              fontWeight: 600,
              borderRadius: 6,
              padding: '2px 10px',
            }}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      render: (val: string, record) => (
        <Flex vertical gap={2}>
          <Text>{val}</Text>
          {record.order_no && (
            <Text
              style={{
                color: subTextColor,
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              订单号: {record.order_no}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 120,
      render: (val: number, record) => {
        const cfg = TYPE_CONFIG[record.type] ?? TYPE_CONFIG.earned;
        return (
          <Text
            strong
            style={{
              color: record.type === 'withdrawn' ? subTextColor : cfg.color,
            }}
          >
            {record.type === 'withdrawn' ? '-' : '+'}¥{(val ?? 0).toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: '时间',
      dataIndex: 'created_time',
      key: 'created_time',
      width: 130,
      render: (val: number) => (
        <Text style={{ color: subTextColor }}>{formatDate(val)}</Text>
      ),
    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {statItems.map((item) => (
          <Col key={item.label} xs={24} sm={12} md={6}>
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
                  {item.label}
                </Text>
                {item.icon}
              </Flex>
              <div style={{ marginTop: 10 }}>
                <Text
                  style={{ color: item.color, fontSize: 24, fontWeight: 700 }}
                >
                  {item.value}
                </Text>
              </div>
              <Text style={{ color: subTextColor, fontSize: 12 }}>
                {item.sub}
              </Text>
            </div>
          </Col>
        ))}
      </Row>

      {/* Withdraw action */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              申请提现
            </Title>
            <Text style={{ color: subTextColor, fontSize: 13 }}>
              {canWithdraw
                ? `当前可提现 ¥${(summary.available ?? 0).toFixed(
                    2
                  )}，联系管理员发起提现申请`
                : `佣金余额不足 ¥100，暂不可提现（当前：¥${(
                    summary.available ?? 0
                  ).toFixed(2)}）`}
            </Text>
          </div>
          <Flex gap={12} wrap="wrap">
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
              申请提现
            </Button>
            <Button
              style={{ borderRadius: 8 }}
              onClick={() => navigate('/distribution')}
            >
              返回分销中心
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Records table */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<CommissionRecord>
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text style={{ color: subTextColor }}>
                    暂无佣金记录，邀请好友购买后即可获得佣金
                  </Text>
                }
              />
            ),
          }}
          pagination={
            records.length > 10 ? { pageSize: 10, size: 'small' } : false
          }
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};
