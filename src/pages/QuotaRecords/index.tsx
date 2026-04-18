import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Segmented,
  Typography,
  Table,
  Tag,
  Flex,
  Row,
  Col,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { hexToRgba } from '../../theme/colors';

const { Text } = Typography;

interface QuotaSummary {
  total_recharge: number;
  recharge_count: number;
  redeem_count: number;
  total_consumption: number;
  net_quota: number;
}

interface QuotaRecord {
  id: string;
  type: 'recharge' | 'redeem' | 'consumption';
  detail: string;
  amount: number;
  created_time: number;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  recharge: {
    label: '充值',
    color: '#52c41a',
    bg: 'rgba(82,196,26,0.12)',
    border: 'rgba(82,196,26,0.3)',
  },
  redeem: {
    label: '兑换',
    color: '#1677ff',
    bg: 'rgba(22,119,255,0.12)',
    border: 'rgba(22,119,255,0.3)',
  },
  consumption: {
    label: '消费',
    color: '#fa8c16',
    bg: 'rgba(250,140,22,0.12)',
    border: 'rgba(250,140,22,0.3)',
  },
};

const formatDate = (ts: number) => {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatAmount = (amount: number) => {
  const abs = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '-';
  if (abs < 0.001) return `${sign}$${abs.toFixed(6)}`;
  if (abs < 1) return `${sign}$${abs.toFixed(4)}`;
  return `${sign}$${abs.toFixed(2)}`;
};

export const QuotaRecordsPage = () => {
  usePageHeader({
    title: '额度记录',
    description: '充值、兑换和消费的完整记录。',
  });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [summary, setSummary] = useState<QuotaSummary | null>(null);
  const [records, setRecords] = useState<QuotaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('全部');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/user/quota/records');
      if (data) {
        setSummary(data.summary);
        setRecords(data.records);
      }
    } catch {
      /* global interceptor handles */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRecords = records.filter((r) => {
    if (tab === '全部') return true;
    if (tab === '充值') return r.type === 'recharge' || r.type === 'redeem';
    if (tab === '消费') return r.type === 'consumption';
    return true;
  });

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const subTextColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const totalRecharge = summary?.total_recharge ?? 0;
  const totalConsumption = summary?.total_consumption ?? 0;
  const netQuota = summary?.net_quota ?? 0;

  const statCardStyle: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${borderColor}`,
    borderRadius: 12,
    padding: '20px 24px',
    height: '100%',
  };

  const columns: ColumnsType<QuotaRecord> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (val: string) => {
        const cfg = TYPE_CONFIG[val] ?? TYPE_CONFIG.consumption;
        return (
          <Tag
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
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      render: (val: string) => <Text>{val}</Text>,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 140,
      render: (val: number) => (
        <Text
          strong
          style={{
            color: val >= 0 ? '#52c41a' : '#fa8c16',
            letterSpacing: 0.5,
          }}
        >
          {formatAmount(val)}
        </Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_time',
      key: 'created_time',
      width: 140,
      render: (val: number) => (
        <Text style={{ color: subTextColor }}>{formatDate(val)}</Text>
      ),
    },
  ];

  return (
    <div>
      {/* Header action */}
      <Flex justify="flex-end" style={{ marginBottom: 20 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
          刷新
        </Button>
      </Flex>

      {/* Summary cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {/* 累计充值 */}
        <Col xs={24} sm={8}>
          <div style={statCardStyle}>
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: subTextColor, fontSize: 14 }}>
                累计充值
              </Text>
              <ArrowDownOutlined
                style={{ color: '#52c41a', fontSize: 18, opacity: 0.7 }}
              />
            </Flex>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <Text style={{ color: '#52c41a', fontSize: 24, fontWeight: 700 }}>
                +${totalRecharge.toFixed(2)}
              </Text>
            </div>
            <Text style={{ color: subTextColor, fontSize: 13 }}>
              {summary?.recharge_count ?? 0} 笔充值 +{' '}
              {summary?.redeem_count ?? 0} 笔兑换
            </Text>
          </div>
        </Col>

        {/* 累计消费 */}
        <Col xs={24} sm={8}>
          <div style={statCardStyle}>
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: subTextColor, fontSize: 14 }}>
                累计消费
              </Text>
              <ArrowUpOutlined
                style={{ color: '#fa8c16', fontSize: 18, opacity: 0.7 }}
              />
            </Flex>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <Text style={{ color: '#fa8c16', fontSize: 24, fontWeight: 700 }}>
                {totalConsumption > 0
                  ? `-$${totalConsumption.toFixed(4)}`
                  : `-$${Math.abs(0).toFixed(4)}`}
              </Text>
            </div>
            <Text style={{ color: subTextColor, fontSize: 13 }}>
              近 30 天按天聚合
            </Text>
          </div>
        </Col>

        {/* 净额度 */}
        <Col xs={24} sm={8}>
          <div style={statCardStyle}>
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: subTextColor, fontSize: 14 }}>净额度</Text>
            </Flex>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                ${Math.abs(netQuota).toFixed(2)}
              </Text>
            </div>
            <Text style={{ color: subTextColor, fontSize: 13 }}>
              充值 - 消费
            </Text>
          </div>
        </Col>
      </Row>

      {/* Tab filter */}
      <div style={{ marginBottom: 16 }}>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v as string)}
          options={['全部', '充值', '消费']}
          style={{ background: hexToRgba(isDark ? '#fff' : '#000', 0.04) }}
        />
      </div>

      {/* Records table */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<QuotaRecord>
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={
            filteredRecords.length > 10
              ? { pageSize: 10, size: 'small' }
              : false
          }
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};
