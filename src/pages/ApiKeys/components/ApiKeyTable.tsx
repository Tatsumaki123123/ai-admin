import {
  Table,
  Tag,
  Button,
  Tooltip,
  Popconfirm,
  Typography,
  Flex,
  Space,
  Switch,
} from 'antd';
import {
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CodeOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { ApiKeyItem, GroupInfo } from '../types';

const { Text } = Typography;

interface Props {
  dataSource: ApiKeyItem[];
  loading: boolean;
  pagination: TablePaginationConfig;
  visibleKeys: Set<number>;
  groups: Record<string, GroupInfo>;
  isDark: boolean;
  onToggleVisibility: (id: number) => void;
  onCopyKey: (key: string) => void;
  onEdit: (record: ApiKeyItem) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (record: ApiKeyItem) => void;
  onUseKey: (record: ApiKeyItem) => void;
  onImportCSS: (record: ApiKeyItem) => void;
  onChange: (pg: TablePaginationConfig) => void;
}

function formatDateTime(ts: number) {
  if (!ts || ts <= 0) return null;
  const d = new Date(ts * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getExpiryInfo(ts: number): { label: string; color: string } {
  if (!ts || ts <= 0) return { label: '永不过期', color: '#52c41a' };
  const days = Math.ceil((ts - Date.now() / 1000) / 86400);
  if (days < 0) return { label: '已过期', color: '#ff4d4f' };
  if (days <= 7) return { label: `${days}天后过期`, color: '#faad14' };
  return { label: `${days}天后过期`, color: '#52c41a' };
}

function withPrefix(key: string) {
  if (!key) return '';
  return key.startsWith('sk-') ? key : `sk-${key}`;
}

function maskKey(key: string, visible: boolean) {
  if (!key) return '—';
  const full = withPrefix(key);
  if (visible) return full;
  const prefix = full.slice(0, 10);
  const suffix = full.slice(-4);
  return `${prefix}...${suffix}`;
}

// Pastel color palette for group tags (cycles by hash)
const GROUP_COLORS = [
  { bg: 'rgba(22,119,255,0.1)', border: 'rgba(22,119,255,0.3)', text: '#1677ff' },
  { bg: 'rgba(114,46,209,0.1)', border: 'rgba(114,46,209,0.3)', text: '#722ed1' },
  { bg: 'rgba(19,194,194,0.1)', border: 'rgba(19,194,194,0.3)', text: '#13c2c2' },
  { bg: 'rgba(250,140,22,0.1)', border: 'rgba(250,140,22,0.3)', text: '#fa8c16' },
  { bg: 'rgba(235,47,150,0.1)', border: 'rgba(235,47,150,0.3)', text: '#eb2f96' },
];

function groupColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return GROUP_COLORS[h % GROUP_COLORS.length];
}

export function ApiKeyTable({
  dataSource,
  loading,
  pagination,
  visibleKeys,
  groups,
  isDark,
  onToggleVisibility,
  onCopyKey,
  onEdit,
  onDelete,
  onToggleStatus,
  onUseKey,
  onImportCSS,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const sub = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const mono: React.CSSProperties = { fontFamily: 'monospace', fontSize: 12 };

  const columns: ColumnsType<ApiKeyItem> = [
    // ── Name ────────────────────────────────────────────────────────────────
    {
      title: <span style={{ paddingLeft: 8 }}>名称</span>,
      key: 'name',
      width: 170,
      fixed: 'left',
      render: (_, r) => (
        <div style={{ lineHeight: 1.4, paddingLeft: 8 }}>
          <Text strong style={{ fontSize: 14, display: 'block' }}>
            {r.name}
          </Text>
          <Text style={{ color: sub, fontSize: 11 }}>
            创建于 {formatDateTime(r.created_time) ?? '—'}
          </Text>
        </div>
      ),
    },

    // ── API Key ──────────────────────────────────────────────────────────────
    {
      title: 'API 密钥',
      key: 'key',
      width: 230,
      render: (_, r) => {
        const isVisible = visibleKeys.has(r.id);
        return (
          <Flex
            align="center"
            gap={4}
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : '#f7f8fa',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e6ed'}`,
              borderRadius: 6,
              padding: '4px 8px',
            }}
          >
            <Text style={{ ...mono, flex: 1, color: isDark ? '#c9d1d9' : '#444' }}>
              {maskKey(r.key, isVisible)}
            </Text>
            <Tooltip title={isVisible ? '隐藏' : '显示'}>
              <Button
                type="text"
                size="small"
                icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                style={{ color: sub, flexShrink: 0 }}
                onClick={() => onToggleVisibility(r.id)}
              />
            </Tooltip>
            <Tooltip title="复制密钥">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                style={{ color: sub, flexShrink: 0 }}
                onClick={() => onCopyKey(withPrefix(r.key))}
              />
            </Tooltip>
          </Flex>
        );
      },
    },

    // ── Group ────────────────────────────────────────────────────────────────
    {
      title: '分组',
      key: 'group',
      width: 180,
      render: (_, r) => {
        if (!r.group) return <Text style={{ color: sub }}>—</Text>;
        const info = groups[r.group];
        const c = groupColor(r.group);
        return (
          <div style={{ lineHeight: 1.5 }}>
            <Flex align="center" gap={6} style={{ flexWrap: 'wrap' }}>
              <Tag
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  color: c.text,
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 12,
                  margin: 0,
                  padding: '1px 8px',
                }}
              >
                {r.group}
              </Tag>
              {info?.ratio !== undefined && (
                <Tag
                  style={{
                    background: 'rgba(82,196,26,0.1)',
                    border: '1px solid rgba(82,196,26,0.3)',
                    color: '#52c41a',
                    borderRadius: 6,
                    fontSize: 11,
                    margin: 0,
                    padding: '1px 6px',
                  }}
                >
                  {info.ratio}x
                </Tag>
              )}
            </Flex>
            {info?.desc && (
              <Text
                ellipsis={{ tooltip: info.desc }}
                style={{ color: sub, fontSize: 11, display: 'block', marginTop: 3 }}
              >
                {info.desc}
              </Text>
            )}
          </div>
        );
      },
    },

    // ── Quota ────────────────────────────────────────────────────────────────
    {
      title: '额度',
      key: 'quota',
      width: 150,
      render: (_, r) => (
        <div style={{ lineHeight: 1.8, fontSize: 12 }}>
          <Flex gap={4}>
            <Text style={{ color: sub }}>已用</Text>
            <Text style={{ fontWeight: 500 }}>
              ${(r.used_quota / 500000).toFixed(4)}
            </Text>
          </Flex>
          <Flex gap={4} align="center">
            <Text style={{ color: sub }}>剩余</Text>
            {r.unlimited_quota ? (
              <Tag
                style={{
                  background: 'rgba(22,119,255,0.08)',
                  border: '1px solid rgba(22,119,255,0.2)',
                  color: '#1677ff',
                  borderRadius: 4,
                  fontSize: 11,
                  padding: '0 6px',
                  margin: 0,
                  lineHeight: '18px',
                }}
              >
                不限
              </Tag>
            ) : (
              <Text style={{ fontWeight: 500 }}>
                ${(r.remain_quota / 500000).toFixed(4)}
              </Text>
            )}
          </Flex>
        </div>
      ),
    },

    // ── Expiry ───────────────────────────────────────────────────────────────
    {
      title: '过期',
      key: 'expired_time',
      width: 110,
      render: (_, r) => {
        const { label, color } = getExpiryInfo(r.expired_time);
        return (
          <Tooltip title={r.expired_time > 0 ? formatDateTime(r.expired_time) : '永不过期'}>
            <Text style={{ color, fontSize: 12, fontWeight: 500 }}>{label}</Text>
          </Tooltip>
        );
      },
    },

    // ── Status ───────────────────────────────────────────────────────────────
    {
      title: '状态',
      key: 'status',
      width: 80,
      align: 'center' as const,
      render: (_, r) => (
        <Tooltip title={r.status === 1 ? '点击禁用' : '点击启用'}>
          <Switch
            size="small"
            checked={r.status === 1}
            onChange={() => onToggleStatus(r)}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        </Tooltip>
      ),
    },

    // ── Last accessed ────────────────────────────────────────────────────────
    {
      title: '上次使用',
      key: 'accessed_time',
      width: 130,
      render: (_, r) => {
        const dt = formatDateTime(r.accessed_time);
        return dt ? (
          <Text style={{ color: sub, fontSize: 12 }}>{dt}</Text>
        ) : (
          <Text style={{ color: sub, fontSize: 12, fontStyle: 'italic' }}>未使用</Text>
        );
      },
    },

    // ── Rate limit ───────────────────────────────────────────────────────────
    {
      title: '速率限制',
      key: 'rate',
      width: 130,
      render: (_, r) => {
        const hasRpm = r.rpm_limit && r.rpm_limit > 0;
        const hasTpm = r.tpm_limit && r.tpm_limit > 0;
        if (!hasRpm && !hasTpm) return <Text style={{ color: sub, fontSize: 12 }}>不限</Text>;
        return (
          <div style={{ lineHeight: 1.8, fontSize: 12 }}>
            {hasRpm && <div><Text style={{ color: sub }}>RPM </Text><Text strong>{r.rpm_limit}</Text></div>}
            {hasTpm && <div><Text style={{ color: sub }}>TPM </Text><Text strong>{r.tpm_limit}</Text></div>}
          </div>
        );
      },
    },

    // ── Actions ──────────────────────────────────────────────────────────────
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            type="default"
            icon={<CodeOutlined />}
            onClick={() => onUseKey(record)}
            style={{ fontSize: 12 }}
          >
            使用密钥
          </Button>
          <Button
            size="small"
            type="default"
            icon={<ImportOutlined />}
            onClick={() => onImportCSS(record)}
            style={{ fontSize: 12 }}
          >
            导入 CCS
          </Button>
          <Tooltip title={t('apiKeys.edit')}>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={t('apiKeys.deleteConfirmTitle')}
            description={t('apiKeys.deleteConfirmDesc')}
            onConfirm={() => onDelete(record.id)}
            okText={t('apiKeys.confirm')}
            cancelText={t('apiKeys.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title={t('apiKeys.delete')}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50'],
        style: { padding: '12px 20px' },
      }}
      onChange={onChange}
      scroll={{ x: 1450 }}
      size="middle"
      rowClassName={() => 'api-key-row'}
    />
  );
}
