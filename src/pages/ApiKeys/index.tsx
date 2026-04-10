import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, Space, Flex, Tooltip, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
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

export const ApiKeysPage = () => {
  const { t } = useTranslation();
  usePageHeader({
    title: t('apiKeys.title'),
    description: t('apiKeys.subtitle'),
  });
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  // ── table state ──────────────────────────────────────
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [groups, setGroups] = useState<Record<string, GroupInfo>>({});
  const [models, setModels] = useState<string[]>([]);

  // ── form modal state ──────────────────────────────────
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ApiKeyItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── use-key modal state ───────────────────────────────
  const [useKeyRecord, setUseKeyRecord] = useState<ApiKeyItem | null>(null);
  const [useKeyVisible, setUseKeyVisible] = useState(false);

  // ── cc-switch modal state ─────────────────────────────
  const [cssRecord, setCssRecord] = useState<ApiKeyItem | null>(null);
  const [cssVisible, setCssVisible] = useState(false);

  // ── data fetching ─────────────────────────────────────
  const fetchApiKeys = useCallback(async (page = 1, size = 10, kw = '') => {
    setLoading(true);
    try {
      const url = kw.trim() ? '/token/search' : '/token/';

      const params = kw.trim()
        ? { keyword: `%${kw.trim()}%`, p: page, size, show_key: true }
        : { p: page, size, show_key: true };
      const res = await apiClient.get<ApiResponse>(url, { params });
      if (res.data.success) {
        setApiKeys(res.data.data.items);
        setPagination((p) => ({
          ...p,
          current: res.data.data.page,
          pageSize: res.data.data.page_size,
          total: res.data.data.total,
        }));
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await apiClient.get('/user/self/groups');
      if (res.data.success) setGroups(res.data.data || {});
    } catch {
      /* ignore */
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const res = await apiClient.get('/user/models');
      const data: string[] = res.data?.data || [];
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
      const res = await apiClient.delete(`/token/${id}`);
      if (res.data.success === false) {
        message.error(res.data.message || t('apiKeys.deleteFailed'));
        return;
      }
      message.success(t('apiKeys.deleteSuccess'));
      fetchApiKeys(
        pagination.current as number,
        pagination.pageSize as number,
        keyword
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
        const res = await apiClient.put(`/token/${editing.id}`, payload);
        if (res.data.success === false) {
          message.error(res.data.message || t('apiKeys.updateFailed'));
          return;
        }
        message.success(t('apiKeys.updateSuccess'));
      } else {
        const count = values.count || 1;
        for (let i = 0; i < count; i++) {
          const name =
            count > 1
              ? `${values.name}_${Math.random().toString(36).slice(2, 6)}`
              : values.name;
          const res = await apiClient.post('/token/', { ...payload, name });
          if (res.data.success === false) {
            message.error(res.data.message || t('apiKeys.createFailed'));
            return;
          }
        }
        message.success(t('apiKeys.createSuccess'));
      }

      setFormVisible(false);
      fetchApiKeys(
        editing ? (pagination.current as number) : 1,
        pagination.pageSize as number,
        keyword
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 16 }}
        >
          <Input.Search
            placeholder={t('apiKeys.searchPlaceholder')}
            style={{ width: 280 }}
            allowClear
            value={keyword}
            onChange={(e) => {
              const v = e.target.value;
              setKeyword(v);
              if (!v.trim()) fetchApiKeys(1, pagination.pageSize as number, '');
            }}
            onSearch={(v) => {
              setKeyword(v);
              fetchApiKeys(1, pagination.pageSize as number, v);
            }}
          />
          <Space>
            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={() =>
                  fetchApiKeys(
                    pagination.current as number,
                    pagination.pageSize as number,
                    keyword
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

        <ApiKeyTable
          dataSource={apiKeys}
          loading={loading}
          pagination={pagination}
          visibleKeys={visibleKeys}
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
      </Card>

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
    </>
  );
};
