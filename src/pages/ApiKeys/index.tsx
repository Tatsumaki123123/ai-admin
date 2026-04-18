import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Input,
  Select,
  Space,
  Flex,
  Tooltip,
  message,
  Typography,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { TablePaginationConfig } from 'antd/es/table';
import type { Dayjs } from 'dayjs';

import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import type { RootState } from '../../redux/store';

import type { ApiKeyItem, ApiResponse, GroupInfo } from './types';
import { API_BASE } from './constants';
import { ApiKeyTable } from './components/ApiKeyTable';
import { KeyFormModal } from './components/KeyFormModal';
import { UseKeyModal } from './components/UseKeyModal';
import { CCSwitchModal } from './components/CCSwitchModal';

const { Text } = Typography;

// ── Endpoint banner ───────────────────────────────────────────────────────────
function EndpointRow({
  label,
  url,
  isDark,
}: {
  label: string;
  url: string;
  isDark: boolean;
}) {
  const codeBg = isDark ? 'rgba(255,255,255,0.06)' : '#f0f4ff';
  const codeBorder = isDark ? 'rgba(22,119,255,0.2)' : 'rgba(22,119,255,0.15)';
  return (
    <Flex align="center" gap={10}>
      <Text
        style={{
          color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
          fontSize: 12,
          minWidth: 90,
          textAlign: 'right',
        }}
      >
        {label}
      </Text>
      <Flex
        align="center"
        gap={6}
        style={{
          background: codeBg,
          border: `1px solid ${codeBorder}`,
          borderRadius: 6,
          padding: '4px 10px',
          flex: 1,
          maxWidth: 420,
        }}
      >
        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 13,
            flex: 1,
            color: '#1677ff',
            letterSpacing: 0.2,
          }}
        >
          {url}
        </Text>
        <Tooltip title="复制">
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined style={{ fontSize: 12 }} />}
            style={{ color: 'rgba(22,119,255,0.6)', padding: '0 4px', height: 20 }}
            onClick={() =>
              navigator.clipboard.writeText(url).then(() => message.success('已复制'))
            }
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
}

