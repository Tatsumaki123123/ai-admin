import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  DatePicker,
  Button,
  Space,
  Flex,
  Tag,
  Typography,
} from 'antd';
import { KeyOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import type { RootState } from '../../../redux/store';
import type { ApiKeyItem, GroupInfo } from '../types';

const { Text } = Typography;

interface Props {
  visible: boolean;
  editingRecord: ApiKeyItem | null;
  groups: Record<string, GroupInfo>;
  submitting: boolean;
  onOk: (values: any, editingRecord: ApiKeyItem | null) => Promise<void>;
  onCancel: () => void;
}

export function KeyFormModal({
  visible,
  editingRecord,
  groups,
  submitting,
  onOk,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const [form] = Form.useForm();
  const [unlimitedQuota, setUnlimitedQuota] = useState(true);
  const [quotaValue, setQuotaValue] = useState(0);

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

  const groupOptions = Object.entries(groups).map(([k, v]) => ({
    label: v.desc ? `${k} (${v.desc})` : k,
    value: k,
  }));

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

  const handleOk = async () => {
    const values = await form.validateFields();
    await onOk(values, editingRecord);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleAfterOpen = (open: boolean) => {
    if (!open) return;
    if (editingRecord) {
      setUnlimitedQuota(editingRecord.unlimited_quota);
      setQuotaValue(
        editingRecord.remain_quota > 0 ? editingRecord.remain_quota : 0
      );
      form.setFieldsValue({
        name: editingRecord.name,
        group: editingRecord.group || undefined,
        expired_time:
          editingRecord.expired_time > 0
            ? dayjs.unix(editingRecord.expired_time)
            : null,
        unlimited_quota: editingRecord.unlimited_quota,
        quota:
          editingRecord.remain_quota > 0
            ? editingRecord.remain_quota / 500000
            : 0,
        model_limits_enabled: editingRecord.model_limits_enabled,
        model_limits: editingRecord.model_limits,
        allow_ips: editingRecord.allow_ips,
      });
    } else {
      setUnlimitedQuota(true);
      setQuotaValue(0);
      form.resetFields();
      form.setFieldsValue({
        count: 1,
        unlimited_quota: true,
        expired_time: null,
      });
    }
  };

  return (
    <Modal
      title={
        <Space>
          <Tag color="blue" style={{ margin: 0 }}>
            {editingRecord ? '编辑' : '新建'}
          </Tag>
          {editingRecord ? t('apiKeys.editKey') : '创建新的令牌'}
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
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
      afterOpenChange={handleAfterOpen}
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

          <Form.Item label="令牌分组" name="group" style={{ marginBottom: 12 }}>
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
            label="模型限制列表"
            name="model_limits"
            style={{ marginBottom: 12 }}
          >
            <Select
              mode="tags"
              placeholder="请选择该令牌支持的模型，留空支持所有模型"
              allowClear
            />
          </Form.Item>

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
              placeholder="允许的IP，一行一个，不填写则不限制"
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            请勿过度信任此功能，IP可能被伪造，请配合nginx和cdn等网关使用
          </Text>
        </div>
      </Form>
    </Modal>
  );
}
