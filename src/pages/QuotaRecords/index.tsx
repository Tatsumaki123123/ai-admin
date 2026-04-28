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
  DatePicker,
  Space,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { hexToRgba } from '../../theme/colors';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const QUOTA_UNIT = 500_000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuotaSummary {
  total_topup_amount: number;    // raw quota — cumulative top-up (online + redemption)
  total_topup_count: number;
  total_redemption_count: number;
  total_consume: number;         // raw quota — cumulative consumption
  current_quota: number;         // raw quota — current balance
}

/** Unified item — type 1 = topup/redemption, type 2 = consumption */
interface QuotaItem {
  type: number;
  time: number;           // unix timestamp
  date: string;           // "YYYY-MM-DD" or ISO string
  // type=1 fields
  trade_no?: string;
  payment_method?: string;
  topup_type?: string;    // "online" | "redemption"
  amount?: number;        // raw quota gained (type=1)
  money?: number;         // CNY paid (type=1, online only)
  // type=2 fields
  count?: number;
  quota?: number;         // raw quota consumed (type=2)
  tokens_used?: number;
}

interface QuotaResponse {
  summary: QuotaSummary;
  items: QuotaItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const QUOTA_UNIT_N = QUOTA_UNIT;

function toUsd(raw: number): number { return raw / QUOTA_UNIT_N; }

function fmtUsd(raw: number): string {
  const v = Math.abs(toUsd(raw));
  return v < 0.0001 ? `$${v.toFixed(6)}` : v < 0.01 ? `$${v.toFixed(4)}` : `$${v.toFixed(4)}`;
}

function fmtTokens(n: number | undefined | null): string {
  const v = n ?? 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

function fmtDate(item: QuotaItem): string {
  // date may be ISO "2026-04-28T00:00:00Z" or plain "2026-04-28"
  return item.date ? item.date.slice(0, 10) : dayjs.unix(item.time).format('YYYY-MM-DD');
}

const PAYMENT_LABEL: Record<string, string> = {
  wxpay: '微信支付',
  alipay: '支付宝',
  usdt: 'USDT',
  redemption: '兑换码',
  stripe: 'Stripe',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const QuotaRecordsPage = () => {
  usePageHeader({ title: '额度记录', description: '充值、兑换和消费的完整记录。' });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const navigate = useNavigate();

  const [summary, setSummary] = useState<QuotaSummary | null>(null);
  const [allItems, setAllItems] = useState<QuotaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('全部');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(90, 'day'),
    dayjs(),
  ]);

  const fetchData = useCallback(async (range = dateRange) => {
    setLoading(true);
    try {
      const data: QuotaResponse = await apiClient.get('/log/self/quota_records', {
        params: {
          type: 0, // always fetch all; filter client-side
          start_timestamp: range[0].unix(),
          end_timestamp: range[1].unix(),
        },
      });
      if (data) {
        setSummary(data.summary ?? null);
        setAllItems(data.items ?? []);
      }
    } catch { /* interceptor handles */ }
    finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtered items ──────────────────────────────────────────────────────────
  const items = allItems.filter((r) => {
    if (tab === '充值') return r.type === 1;
    if (tab === '消费') return r.type === 2;
    return true;
  });

  // ── Styles ──────────────────────────────────────────────────────────────────
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const sub = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const statCardStyle: React.CSSProperties = {
    background: cardBg, border: `1px solid ${borderColor}`,
    borderRadius: 12, padding: '20px 24px', height: '100%',
  };

  // ── Summary ─────────────────────────────────────────────────────────────────
  const totalTopup   = summary?.total_topup_amount ?? 0;
  const totalConsume = summary?.total_consume ?? 0;
  const currentQuota = summary?.current_quota ?? 0;
  const topupCount   = summary?.total_topup_count ?? 0;
  const redeemCount  = summary?.total_redemption_count ?? 0;
  const netUsd = toUsd(totalTopup - totalConsume);

  // ── Columns ─────────────────────────────────────────────────────────────────

  // Topup columns (type=1)
  const topupColumns: ColumnsType<QuotaItem> = [
    {
      title: '订单号',
      dataIndex: 'trade_no',
      key: 'trade_no',
      width: 220,
      ellipsis: true,
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{v ?? '—'}</Text>
      ),
    },
    {
      title: '商品',
      key: 'product',
      width: 110,
      render: (_: any, r: QuotaItem) => {
        const isRedeem = r.topup_type === 'redemption';
        return (
          <Tag style={{
            color: isRedeem ? '#1677ff' : '#52c41a',
            background: isRedeem ? 'rgba(22,119,255,0.1)' : 'rgba(82,196,26,0.1)',
            border: `1px solid ${isRedeem ? 'rgba(22,119,255,0.3)' : 'rgba(82,196,26,0.3)'}`,
            fontWeight: 600, borderRadius: 6,
          }}>
            {isRedeem ? '兑换码' : '充值额度'}
          </Tag>
        );
      },
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 110,
      render: (v: string) => <Text>{PAYMENT_LABEL[v] ?? v ?? '—'}</Text>,
    },
    {
      title: '支付金额',
      dataIndex: 'money',
      key: 'money',
      align: 'right' as const,
      width: 110,
      render: (v: number | undefined) =>
        v != null && v > 0
          ? <Text strong>¥{v.toFixed(2)}</Text>
          : <Text style={{ color: sub }}>—</Text>,
    },
    {
      title: '获得额度',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      width: 130,
      render: (v: number | undefined) =>
        v != null && v > 0
          ? <Text strong style={{ color: '#52c41a' }}>+{fmtUsd(v)}</Text>
          : <Text style={{ color: sub }}>—</Text>,
    },
    {
      title: '时间',
      key: 'time',
      width: 120,
      render: (_: any, r: QuotaItem) => (
        <Text style={{ color: sub }}>{fmtDate(r)}</Text>
      ),
    },
  ];

  // Consume columns (type=2)
  const consumeColumns: ColumnsType<QuotaItem> = [
    {
      title: '日期',
      key: 'date',
      width: 120,
      render: (_: any, r: QuotaItem) => <Text strong>{fmtDate(r)}</Text>,
    },
    {
      title: '请求数',
      dataIndex: 'count',
      key: 'count',
      align: 'right' as const,
      render: (v: number) => <Text>{(v ?? 0).toLocaleString()}</Text>,
    },
    {
      title: 'Token',
      dataIndex: 'tokens_used',
      key: 'tokens_used',
      align: 'right' as const,
      render: (v: number) => <Text>{fmtTokens(v)}</Text>,
    },
    {
      title: '消费',
      dataIndex: 'quota',
      key: 'quota',
      align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ color: '#fa8c16' }}>-{fmtUsd(v ?? 0)}</Text>
      ),
    },
  ];

  // All columns (mixed)
  const allColumns: ColumnsType<QuotaItem> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (v: number) => {
        const isTopup = v === 1;
        return (
          <Tag style={{
            color: isTopup ? '#52c41a' : '#fa8c16',
            background: isTopup ? 'rgba(82,196,26,0.12)' : 'rgba(250,140,22,0.12)',
            border: `1px solid ${isTopup ? 'rgba(82,196,26,0.3)' : 'rgba(250,140,22,0.3)'}`,
            fontWeight: 600, borderRadius: 6, padding: '2px 10px',
          }}>
            {isTopup ? '充值' : '消费'}
          </Tag>
        );
      },
    },
    {
      title: '详情',
      key: 'detail',
      width: 260,
      ellipsis: true,
      render: (_: any, r: QuotaItem) => {
        if (r.type === 1) {
          const isRedeem = r.topup_type === 'redemption';
          return (
            <Text style={{ color: sub }}>
              {isRedeem ? '兑换码充值' : (PAYMENT_LABEL[r.payment_method ?? ''] ?? r.payment_method)}
              {r.trade_no ? ` · ${r.trade_no.slice(0, 20)}…` : ''}
            </Text>
          );
        }
        return (
          <Text style={{ color: sub }}>
            {r.count ?? 0} 次请求 · {fmtTokens(r.tokens_used)} tok
          </Text>
        );
      },
    },
    {
      title: '金额',
      key: 'amount',
      align: 'right' as const,
      width: 140,
      render: (_: any, r: QuotaItem) => {
        if (r.type === 1) {
          return <Text strong style={{ color: '#52c41a' }}>+{fmtUsd(r.amount ?? 0)}</Text>;
        }
        return <Text strong style={{ color: '#fa8c16' }}>-{fmtUsd(r.quota ?? 0)}</Text>;
      },
    },
    {
      title: '时间',
      key: 'time',
      width: 130,
      render: (_: any, r: QuotaItem) => (
        <Text style={{ color: sub }}>{fmtDate(r)}</Text>
      ),
    },
  ];

  const isTopupTab   = tab === '充值';
  const isConsumeTab = tab === '消费';
  const tableColumns = isTopupTab ? topupColumns : isConsumeTab ? consumeColumns : allColumns;

  return (
    <div>
      {/* ── Header ── */}
      <Flex justify="flex-end" align="center" gap={8} style={{ marginBottom: 20 }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(v) => {
              if (v?.[0] && v?.[1]) {
                const r: [Dayjs, Dayjs] = [v[0], v[1]];
                setDateRange(r);
                fetchData(r);
              }
            }}
            allowClear={false}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading}>
            刷新
          </Button>
        </Space>
      </Flex>

      {/* ── Summary cards ── */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <div style={statCardStyle}>
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: sub, fontSize: 14 }}>累计充值</Text>
              <ArrowDownOutlined style={{ color: '#52c41a', fontSize: 18, opacity: 0.7 }} />
            </Flex>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <Text style={{ color: '#52c41a', fontSize: 28, fontWeight: 700 }}>
                +{fmtUsd(totalTopup)}
              </Text>
            </div>
            <Text style={{ color: sub, fontSize: 13 }}>
              {topupCount} 笔充值 + {redeemCount} 笔兑换
            </Text>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div style={statCardStyle}>
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: sub, fontSize: 14 }}>累计消费</Text>
              <ArrowUpOutlined style={{ color: '#fa8c16', fontSize: 18, opacity: 0.7 }} />
            </Flex>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <Text style={{ color: '#fa8c16', fontSize: 28, fontWeight: 700 }}>
                -{fmtUsd(totalConsume)}
              </Text>
            </div>
            <Text style={{ color: sub, fontSize: 13 }}>近 90 天按天聚合</Text>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div style={statCardStyle}>
            <Flex justify="space-between" align="flex-start">
              <Text style={{ color: sub, fontSize: 14 }}>净额度</Text>
            </Flex>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <Text style={{
                fontSize: 28, fontWeight: 700,
                color: netUsd >= 0 ? (isDark ? '#fff' : '#000') : '#ff4d4f',
              }}>
                {netUsd >= 0 ? '' : '-'}${Math.abs(netUsd).toFixed(2)}
              </Text>
            </div>
            <Text style={{ color: sub, fontSize: 13 }}>充值 - 消费</Text>
          </div>
        </Col>
      </Row>

      {/* ── Tab ── */}
      <div style={{ marginBottom: 16 }}>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v as string)}
          options={['全部', '充值', '消费']}
          style={{ background: hexToRgba(isDark ? '#fff' : '#000', 0.04) }}
        />
      </div>

      {/* ── Table ── */}
      <Card
        title={isConsumeTab ? '按日消费汇总' : undefined}
        extra={
          isConsumeTab ? (
            <Button
              type="link" size="small" icon={<LinkOutlined />}
              style={{ color: '#52c41a', padding: 0 }}
              onClick={() => navigate('/logs')}
            >
              查看每笔请求明细
            </Button>
          ) : undefined
        }
        style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<QuotaItem>
          columns={tableColumns}
          dataSource={items}
          rowKey={(r, i) => `${r.type}-${r.time}-${i}`}
          loading={loading}
          pagination={items.length > 20 ? { pageSize: 20, size: 'small' } : false}
          style={{ borderRadius: 12, overflow: 'hidden' }}
          locale={{ emptyText: '暂无记录' }}
          scroll={{ x: isTopupTab ? 800 : undefined }}
        />
      </Card>
    </div>
  );
};
