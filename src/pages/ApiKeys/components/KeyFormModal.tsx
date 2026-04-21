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

type ExpiryPreset = 7 | 30 | 90 | 'custom';

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
  // 密钥有效期
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>(30);
  // IP 限制
  const [ipLimitEnabled, setIpLimitEnabled] = useState(false);
  // 速率限制
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false);

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

  const presetBtnStyle = (active: boolean): React.CSSProperties => ({
    borderRadius: 6,
    border: `1px solid ${active ? '#10b981' : (isDark ? 'rgba(255,255,255,0.15)' : '#d9d9d9')}`,
    background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
    color: active ? '#10b981' : undefined,
    fontWeight: active ? 600 : undefined,
  });

  const groupOptions = Object.entries(groups).map(([k, v]) => ({
    label: v.desc ? `${k} (${v.desc})` : k,
    value: k,
  }));

  const applyPreset = (preset: ExpiryPreset) => {
    setExpiryPreset(preset);
    if (preset !== 'custom') {
      form.setFieldValue('expired_time', dayjs().add(preset, 'day'));
    }
  };

  const handleExpiryToggle = (checked: boolean) => {
    setExpiryEnabled(checked);
    if (checked) {
      // 默认选 30 天
      setExpiryPreset(30);
      form.setFieldValue('expired_time', dayjs().add(30, 'day'));
    } else {
      form.setFieldValue('expired_time', null);
    }
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
      const hasExpiry = editingRecord.expired_time > 0;
      setExpiryEnabled(hasExpiry);
      setExpiryPreset('custom');
      setUnlimitedQuota(editingRecord.unlimited_quota);
      setQuotaValue(editingRecord.remain_quota > 0 ? editingRecord.remain_quota : 0);
      const hasIpLimit = !!(editingRecord.allow_ips && editingRecord.allow_ips.trim());
      setIpLimitEnabled(hasIpLimit);
      const hasRateLimit = !!(editingRecord.rpm_limit || editingRecord.tpm_limit);
      setRateLimitEnabled(hasRateLimit);
      form.setFieldsValue({
        name: editingRecord.name,
        group: editingRecord.group || undefined,
        expired_time: hasExpiry ? dayjs.unix(editingRecord.expired_time) : null,
        unlimited_quota: editingRecord.unlimited_quota,
        quota: editingRecord.remain_quota > 0 ? editingRecord.remain_quota / 500000 : 0,
        model_limits_enabled: editingRecord.model_limits_enabled,
        model_limits: editingRecord.model_limits,
        allow_ips: editingRecord.allow_ips,
        rpm_limit: editingRecord.rpm_limit || null,
        tpm_limit: editingRecord.tpm_limit || null,
      });
    } else {
      setUnlimitedQuota(true);
      setQuotaValue(0);
      setExpiryEnabled(false);
      setExpiryPreset(30);
      setIpLimitEnabled(false);
      setRateLimitEnabled(false);
      form.resetFields();
      form.setFieldsValue({
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
      okText={<Space><span>提交</span></Space>}
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
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyOutlined style={{ color: '#fff', fontSize: 14 }} />
            </div>
            <div>
              <Text strong>基本信息</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>设置令牌的基本信息</Text></div>
            </div>
          </div>

          <Form.Item
            label={<>名称 <span style={{ color: 'red' }}>*</span></>}
            name="name"
            rules={[{ required: true, message: '请输入名称' }]}
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="请输入令牌名称" />
          </Form.Item>

          <Form.Item label="令牌分组" name="group" style={{ marginBottom: 12 }}>
            <Select placeholder="请选择分组" options={groupOptions} allowClear showSearch />
          </Form.Item>

          {/* 密钥有效期 */}
          <div style={{
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e8e8e8'}`,
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 4,
          }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: expiryEnabled ? 12 : 0 }}>
              <Text strong style={{ fontSize: 13 }}>密钥有效期</Text>
              <Switch checked={expiryEnabled} onChange={handleExpiryToggle} />
            </Flex>

            {expiryEnabled && (
              <>
                <Space style={{ marginBottom: 12 }}>
                  {([7, 30, 90] as const).map((d) => (
                    <Button
                      key={d}
                      size="small"
                      style={presetBtnStyle(expiryPreset === d)}
                      onClick={() => applyPreset(d)}
                    >
                      {d} 天
                    </Button>
                  ))}
                  <Button
                    size="small"
                    style={presetBtnStyle(expiryPreset === 'custom')}
                    onClick={() => setExpiryPreset('custom')}
                  >
                    自定义
                  </Button>
                </Space>

                <Form.Item name="expired_time" style={{ marginBottom: 4 }}>
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="选择过期时间"
                    onChange={() => setExpiryPreset('custom')}
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: 12 }}>选择此 API 密钥的过期时间。</Text>
              </>
            )}
          </div>
        </div>

        {/* 额度设置 */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SafetyOutlined style={{ color: '#fff', fontSize: 14 }} />
            </div>
            <div>
              <Text strong>额度设置</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>设置令牌可用额度和数量</Text></div>
            </div>
          </div>

          <Form.Item label="额度" name="quota" initialValue={0} style={{ marginBottom: 4 }}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              disabled={unlimitedQuota}
              onChange={(v) => setQuotaValue(v || 0)}
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
            等价金额: ${((quotaValue || 0) / 500000).toFixed(2)}
          </Text>

          <Form.Item label="无限额度" name="unlimited_quota" valuePropName="checked" initialValue={true} style={{ marginBottom: 4 }}>
            <Switch onChange={(v) => setUnlimitedQuota(v)} />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            令牌的额度仅用于限制令牌本身的最大额度使用量，实际的使用受到账户的剩余额度限制
          </Text>
        </div>

        {/* 速率限制 */}
        <div style={sectionStyle}>
          <Flex justify="space-between" align="center" style={{ marginBottom: rateLimitEnabled ? 14 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fa8c16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>R</span>
              </div>
              <div>
                <Text strong>速率限制</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>请求速率单位"次/分钟"；Token 速率单位"tok/min"</Text></div>
              </div>
            </div>
            <Switch
              checked={rateLimitEnabled}
              onChange={(v) => {
                setRateLimitEnabled(v);
                if (!v) {
                  form.setFieldValue('rpm_limit', null);
                  form.setFieldValue('tpm_limit', null);
                }
              }}
            />
          </Flex>
          {rateLimitEnabled && (
            <Flex gap={12}>
              <Form.Item
                label="每分钟请求数（req/min）"
                name="rpm_limit"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="留空表示不限"
                />
              </Form.Item>
              <Form.Item
                label="Token 速率限制（tok/min）"
                name="tpm_limit"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="留空表示不限"
                />
              </Form.Item>
            </Flex>
          )}
        </div>

        {/* IP 限制 */}
        <div style={sectionStyle}>
          <Flex justify="space-between" align="center" style={{ marginBottom: ipLimitEnabled ? 12 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LockOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div>
                <Text strong>IP 限制</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>限制令牌可访问的 IP 地址</Text></div>
              </div>
            </div>
            <Switch
              checked={ipLimitEnabled}
              onChange={(v) => {
                setIpLimitEnabled(v);
                if (!v) form.setFieldValue('allow_ips', '');
              }}
            />
          </Flex>
          {ipLimitEnabled && (
            <>
              <Form.Item name="allow_ips" style={{ marginBottom: 4 }}>
                <Input.TextArea rows={3} placeholder="允许的IP，一行一个，不填写则不限制" />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12 }}>
                请勿过度信任此功能，IP可能被伪造，请配合nginx和cdn等网关使用
              </Text>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
}
