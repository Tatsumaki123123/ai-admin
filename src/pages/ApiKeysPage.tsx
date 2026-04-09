import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tooltip,
  Spin,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import axios from 'axios';
import { AppPageLayout } from '../layouts';
import { useTranslation } from 'react-i18next';

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
  data: {
    page: number;
    page_size: number;
    total: number;
    items: ApiKeyItem[];
  };
  message: string;
  success: boolean;
}

interface DisplayKey extends ApiKeyItem {
  visibleKey?: boolean;
}

export const ApiKeysPage = () => {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<DisplayKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());

  // 获取API密钥列表
  const fetchApiKeys = async (page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/token/', {
        params: {
          p: page,
          size: size,
        },
      });

      if (response.data.success) {
        const items = response.data.data.items.map((item) => ({
          ...item,
          visibleKey: false,
        }));
        setApiKeys(items);
        setPagination({
          current: response.data.data.page,
          pageSize: response.data.data.page_size,
          total: response.data.data.total,
        });
      } else {
        message.error(response.data.message || t('apiKeys.title'));
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      message.error(t('apiKeys.title'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys(pagination.current || 1, pagination.pageSize || 10);
  }, []);

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp || timestamp === -1) return 'Permanent';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US');
  };

  // Get days difference
  const getDaysDiff = (timestamp: number): string => {
    if (!timestamp || timestamp === -1) return 'Permanent';
    const now = Date.now() / 1000;
    const days = Math.ceil((timestamp - now) / (24 * 3600));
    if (days < 0) return 'Expired';
    if (!isFinite(days)) return 'Permanent';
    return `Expires in ${Math.max(0, days)} days`;
  };

  const handleCreateKey = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      message.success(t('apiKeys.title'));
      setIsModalVisible(false);
      fetchApiKeys(pagination.current || 1, pagination.pageSize || 10);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCopyKey = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    message.success(t('apiKeys.copy'));
  };

  const handleToggleVisibility = (id: number) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(id)) {
      newVisibleKeys.delete(id);
    } else {
      newVisibleKeys.add(id);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const handleDeleteKey = () => {
    message.info('Delete functionality under development');
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchApiKeys(newPagination.current || 1, newPagination.pageSize || 10);
  };

  const columns: ColumnsType<DisplayKey> = [
    {
      title: t('apiKeys.name'),
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => <span>{text || '-'}</span>,
    },
    {
      title: t('apiKeys.apiKey'),
      dataIndex: 'key',
      key: 'key',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {visibleKeys.has(record.id)
              ? record.key
              : record.key.substring(0, 8) + '**...'}
          </span>
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
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyKey(record.key)}
          />
        </Space>
      ),
    },
    {
      title: t('apiKeys.group'),
      dataIndex: 'group',
      key: 'group',
      width: 100,
      filters: [{ text: 'default', value: 'default' }],
      onFilter: (value, record) => record.group === value,
    },
    {
      title: t('apiKeys.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => {
        const statusConfig: Record<number, { color: string; text: string }> = {
          1: { color: 'green', text: t('apiKeys.active') },
          0: { color: 'orange', text: t('apiKeys.inactive') },
        };
        const config = statusConfig[status] || statusConfig[0];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: t('apiKeys.active'), value: 1 },
        { text: t('apiKeys.inactive'), value: 0 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('apiKeys.quotaType'),
      dataIndex: 'unlimited_quota',
      key: 'quota',
      width: 90,
      render: (unlimited: boolean) => {
        return unlimited ? (
          <Tag color="blue">{t('apiKeys.unlimited')}</Tag>
        ) : (
          <span>{t('apiKeys.limited')}</span>
        );
      },
    },
    {
      title: t('apiKeys.usedQuota'),
      dataIndex: 'used_quota',
      key: 'used_quota',
      width: 100,
      render: (used: number) => <span>${(used / 1000000).toFixed(4)}</span>,
    },
    {
      title: t('apiKeys.remainingQuota'),
      dataIndex: 'remain_quota',
      key: 'remain_quota',
      width: 100,
      render: (remain: number) => <span>${(remain / 1000000).toFixed(4)}</span>,
    },
    {
      title: t('apiKeys.expiry'),
      dataIndex: 'expired_time',
      key: 'expired_time',
      width: 130,
      render: (time: number) => (
        <Tooltip title={formatTimestamp(time)}>
          <span>{getDaysDiff(time)}</span>
        </Tooltip>
      ),
    },
    {
      title: t('apiKeys.createdAt'),
      dataIndex: 'created_time',
      key: 'created_time',
      width: 180,
      render: (time: number) => formatTimestamp(time),
    },
    {
      title: t('apiKeys.lastAccessed'),
      dataIndex: 'accessed_time',
      key: 'accessed_time',
      width: 180,
      render: (time: number) => (time > 0 ? formatTimestamp(time) : 'Not used'),
    },
    {
      title: t('apiKeys.actions'),
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('apiKeys.copy')}>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyKey(record.key)}
            />
          </Tooltip>
          <Tooltip title={t('apiKeys.edit')}>
            <Button type="text" size="small" icon={<EditOutlined />} disabled />
          </Tooltip>
          <Popconfirm
            title={t('apiKeys.deleteConfirmTitle')}
            description={t('apiKeys.deleteConfirmDesc')}
            onConfirm={handleDeleteKey}
            okText={t('apiKeys.confirm')}
            cancelText={t('apiKeys.cancel')}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppPageLayout>
      <Card
        title={t('apiKeys.title')}
        style={{ marginBottom: '24px' }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateKey}
            disabled
          >
            Create Key
          </Button>
        }
      >
        <Space
          style={{ marginBottom: '16px', display: 'flex' }}
          direction="vertical"
          size="large"
        >
          <Space wrap>
            <Input.Search
              placeholder={t('apiKeys.searchPlaceholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              enterButton
            />
            <Select
              placeholder={t('apiKeys.allGroups')}
              value={selectedGroup}
              onChange={setSelectedGroup}
              style={{ width: 150 }}
              allowClear
              options={[{ label: 'default', value: 'default' }]}
            />
            <Select
              placeholder={t('apiKeys.allStatus')}
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 150 }}
              allowClear
              options={[
                { label: t('apiKeys.active'), value: '1' },
                { label: t('apiKeys.inactive'), value: '0' },
              ]}
            />
          </Space>
        </Space>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={apiKeys}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} records`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1600 }}
            size="middle"
          />
        </Spin>
      </Card>

      <Modal
        title={t('apiKeys.title')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={t('apiKeys.confirm')}
        cancelText={t('apiKeys.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Key Name"
            name="name"
            rules={[{ required: true, message: 'Please enter key name' }]}
          >
            <Input placeholder="e.g: My API Key" />
          </Form.Item>
          <Form.Item
            label={t('apiKeys.group')}
            name="group"
            initialValue="default"
            rules={[{ required: true, message: 'Please select a group' }]}
          >
            <Select
              placeholder="Select a group"
              options={[{ label: 'default', value: 'default' }]}
            />
          </Form.Item>
          <Form.Item
            label="Allowed IPs"
            name="allow_ips"
            tooltip="Leave blank to allow all IPs"
          >
            <Input placeholder="e.g: 192.168.1.1,192.168.1.2" />
          </Form.Item>
          <Form.Item
            label="Enable Model Restrictions"
            name="model_limits_enabled"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </AppPageLayout>
  );
};
