import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Select,
  Flex,
  Spin,
  Typography,
  Tooltip,
  Button,
} from 'antd';
import {
  KeyOutlined,
  DollarOutlined,
  FileTextOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  UserOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Pie, Line } from '@ant-design/charts';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useTranslation } from 'react-i18next';
import { usePageHeader } from '../hooks/usePageContext';
import { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../services/api/apiClient';
import { API_ENDPOINTS } from '../services/api/endpoints';

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSelf {
  id: number;
  username: string;
  display_name: string;
  email: string;
  role: number;
  quota: number;
  used_quota: number;
  request_count: number;
  aff_code: string;
  aff_count: number;
  aff_quota: number;
  group: string;
}

interface DataSelfItem {
  id: number;
  user_id: number;
  username: string;
  model_name: string;
  created_at: number;
  token_used: number;
  count: number;
  quota: number;
}

type TimeRange = '24h' | '7d' | '30d';
type Granularity = 'hour' | 'day';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** new-api stores quota as integer; 1 USD = 500,000 units */
const QUOTA_UNIT = 500_000;

function quotaToUsd(quota: number): string {
  return (quota / QUOTA_UNIT).toFixed(4);
}

function quotaToUsdShort(quota: number): string {
  const v = quota / QUOTA_UNIT;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  if (v >= 1) return `$${v.toFixed(2)}`;
  return `$${v.toFixed(4)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getTimeRange(range: TimeRange): { start: number; end: number; defaultTime: Granularity } {
  const end = Math.floor(Date.now() / 1000);
  const map: Record<TimeRange, number> = {
    '24h': 86400,
    '7d': 86400 * 7,
    '30d': 86400 * 30,
  };
  const granularity: Record<TimeRange, Granularity> = {
    '24h': 'hour',
    '7d': 'day',
    '30d': 'day',
  };
  return { start: end - map[range], end, defaultTime: granularity[range] };
}

function formatTimestamp(ts: number, granularity: Granularity): string {
  const d = new Date(ts * 1000);
  if (granularity === 'hour') {
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`;
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  isDark: boolean;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, iconColor, isDark, loading,
}) => (
  <Card
    style={{
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#EAECF0'}`,
      boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
      background: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: 12,
    }}
    hoverable
  >
    <Flex gap="middle" align="flex-start">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 10,
          background: isDark ? `${iconColor}22` : `${iconColor}15`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 20, color: iconColor }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8', marginBottom: 4, fontWeight: 500 }}>
          {title}
        </div>
        {loading ? (
          <Spin size="small" />
        ) : (
          <div style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 2 }}>
            {value}
          </div>
        )}
        <div style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.28)' : '#94a3b8' }}>{subtitle}</div>
      </div>
    </Flex>
  </Card>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  usePageHeader({
    title: t('dashboard.title'),
    description: t('dashboard.subtitle'),
  });

  // ── State ──────────────────────────────────────────────────────────────────
  const [userInfo, setUserInfo] = useState<UserSelf | null>(null);
  const [dataItems, setDataItems] = useState<DataSelfItem[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [granularity, setGranularity] = useState<Granularity>('hour');

  // ── Fetch user/self ────────────────────────────────────────────────────────
  const fetchUser = useCallback(async () => {
    setUserLoading(true);
    try {
      const data = await apiRequest.get<UserSelf>(API_ENDPOINTS.PROFILE.SELF);
      setUserInfo(data as any);
    } catch {
      // silently fail — user stays null
    } finally {
      setUserLoading(false);
    }
  }, []);

  // ── Fetch data/self ────────────────────────────────────────────────────────
  const fetchData = useCallback(async (range: TimeRange, gran: Granularity) => {
    setDataLoading(true);
    try {
      const { start, end } = getTimeRange(range);
      const items = await apiRequest.get<DataSelfItem[]>(
        `${API_ENDPOINTS.DATA.SELF}?start_timestamp=${start}&end_timestamp=${end}&default_time=${gran}`
      );
      setDataItems(Array.isArray(items) ? items : []);
    } catch {
      setDataItems([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { fetchData(timeRange, granularity); }, [fetchData, timeRange, granularity]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const balance = userInfo ? quotaToUsdShort(userInfo.quota) : '—';
  const usedQuota = userInfo ? quotaToUsdShort(userInfo.used_quota) : '—';
  const requestCount = userInfo ? userInfo.request_count.toLocaleString() : '—';

  const totalTokens = dataItems.reduce((s, d) => s + d.token_used, 0);
  const totalCalls = dataItems.reduce((s, d) => s + d.count, 0);
  const totalQuota = dataItems.reduce((s, d) => s + d.quota, 0);

  // ── Pie chart: model distribution by quota ─────────────────────────────────
  const modelQuotaMap: Record<string, number> = {};
  dataItems.forEach((d) => {
    modelQuotaMap[d.model_name] = (modelQuotaMap[d.model_name] ?? 0) + d.quota;
  });
  const pieData = Object.entries(modelQuotaMap)
    .map(([model, quota]) => ({ model, quota, cost: Number(quotaToUsd(quota)) }))
    .sort((a, b) => b.quota - a.quota);

  // ── Line chart: token trend over time ──────────────────────────────────────
  // Group by timestamp bucket
  const trendMap: Record<number, { tokens: number; cost: number }> = {};
  dataItems.forEach((d) => {
    const bucket = d.created_at;
    if (!trendMap[bucket]) trendMap[bucket] = { tokens: 0, cost: 0 };
    trendMap[bucket].tokens += d.token_used;
    trendMap[bucket].cost += d.quota / QUOTA_UNIT;
  });
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .flatMap(([ts, v]) => [
      { time: formatTimestamp(Number(ts), granularity), type: 'Token 用量', value: v.tokens },
    ]);

  // ── Table: model breakdown ─────────────────────────────────────────────────
  const tableData = pieData.map((row, i) => ({
    key: i,
    model: row.model,
    cost: `$${row.cost.toFixed(4)}`,
    tokens: formatTokens(
      dataItems.filter((d) => d.model_name === row.model).reduce((s, d) => s + d.token_used, 0)
    ),
    calls: dataItems.filter((d) => d.model_name === row.model).reduce((s, d) => s + d.count, 0),
    pct: totalQuota > 0 ? ((row.quota / totalQuota) * 100).toFixed(1) + '%' : '0%',
  }));

  // ── Chart config ───────────────────────────────────────────────────────────
  const pieConfig = {
    data: pieData,
    angleField: 'quota',
    colorField: 'model',
    radius: 0.85,
    innerRadius: 0.6,
    label: false as any,
    legend: { position: 'bottom' as any, flipPage: false },
    tooltip: {
      formatter: (d: any) => ({ name: d.model, value: `$${(d.quota / QUOTA_UNIT).toFixed(4)}` }),
    },
    theme: isDark ? 'dark' : 'default',
    background: 'transparent',
    statistic: {
      title: { content: '总消费', style: { color: isDark ? '#fff' : '#000', fontSize: '14px' } },
      content: {
        content: `$${(totalQuota / QUOTA_UNIT).toFixed(4)}`,
        style: { color: isDark ? '#fff' : '#000', fontSize: '16px', fontWeight: 700 },
      },
    },
  };

  const lineConfig = {
    data: trendData,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    point: { size: 3 },
    legend: { position: 'top-right' as any },
    tooltip: { formatter: (d: any) => ({ name: d.type, value: formatTokens(d.value) }) },
    theme: isDark ? 'dark' : 'default',
    background: 'transparent',
    xAxis: { label: { autoRotate: true, autoHide: true } },
    yAxis: { label: { formatter: (v: string) => formatTokens(Number(v)) } },
  };

  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#EAECF0';
  const cardBg = isDark ? '#1e1e1e' : '#ffffff';
  const cardStyle = {
    border: `1px solid ${cardBorder}`,
    boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
    background: cardBg,
    borderRadius: 12,
  };

  return (
    <>
      {/* ── Stat cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: '账户余额',
            value: balance,
            subtitle: '可用额度',
            icon: <DollarOutlined />,
            color: '#52c41a',
          },
          {
            title: '累计消费',
            value: usedQuota,
            subtitle: '历史总消费',
            icon: <RiseOutlined />,
            color: '#f5222d',
          },
          {
            title: '总请求数',
            value: requestCount,
            subtitle: '历史累计',
            icon: <ThunderboltOutlined />,
            color: '#1890ff',
          },
          {
            title: '周期消费',
            value: totalQuota > 0 ? `$${(totalQuota / QUOTA_UNIT).toFixed(4)}` : '$0.0000',
            subtitle: '所选时间范围',
            icon: <FileTextOutlined />,
            color: '#faad14',
          },
          {
            title: '周期 Token',
            value: formatTokens(totalTokens),
            subtitle: '所选时间范围',
            icon: <BarChartOutlined />,
            color: '#13c2c2',
          },
          {
            title: '周期调用',
            value: totalCalls.toLocaleString(),
            subtitle: '所选时间范围',
            icon: <KeyOutlined />,
            color: '#722ed1',
          },
          {
            title: '用户名',
            value: userInfo?.display_name || userInfo?.username || '—',
            subtitle: `分组: ${userInfo?.group || '—'}`,
            icon: <UserOutlined />,
            color: '#eb2f96',
          },
          {
            title: '邀请码',
            value: userInfo?.aff_code || '—',
            subtitle: `已邀请 ${userInfo?.aff_count ?? 0} 人`,
            icon: <DollarOutlined />,
            color: '#fa8c16',
          },
        ].map((card, i) => (
          <Col key={i} xs={24} sm={12} md={8} lg={6}>
            <StatCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              iconColor={card.color}
              isDark={isDark}
              loading={userLoading && i < 3}
            />
          </Col>
        ))}
      </Row>

      {/* ── Time range / granularity controls ── */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={12}
        style={{
          marginBottom: 20,
          padding: '12px 16px',
          background: cardBg,
          borderRadius: 8,
          border: `1px solid ${cardBorder}`,
        }}
      >
        <Space wrap>
          <Text style={{ fontSize: 14 }}>时间范围:</Text>
          <Select
            value={timeRange}
            style={{ width: 110 }}
            onChange={(v: TimeRange) => {
              setTimeRange(v);
              // auto-set sensible granularity
              setGranularity(v === '24h' ? 'hour' : 'day');
            }}
            options={[
              { label: '近 24 小时', value: '24h' },
              { label: '近 7 天', value: '7d' },
              { label: '近 30 天', value: '30d' },
            ]}
          />
          <Text style={{ fontSize: 14 }}>粒度:</Text>
          <Select
            value={granularity}
            style={{ width: 90 }}
            onChange={(v: Granularity) => setGranularity(v)}
            options={[
              { label: '按小时', value: 'hour' },
              { label: '按天', value: 'day' },
            ]}
          />
        </Space>
        <Tooltip title="刷新数据">
          <Button
            icon={<ReloadOutlined />}
            loading={dataLoading}
            onClick={() => fetchData(timeRange, granularity)}
          >
            刷新
          </Button>
        </Tooltip>
      </Flex>

      {/* ── Charts ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={10}>
          <Card title="模型消费分布" style={cardStyle}>
            {dataLoading ? (
              <Flex justify="center" align="center" style={{ height: 280 }}>
                <Spin />
              </Flex>
            ) : pieData.length === 0 ? (
              <Flex justify="center" align="center" style={{ height: 280, color: isDark ? '#595959' : '#bfbfbf' }}>
                暂无数据
              </Flex>
            ) : (
              <Pie {...pieConfig} height={280} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Token 用量趋势" style={cardStyle}>
            {dataLoading ? (
              <Flex justify="center" align="center" style={{ height: 280 }}>
                <Spin />
              </Flex>
            ) : trendData.length === 0 ? (
              <Flex justify="center" align="center" style={{ height: 280, color: isDark ? '#595959' : '#bfbfbf' }}>
                暂无数据
              </Flex>
            ) : (
              <Line {...lineConfig} height={280} />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Model breakdown table ── */}
      <Card
        title="模型用量明细"
        extra={
          <Text style={{ fontSize: 12, color: isDark ? '#8c8c8c' : '#999' }}>
            {timeRange === '24h' ? '近 24 小时' : timeRange === '7d' ? '近 7 天' : '近 30 天'}
          </Text>
        }
        style={cardStyle}
      >
        <Table
          dataSource={tableData}
          loading={dataLoading}
          pagination={false}
          size="small"
          columns={[
            {
              title: '模型',
              dataIndex: 'model',
              key: 'model',
              render: (v: string) => (
                <Tag
                  style={{
                    borderRadius: 20,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    maxWidth: 220,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {v}
                </Tag>
              ),
            },
            {
              title: '消费',
              dataIndex: 'cost',
              key: 'cost',
              align: 'right' as const,
              render: (v: string) => <Text style={{ fontFamily: 'monospace' }}>{v}</Text>,
            },
            {
              title: 'Token',
              dataIndex: 'tokens',
              key: 'tokens',
              align: 'right' as const,
            },
            {
              title: '调用次数',
              dataIndex: 'calls',
              key: 'calls',
              align: 'right' as const,
              render: (v: number) => v.toLocaleString(),
            },
            {
              title: '占比',
              dataIndex: 'pct',
              key: 'pct',
              align: 'right' as const,
              render: (v: string) => (
                <Text style={{ color: '#1890ff', fontWeight: 600 }}>{v}</Text>
              ),
            },
          ]}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>
    </>
  );
};
