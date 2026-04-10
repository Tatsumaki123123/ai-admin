import { Table, Tag, Space, Button, Tooltip, Popconfirm } from 'antd';
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
import type { ApiKeyItem } from '../types';

interface Props {
  dataSource: ApiKeyItem[];
  loading: boolean;
  pagination: TablePaginationConfig;
  visibleKeys: Set<number>;
  onToggleVisibility: (id: number) => void;
  onCopyKey: (key: string) => void;
  onEdit: (record: ApiKeyItem) => void;
  onDelete: (id: number) => void;
  onUseKey: (record: ApiKeyItem) => void;
  onImportCSS: (record: ApiKeyItem) => void;
  onChange: (pg: TablePaginationConfig) => void;
}

const btnStyle = (color: string): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: 'auto',
  padding: '4px 6px',
  fontSize: 11,
  gap: 2,
  color,
});

function formatTime(ts: number, unlimited: string) {
  if (!ts || ts <= 0) return unlimited;
  return new Date(ts * 1000).toLocaleString('zh-CN');
}

function getExpiryLabel(ts: number, unlimited: string) {
  if (!ts || ts <= 0) return unlimited;
  const days = Math.ceil((ts - Date.now() / 1000) / 86400);
  if (days < 0) return '已过期';
  return `${days} 天后过期`;
}

export function ApiKeyTable({
  dataSource,
  loading,
  pagination,
  visibleKeys,
  onToggleVisibility,
  onCopyKey,
  onEdit,
  onDelete,
  onUseKey,
  onImportCSS,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const unlimited = t('apiKeys.unlimited');

  const columns: ColumnsType<ApiKeyItem> = [
    {
      title: t('apiKeys.name'),
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fixed: 'left',
    },
    {
      title: t('apiKeys.apiKey'),
      dataIndex: 'key',
      key: 'key',
      width: 260,
      render: (_, record) => (
        <Space size={4}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {record.key}
          </span>
          <Tooltip title={visibleKeys.has(record.id) ? '隐藏' : '显示'}>
            <Button
              type="text"
              size="small"
              icon={
                visibleKeys.has(record.id) ? (
                  <EyeInvisibleOutlined />
                ) : (
                  <EyeOutlined />
                )
              }
              onClick={() => onToggleVisibility(record.id)}
            />
          </Tooltip>
          <Tooltip title={t('apiKeys.copy')}>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => onCopyKey(record.key)}
            />
          </Tooltip>
        </Space>
      ),
    },
    { title: t('apiKeys.group'), dataIndex: 'group', key: 'group', width: 120 },
    {
      title: t('apiKeys.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s) =>
        s === 1 ? (
          <Tag color="success">{t('apiKeys.active')}</Tag>
        ) : (
          <Tag color="warning">{t('apiKeys.inactive')}</Tag>
        ),
    },
    {
      title: t('apiKeys.quotaType'),
      dataIndex: 'unlimited_quota',
      key: 'quota',
      width: 90,
      render: (u) =>
        u ? (
          <Tag color="blue">{unlimited}</Tag>
        ) : (
          <Tag>{t('apiKeys.limited')}</Tag>
        ),
    },
    {
      title: t('apiKeys.usedQuota'),
      dataIndex: 'used_quota',
      key: 'used_quota',
      width: 110,
      render: (v) => `$${(v / 500000).toFixed(4)}`,
    },
    {
      title: t('apiKeys.remainingQuota'),
      dataIndex: 'remain_quota',
      key: 'remain_quota',
      width: 110,
      render: (v, r) =>
        r.unlimited_quota ? '∞' : `$${(v / 500000).toFixed(4)}`,
    },
    {
      title: t('apiKeys.expiry'),
      dataIndex: 'expired_time',
      key: 'expired_time',
      width: 130,
      render: (ts) => (
        <Tooltip title={formatTime(ts, unlimited)}>
          <span>{getExpiryLabel(ts, unlimited)}</span>
        </Tooltip>
      ),
    },
    {
      title: t('apiKeys.createdAt'),
      dataIndex: 'created_time',
      key: 'created_time',
      width: 170,
      render: (ts) => formatTime(ts, unlimited),
    },
    {
      title: t('apiKeys.lastAccessed'),
      dataIndex: 'accessed_time',
      key: 'accessed_time',
      width: 170,
      render: (ts) => (ts > 0 ? formatTime(ts, unlimited) : '-'),
    },
    {
      title: t('apiKeys.actions'),
      key: 'action',
      width: 320,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size={2}>
          <Button
            type="text"
            size="small"
            style={btnStyle('#b45309')}
            onClick={() => onUseKey(record)}
          >
            <CodeOutlined style={{ fontSize: 16 }} />
            <span>使用密钥</span>
          </Button>
          <Button
            type="text"
            size="small"
            style={btnStyle('#b45309')}
            onClick={() => onImportCSS(record)}
          >
            <ImportOutlined style={{ fontSize: 16 }} />
            <span>导入CSS</span>
          </Button>
          <Button
            type="text"
            size="small"
            style={btnStyle('#b45309')}
            onClick={() => onEdit(record)}
          >
            <EditOutlined style={{ fontSize: 16 }} />
            <span>编辑</span>
          </Button>
          <Popconfirm
            title={t('apiKeys.deleteConfirmTitle')}
            description={t('apiKeys.deleteConfirmDesc')}
            onConfirm={() => onDelete(record.id)}
            okText={t('apiKeys.confirm')}
            cancelText={t('apiKeys.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" style={btnStyle('#b45309')}>
              <DeleteOutlined style={{ fontSize: 16 }} />
              <span>删除</span>
            </Button>
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
      }}
      onChange={onChange}
      scroll={{ x: 1400 }}
      size="middle"
    />
  );
}
