import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Tooltip,
  Switch,
  Flex,
  Select,
  InputNumber,
  DatePicker,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  KeyOutlined,
  SafetyOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { usePageHeader } from '../hooks/usePageContext';
import apiClient from '../services/api/apiClient';
import dayjs, { Dayjs } from 'dayjs';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const { Text } = Typography;

interface ApiKeyItem {
  id: number;
  user_id: number;
  key: string;
  status: number;
  name: string;
  created_time: number;
  accessed_time: number;
  expired_time: number;
  remain_quota: number;
  unlimited_quota: boolean;
  model_limits_enabled: boolean;
  model_limits: string;
  allow_ips: string;
  used_quota: number;
  group: string;
  cross_group_retry: boolean;
  DeletedAt: null | string;
}

interface ApiResponse {
  data: { page: number; page_size: number; total: number; items: ApiKeyItem[] };
  message: string;
  success: boolean;
}

interface GroupInfo {
  desc: string;
  ratio: number;
}

export const ApiKeysPage = () => {
  const { t } = useTranslation();
  usePageHeader({
    title: t('apiKeys.title'),
    description: t('apiKeys.subtitle'),
  });
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ApiKeyItem | null>(null);
  const [groups, setGroups] = useState<Record<string, GroupInfo>>({});
  const [unlimitedQuota, setUnlimitedQuota] = useState(true);
  const [quotaValue, setQuotaValue] = useState(0);
  const [form] = Form.useForm();

  const fetchApiKeys = useCallback(async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await apiClient.get<ApiResponse>('/token/', {
        params: { p: page, size },
      });
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

  useEffect(() => {
    fetchApiKeys();
    fetchGroups();
  }, [fetchApiKeys, fetchGroups]);

  const formatTime = (ts: number) =>
    !ts || ts <= 0
      ? t('apiKeys.unlimited')
      : new Date(ts * 1000).toLocaleString('zh-CN');
  const getExpiryLabel = (ts: number) => {
    if (!ts || ts <= 0) return t('apiKeys.unlimited');
    const days = Math.ceil((ts - Date.now() / 1000) / 86400);
    if (days < 0) return '已过期';
    return `${days} 天后过期`;
  };

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

  const openCreateModal = () => {
    setEditingRecord(null);
    setUnlimitedQuota(true);
    setQuotaValue(0);
    form.resetFields();
    form.setFieldsValue({
      count: 1,
      unlimited_quota: true,
      expired_time: null,
    });
    setIsModalVisible(true);
  };

  const openEditModal = (record: ApiKeyItem) => {
    setEditingRecord(record);
    setUnlimitedQuota(record.unlimited_quota);
    setQuotaValue(record.remain_quota > 0 ? record.remain_quota : 0);
    form.setFieldsValue({
      name: record.name,
      group: record.group || undefined,
      expired_time:
        record.expired_time > 0 ? dayjs.unix(record.expired_time) : null,
      unlimited_quota: record.unlimited_quota,
      quota: record.remain_quota > 0 ? record.remain_quota / 500000 : 0,
      model_limits_enabled: record.model_limits_enabled,
      model_limits: record.model_limits,
      allow_ips: record.allow_ips,
    });
    setIsModalVisible(true);
  };

  const setExpiryQuick = (type: 'never' | 'month' | 'day' | 'hour') => {
    if (type === 'never') {
      form.setFieldValue('expired_time', null);
      return;
    }
    const now = dayjs();
    const map = {
      month: now.add(1, 'month'),
      day: now.add(1, 'day'),
      hour: now.add(1, 'hour'),
    };
    form.setFieldValue('expired_time', map[type]);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
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
      if (editingRecord) {
        const res = await apiClient.put(`/token/${editingRecord.id}`, payload);
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
      setIsModalVisible(false);
      fetchApiKeys(
        editingRecord ? (pagination.current as number) : 1,
        pagination.pageSize as number
      );
    } catch {
      /* validation */
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await apiClient.delete(`/token/${id}`);
      if (res.data.success === false) {
        message.error(res.data.message || t('apiKeys.deleteFailed'));
        return;
      }
      message.success(t('apiKeys.deleteSuccess'));
      fetchApiKeys(pagination.current as number, pagination.pageSize as number);
    } catch {
      message.error(t('apiKeys.deleteFailed'));
    }
  };

  const groupOptions = Object.entries(groups).map(([k, v]) => ({
    label: v.desc ? `${k} (${v.desc})` : k,
    value: k,
  }));

  const columns: ColumnsType<ApiKeyItem> = [
    { title: t('apiKeys.name'), dataIndex: 'name', key: 'name', width: 120 },
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
              onClick={() => handleToggleVisibility(record.id)}
            />
          </Tooltip>
          <Tooltip title={t('apiKeys.copy')}>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyKey(record.key)}
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
          <Tag color="blue">{t('apiKeys.unlimited')}</Tag>
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
        <Tooltip title={formatTime(ts)}>
          <span>{getExpiryLabel(ts)}</span>
        </Tooltip>
      ),
    },
    {
      title: t('apiKeys.createdAt'),
      dataIndex: 'created_time',
      key: 'created_time',
      width: 170,
      render: (ts) => formatTime(ts),
    },
    {
      title: t('apiKeys.lastAccessed'),
      dataIndex: 'accessed_time',
      key: 'accessed_time',
      width: 170,
      render: (ts) => (ts > 0 ? formatTime(ts) : '-'),
    },
    {
      title: t('apiKeys.actions'),
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={t('apiKeys.edit')}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title={t('apiKeys.deleteConfirmTitle')}
            description={t('apiKeys.deleteConfirmDesc')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('apiKeys.confirm')}
            cancelText={t('apiKeys.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title={t('apiKeys.delete')}>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const sectionStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.04)' : '#f9f9f9',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e8e8e8'}`,
    borderRadius: 8,
    padding: '16px 16px 12px',
    marginBottom: 16,
  };
  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
          />
          <Space>
            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchApiKeys(
                    pagination.current as number,
                    pagination.pageSize as number
                  )
                }
                loading={loading}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              {t('apiKeys.createKey')}
            </Button>
          </Space>
        </Flex>
        <Table
          columns={columns}
          dataSource={apiKeys}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={(pg) => fetchApiKeys(pg.current || 1, pg.pageSize || 10)}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      <Modal
        title={
          <Space>
            <Tag color="blue" style={{ margin: 0 }}>
              {editingRecord ? '编辑' : '新建'}
            </Tag>
            {editingRecord ? t('apiKeys.editKey') : '创建新的令牌'}
          </Space>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={
          <Space>
            <span>提交</span>
          </Space>
        }
        cancelText="取消"
        confirmLoading={submitting}
        destroyOnClose
        width={560}
        okButtonProps={{ icon: <span>💾</span> }}
        cancelButtonProps={{ icon: <span>✗</span> }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {/* 基本信息 */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#1677ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KeyOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div>
                <Text strong>基本信息</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    设置令牌的基本信息
                  </Text>
                </div>
              </div>
            </div>

            <Form.Item
              label={
                <>
                  名称 <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="name"
              rules={[{ required: true, message: '请输入名称' }]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="请输入令牌名称" />
            </Form.Item>

            <Form.Item
              label="令牌分组"
              name="group"
              style={{ marginBottom: 12 }}
            >
              <Select
                placeholder="请选择分组"
                options={groupOptions}
                allowClear
                showSearch
              />
            </Form.Item>

            <Flex gap={12} align="flex-start">
              <Form.Item
                label={
                  <>
                    过期时间 <span style={{ color: 'red' }}>*</span>
                  </>
                }
                name="expired_time"
                style={{ flex: 1, marginBottom: 12 }}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="1970-01-01 07:59:59"
                />
              </Form.Item>
              <Form.Item label="过期时间快捷设置" style={{ marginBottom: 12 }}>
                <Space>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => setExpiryQuick('never')}
                  >
                    永不过期
                  </Button>
                  <Button size="small" onClick={() => setExpiryQuick('month')}>
                    一个月
                  </Button>
                  <Button size="small" onClick={() => setExpiryQuick('day')}>
                    一天
                  </Button>
                  <Button size="small" onClick={() => setExpiryQuick('hour')}>
                    一小时
                  </Button>
                </Space>
              </Form.Item>
            </Flex>

            {!editingRecord && (
              <Form.Item
                label={
                  <>
                    新建数量 <span style={{ color: 'red' }}>*</span>
                  </>
                }
                name="count"
                initialValue={1}
                rules={[{ required: true }]}
                style={{ marginBottom: 4 }}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            )}
            {!editingRecord && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                批量创建时会在名称后自动添加随机后缀
              </Text>
            )}
          </div>

          {/* 额度设置 */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SafetyOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div>
                <Text strong>额度设置</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    设置令牌可用额度和数量
                  </Text>
                </div>
              </div>
            </div>

            <Form.Item
              label="额度"
              name="quota"
              initialValue={0}
              style={{ marginBottom: 4 }}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                disabled={unlimitedQuota}
                onChange={(v) => setQuotaValue(v || 0)}
              />
            </Form.Item>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginBottom: 12 }}
            >
              等价金额: ${((quotaValue || 0) / 500000).toFixed(2)}
            </Text>

            <Form.Item
              label="无限额度"
              name="unlimited_quota"
              valuePropName="checked"
              initialValue={true}
              style={{ marginBottom: 4 }}
            >
              <Switch onChange={(v) => setUnlimitedQuota(v)} />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12 }}>
              令牌的额度仅用于限制令牌本身的最大额度使用量，实际的使用受到账户的剩余额度限制
            </Text>
          </div>

          {/* 访问限制 */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#722ed1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div>
                <Text strong>访问限制</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    设置令牌的访问限制
                  </Text>
                </div>
              </div>
            </div>

            <Form.Item
              label={
                <>
                  IP白名单{' '}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    (支持CIDR表达式)
                  </Text>
                </>
              }
              name="allow_ips"
              style={{ marginBottom: 4 }}
            >
              <Input.TextArea
                rows={3}
                placeholder={'允许的IP，一行一个，不填写则不限制'}
              />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12 }}>
              请勿过度信任此功能，IP可能被伪造，请配合nginx和cdn等网关使用
            </Text>
          </div>
        </Form>
      </Modal>
    </>
  );
};
