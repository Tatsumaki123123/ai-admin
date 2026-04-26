import { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Col,
  Flex,
  Row,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ApiOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useSelector } from 'react-redux';

import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import type { RootState } from '../../redux/store';

const { Text } = Typography;

// ── Types ─────────────────────────────────────────────────────────────────────

interface LogItem {
  id: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: string;
  latencyMs: number;
  firstTokenMs: number | null;
  userAgent: string;
  createdAt: string; // ISO string
  keyPrefix: string;
}

interface LogSummary {
  totalRequests: number;
  totalCost: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgLatency: number;
}

interface UsageResponse {
  logs: LogItem[];
  summary: LogSummary;
}

interface ApiKeyOption {
  id: number;
  name: string;
  key: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS_OPTIONS = [
  { label: '近 7 天', value: 7 },
  { label: '近 30 天', value: 30 },
  { label: '近 90 天', value: 90 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatLatency(ms: number | null) {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatCost(usd: string | number) {
  const n = typeof usd === 'string' ? parseFloat(usd) : usd;
  if (isNaN(n)) return '—';
  return `$${n.toFixed(4)}`;
}

function getUAInfo(ua: string): { label: string; color: string; bg: string } | null {
  if (!ua) return null;
  if (/claude/i.test(ua)) return { label: 'Claude Code', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' };
  if (/cursor/i.test(ua)) return { label: 'Cursor', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' };
  if (/vscode/i.test(ua)) return { label: 'VSCode', color: '#0078d4', bg: 'rgba(0,120,212,0.12)' };
  if (/openai/i.test(ua)) return { label: 'OpenAI SDK', color: '#10a37f', bg: 'rgba(16,163,127,0.12)' };
  if (/python/i.test(ua)) return { label: 'Python', color: '#3776ab', bg: 'rgba(55,118,171,0.12)' };
  if (/node/i.test(ua)) return { label: 'Node.js', color: '#68a063', bg: 'rgba(104,160,99,0.12)' };
  if (/axios/i.test(ua)) return { label: 'Axios', color: '#5a29e4', bg: 'rgba(90,41,228,0.12)' };
  const short = ua.split('/')[0].split(' ')[0].slice(0, 12);
  return { label: short || '其他', color: '#888', bg: 'rgba(128,128,128,0.1)' };
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  iconColor,
  isDark,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string | null;
  icon: React.ReactNode;
  iconColor: string;
  isDark: boolean;
}) {
  const bg = isDark ? '#1a1a1a' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#eaecf0';
  const subColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: '18px 22px',
        height: '100%',
      }}
    >
      <Flex justify="space-between" align="flex-start">
        <Text style={{ color: subColor, fontSize: 13 }}>{label}</Text>
        <span style={{ color: iconColor, fontSize: 18, opacity: 0.75 }}>{icon}</span>
      </Flex>
      <div style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{value}</Text>
      </div>
      {sub && (
        <Text style={{ color: subColor, fontSize: 12, marginTop: 4, display: 'block' }}>
          {sub}
        </Text>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const LogsPage = () => {
  usePageHeader({
    title: '使用记录',
    description: '查看每次 API 调用的请求数、Token 消耗和费用明细。',
  });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#eaecf0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const sub = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';

  // ── State ────────────────────────────────────────────────────────────────────
  const [days, setDays] = useState<number>(7);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyOption[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Fetch API keys for selector ───────────────────────────────────────────
  const fetchApiKeys = useCallback(async () => {
    try {
      const items: ApiKeyOption[] = ((await apiClient.get('/token', {
        params: { p: 1, size: 100, show_key: true },
      }))?.items || []).map((k: any) => ({
        id: k.id,
        name: k.name,
        key: k.key,
      }));
      setApiKeys(items);
      if (items.length > 0 && selectedKeyId === null) {
        setSelectedKeyId(items[0].id);
      }
    } catch {
      /* ignore */
    }
  }, []); // eslint-disable-line

  // ── Fetch logs ────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(
    async (keyId: number | null = selectedKeyId, d: number = days) => {
      if (keyId === null) return;
      setLoading(true);
      try {
        const data = await apiClient.get<UsageResponse>('/token/usage', {
          params: { days: d, keyId },
        });
        setLogs(data?.logs || []);
        setSummary(data?.summary || null);
      } catch {
        setLogs([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedKeyId, days],
  );

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  useEffect(() => {
    if (selectedKeyId !== null) fetchLogs(selectedKeyId, days);
  }, [selectedKeyId, days]); // eslint-disable-line

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ['时间', 'API密钥前缀', '模型', '输入Token', '输出Token', '费用', '延迟', 'User-Agent'];
    const rows = logs.map((r) => [
      formatDateTime(r.createdAt),
      r.keyPrefix,
      r.model,
      r.inputTokens,
      r.outputTokens,
      formatCost(r.costUsd),
      formatLatency(r.latencyMs),
      r.userAgent,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: ColumnsType<LogItem> = [
    {
      title: 'API 密钥',
      dataIndex: 'keyPrefix',
      key: 'keyPrefix',
      width: 140,
      render: (val: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {val || '—'}
        </Text>
      ),
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      width: 160,
      render: (val: string) => (
        <Text style={{ color: val === 'unknown' ? sub : undefined, fontSize: 13 }}>
          {val || '—'}
        </Text>
      ),
    },
    {
      title: 'Token',
      key: 'tokens',
      width: 100,
      align: 'right' as const,
      render: (_, r) => {
        const total = r.inputTokens + r.outputTokens;
        return <Text>{total > 0 ? total.toLocaleString() : <span style={{ color: sub }}>0</span>}</Text>;
      },
    },
    {
      title: '费用',
      dataIndex: 'costUsd',
      key: 'costUsd',
      width: 100,
      align: 'right' as const,
      render: (val: string) => {
        const n = parseFloat(val);
        return (
          <Text style={{ color: n > 0 ? '#fa8c16' : sub }}>
            {formatCost(val)}
          </Text>
        );
      },
    },
    {
      title: '⚡ 首Token',
      key: 'firstToken',
      width: 110,
      align: 'center' as const,
      render: (_, r) => (
        <Text style={{ color: sub, fontSize: 12 }}>
          {r.firstTokenMs !== null ? formatLatency(r.firstTokenMs) : '—'}
        </Text>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'latencyMs',
      key: 'latencyMs',
      width: 80,
      align: 'right' as const,
      render: (val: number) => (
        <Text style={{ color: sub, fontSize: 12 }}>{formatLatency(val)}</Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (val: string) => (
        <Text style={{ color: sub, fontSize: 12 }}>{formatDateTime(val)}</Text>
      ),
    },
    {
      title: 'User-Agent',
      dataIndex: 'userAgent',
      key: 'userAgent',
      width: 130,
      render: (val: string) => {
        const info = getUAInfo(val);
        if (!info) return <Text style={{ color: sub }}>—</Text>;
        return (
          <Tooltip title={val}>
            <Tag
              style={{
                background: info.bg,
                border: `1px solid ${info.color}44`,
                color: info.color,
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 12,
                cursor: 'default',
              }}
            >
              {info.label}
            </Tag>
          </Tooltip>
        );
      },
    },
  ];

  // ── Key selector options ──────────────────────────────────────────────────
  const keyOptions = apiKeys.map((k) => ({
    label: `${k.name} · ${k.key.startsWith('sk-') ? k.key.slice(0, 14) : 'sk-' + k.key.slice(0, 10)}...`,
    value: k.id,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label="总请求数"
            value={summary?.totalRequests ?? 0}
            icon={<ApiOutlined />}
            iconColor="#1677ff"
            isDark={isDark}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label="总 Token"
            value={(
              (summary?.totalInputTokens ?? 0) + (summary?.totalOutputTokens ?? 0)
            ).toLocaleString()}
            sub={`输入 ${summary?.totalInputTokens ?? 0} / 输出 ${summary?.totalOutputTokens ?? 0}`}
            icon={<ThunderboltOutlined />}
            iconColor="#faad14"
            isDark={isDark}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label="总消费"
            value={formatCost(summary?.totalCost ?? '0')}
            icon={<DollarOutlined />}
            iconColor="#52c41a"
            isDark={isDark}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label="平均耗时"
            value={formatLatency(summary?.avgLatency ?? null)}
            icon={<ClockCircleOutlined />}
            iconColor="#eb2f96"
            isDark={isDark}
          />
        </Col>
      </Row>

      {/* ── Table card ─────────────────────────────────────────────────────── */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* toolbar */}
        <Flex
          align="center"
          gap={10}
          wrap="wrap"
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${border}`,
          }}
        >
          <Select
            value={selectedKeyId}
            onChange={(v) => setSelectedKeyId(v)}
            options={keyOptions}
            style={{ width: 220 }}
            placeholder="选择 API 密钥"
            loading={apiKeys.length === 0}
          />
          <Select
            value={days}
            onChange={(v) => setDays(v)}
            options={DAYS_OPTIONS}
            style={{ width: 120 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchLogs(selectedKeyId, days)}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            disabled={!logs.length}
          >
            导出 CSV
          </Button>
        </Flex>

        {/* table */}
        <Table<LogItem>
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 20,
            size: 'small',
            showTotal: (total) => `共 ${total} 条`,
            style: { padding: '12px 20px' },
          }}
        />
      </div>
    </div>
  );
};