export const ApiKeysPage = () => {
  const { t } = useTranslation();
  usePageHeader({
    title: t('apiKeys.title'),
    description: '平台 Key 现在会安全保存，后续可随时回来复制使用，不再是一次性展示。',
  });
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e8edf5';
  const cardBg = isDark ? '#141414' : '#fff';
  const bannerBg = isDark
    ? 'linear-gradient(135deg, rgba(22,119,255,0.08) 0%, rgba(114,46,209,0.06) 100%)'
    : 'linear-gradient(135deg, #f0f6ff 0%, #f5f0ff 100%)';

  // ── table state ──────────────────────────────────────
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [groups, setGroups] = useState<Record<string, GroupInfo>>({});
  const [models, setModels] = useState<string[]>([]);

  // ── modal state ───────────────────────────────────────
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ApiKeyItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [useKeyRecord, setUseKeyRecord] = useState<ApiKeyItem | null>(null);
  const [useKeyVisible, setUseKeyVisible] = useState(false);
  const [cssRecord, setCssRecord] = useState<ApiKeyItem | null>(null);
  const [cssVisible, setCssVisible] = useState(false);

  // ── data fetching ─────────────────────────────────────
  const fetchApiKeys = useCallback(
    async (
      page = 1,
      size = 10,
      kw = '',
      group = filterGroup,
      status = filterStatus,
    ) => {
      setLoading(true);
      try {
        const url = kw.trim() ? '/token/search' : '/token/';
        const params: Record<string, any> = kw.trim()
          ? { keyword: `%${kw.trim()}%`, p: page, size, show_key: true }
          : { p: page, size, show_key: true };
        if (group) params.group = group;
        if (status !== '') params.status = status;

        const data = await apiClient.get<ApiResponse>(url, { params });
        setApiKeys(data.items);
        setPagination((p) => ({
          ...p,
          current: data.page,
          pageSize: data.page_size,
          total: data.total,
        }));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [filterGroup, filterStatus],
  );

  const fetchGroups = useCallback(async () => {
    try {
      const data = await apiClient.get('/user/self/groups');
      setGroups(data || {});
    } catch {
      /* ignore */
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const data: string[] = await apiClient.get('/user/models') || [];
      setModels(data.filter(Boolean));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
    fetchGroups();
    fetchModels();
  }, [fetchApiKeys, fetchGroups, fetchModels]);

  // ── handlers ──────────────────────────────────────────
  const handleToggleVisibility = (id: number) =>
    setVisibleKeys((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleCopyKey = (key: string) =>
    navigator.clipboard
      .writeText(key)
      .then(() => message.success(t('apiKeys.copySuccess')));

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/token/${id}`);
      message.success(t('apiKeys.deleteSuccess'));
      fetchApiKeys(
        pagination.current as number,
        pagination.pageSize as number,
        keyword,
      );
    } catch {
      message.error(t('apiKeys.deleteFailed'));
    }
  };

  const handleFormOk = async (values: any, editing: ApiKeyItem | null) => {
    setSubmitting(true);
    try {
      const payload: any = {
        name: values.name,
        group: values.group || '',
        expired_time: values.expired_time
          ? Math.floor((values.expired_time as Dayjs).valueOf() / 1000)
          : -1,
        unlimited_quota: values.unlimited_quota ?? true,
        remain_quota: values.unlimited_quota
          ? 0
          : Math.floor((values.quota || 0) * 500000),
        model_limits_enabled: values.model_limits_enabled ?? false,
        model_limits: values.model_limits || '',
        allow_ips: values.allow_ips || '',
      };

      if (editing) {
        await apiClient.put(`/token/${editing.id}`, payload);
        message.success(t('apiKeys.updateSuccess'));
      } else {
        const count = values.count || 1;
        for (let i = 0; i < count; i++) {
          const name =
            count > 1
              ? `${values.name}_${Math.random().toString(36).slice(2, 6)}`
              : values.name;
          await apiClient.post('/token/', { ...payload, name });
        }
        message.success(t('apiKeys.createSuccess'));
      }

      setFormVisible(false);
      fetchApiKeys(
        editing ? (pagination.current as number) : 1,
        pagination.pageSize as number,
        keyword,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const groupOptions = [
    { label: t('apiKeys.allGroups'), value: '' },
    ...Object.entries(groups).map(([k, v]) => ({
      label: v.desc ? `${k} · ${v.desc}` : k,
      value: k,
    })),
  ];

  const statusOptions = [
    { label: t('apiKeys.allStatus'), value: '' },
    { label: t('apiKeys.active'), value: '1' },
    { label: t('apiKeys.inactive'), value: '2' },
  ];

  const openaiEndpoint = `${API_BASE}/v1`;
  const anthropicEndpoint = API_BASE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Endpoint banner ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: bannerBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          padding: '16px 24px',
        }}
      >
        <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
          <Badge status="processing" />
          <Text strong style={{ fontSize: 13 }}>
            推荐接入地址
          </Text>
        </Flex>
        <Flex vertical gap={8}>
          <EndpointRow label="OpenAI 兼容" url={openaiEndpoint} isDark={isDark} />
          <EndpointRow label="Anthropic" url={anthropicEndpoint} isDark={isDark} />
        </Flex>
      </div>

      {/* ── Main card ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* toolbar */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={10}
          style={{ padding: '16px 20px', borderBottom: `1px solid ${borderColor}` }}
        >
          <Flex gap={8} wrap="wrap" align="center">
            <Input.Search
              placeholder={t('apiKeys.searchPlaceholder')}
              style={{ width: 240 }}
              allowClear
              value={keyword}
              onChange={(e) => {
                const v = e.target.value;
                setKeyword(v);
                if (!v.trim())
                  fetchApiKeys(1, pagination.pageSize as number, '');
              }}
              onSearch={(v) => {
                setKeyword(v);
                fetchApiKeys(1, pagination.pageSize as number, v);
              }}
            />
            <Select
              value={filterGroup}
              onChange={(v) => {
                setFilterGroup(v);
                fetchApiKeys(
                  1,
                  pagination.pageSize as number,
                  keyword,
                  v,
                  filterStatus,
                );
              }}
              style={{ width: 160 }}
              options={groupOptions}
              placeholder="全部分组"
            />
            <Select
              value={filterStatus}
              onChange={(v) => {
                setFilterStatus(v);
                fetchApiKeys(
                  1,
                  pagination.pageSize as number,
                  keyword,
                  filterGroup,
                  v,
                );
              }}
              style={{ width: 110 }}
              options={statusOptions}
              placeholder="全部状态"
            />
          </Flex>
          <Space>
            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={() =>
                  fetchApiKeys(
                    pagination.current as number,
                    pagination.pageSize as number,
                    keyword,
                  )
                }
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRecord(null);
                setFormVisible(true);
              }}
            >
              {t('apiKeys.createKey')}
            </Button>
          </Space>
        </Flex>

        {/* table */}
        <ApiKeyTable
          dataSource={apiKeys}
          loading={loading}
          pagination={pagination}
          visibleKeys={visibleKeys}
          groups={groups}
          isDark={isDark}
          onToggleVisibility={handleToggleVisibility}
          onCopyKey={handleCopyKey}
          onEdit={(r) => {
            setEditingRecord(r);
            setFormVisible(true);
          }}
          onDelete={handleDelete}
          onUseKey={(r) => {
            setUseKeyRecord(r);
            setUseKeyVisible(true);
          }}
          onImportCSS={(r) => {
            setCssRecord(r);
            setCssVisible(true);
          }}
          onChange={(pg) =>
            fetchApiKeys(pg.current || 1, pg.pageSize || 10, keyword)
          }
        />
      </div>

      <KeyFormModal
        visible={formVisible}
        editingRecord={editingRecord}
        groups={groups}
        submitting={submitting}
        onOk={handleFormOk}
        onCancel={() => setFormVisible(false)}
      />
      <UseKeyModal
        visible={useKeyVisible}
        record={useKeyRecord}
        apiBase={API_BASE}
        isDark={isDark}
        onClose={() => setUseKeyVisible(false)}
      />
      <CCSwitchModal
        visible={cssVisible}
        record={cssRecord}
        models={models}
        apiBase={API_BASE}
        onClose={() => setCssVisible(false)}
      />
    </div>
  );
};
