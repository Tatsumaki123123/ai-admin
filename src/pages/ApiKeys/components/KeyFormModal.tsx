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
import {
  KeyOutlined,
  SafetyOutlined,
  LockOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
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

export function KeyFormModal({ visible, editingRecord, groups, submitting, onOk, onCancel }: Props) {
  const { t } = useTranslation();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const [form] = Form.useForm();

  const [_unlimitedQuota, setUnlimitedQuota] = useState(true);
  const [_quotaValue, setQuotaValue] = useState(0);
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>(30);
  const [ipLimitEnabled, setIpLimitEnabled] = useState(false);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false);

  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e8e8e8';
  const sectionBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9f9f9';

  const sectionStyle: React.CSSProperties = {
    background: sectionBg,
    border: `1px solid ${border}`,
    borderRadius: 8,
    padding: '14px 16px',
    marginBottom: 12,
  };

  const iconDot = (color: string, icon: React.ReactNode) => (
    <div style={{ width: 26, height: 26, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
  );

  const sectionHeader = (color: string, icon: React.ReactNode, label: string, right?: React.ReactNode) => (
    <Flex justify="space-between" align="center" style={{ marginBottom: 0 }}>
      <Flex align="center" gap={8}>
        {iconDot(color, icon)}
        <Text strong style={{ fontSize: 14 }}>{label}</Text>
      </Flex>
      {right}
    </Flex>
  );

  const presetBtnStyle = (active: boolean): React.CSSProperties => ({
    borderRadius: 6,
    border: `1px solid ${active ? '#10b981' : border}`,
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
    if (preset !== 'custom') form.setFieldValue('expired_time', dayjs().add(preset, 'day'));
  };

  const handleExpiryToggle = (checked: boolean) => {
    setExpiryEnabled(checked);
    if (checked) { setExpiryPreset(30); form.setFieldValue('expired_time', dayjs().add(30, 'day')); }
    else form.setFieldValue('expired_time', null);
  };

  const handleOk = async () => { const values = await form.validateFields(); await onOk(values, editingRecord); };
  const handleCancel = () => { form.resetFields(); onCancel(); };

  const handleAfterOpen = (open: boolean) => {
    if (!open) return;
    if (editingRecord) {
      const hasExpiry = editingRecord.expired_time > 0;
      setExpiryEnabled(hasExpiry);
      setExpiryPreset('custom');
      setUnlimitedQuota(editingRecord.unlimited_quota);
      setQuotaValue(editingRecord.remain_quota > 0 ? editingRecord.remain_quota : 0);
      setIpLimitEnabled(!!(editingRecord.allow_ips?.trim()));
      setRateLimitEnabled(!!(editingRecord.rpm_limit || editingRecord.tpm_limit));
      form.setFieldsValue({
        name: editingRecord.name,
        group: editingRecord.group || undefined,
        expired_time: hasExpiry ? dayjs.unix(editingRecord.expired_time) : null,
        unlimited_quota: editingRecord.unlimited_quota,
        quota: editingRecord.unlimited_quota ? 0 : (editingRecord.remain_quota > 0 ? editingRecord.remain_quota / 500000 : 0),
        allow_ips: editingRecord.allow_ips,
        rpm_limit: editingRecord.rpm_limit || 60,
        tpm_limit: editingRecord.tpm_limit || null,
      });
    } else {
      setUnlimitedQuota(true); setQuotaValue(0);
      setExpiryEnabled(false); setExpiryPreset(30);
      setIpLimitEnabled(false); setRateLimitEnabled(false);
      form.resetFields();
      form.setFieldsValue({ unlimited_quota: true, expired_time: null });
    }
  };

  return (
    <Modal
      title={<Space><Tag color="blue" style={{ margin: 0 }}>{editingRecord ? '编辑' : '新建'}</Tag>{editingRecord ? t('apiKeys.editKey') : '创建新的令牌'}</Space>}
      open={visible} onOk={handleOk} onCancel={handleCancel}
      okText={<Space><span>提交</span></Space>} cancelText="取消"
      confirmLoading={submitting} destroyOnClose width={540}
      okButtonProps={{ icon: <span>💾</span> }} cancelButtonProps={{ icon: <span>✗</span> }}
      afterOpenChange={handleAfterOpen}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>

        {/* 基本信息 */}
        <div style={sectionStyle}>
          {sectionHeader('#1677ff', <KeyOutlined style={{ color: '#fff', fontSize: 13 }} />, '基本信息')}
          <div style={{ marginTop: 12 }}>
            <Form.Item
              label={<>名称 <span style={{ color: 'red' }}>*</span></>}
              name="name"
              rules={[{ required: true, message: '请输入名称' }]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="请输入令牌名称" />
            </Form.Item>
            <Form.Item label="令牌分组" name="group" style={{ marginBottom: 0 }}>
              <Select placeholder="请选择分组（可选）" options={groupOptions} allowClear showSearch />
            </Form.Item>
          </div>
        </div>

        {/* 密钥有效期 */}
        <div style={sectionStyle}>
          {sectionHeader(
            '#722ed1',
            <ClockCircleOutlined style={{ color: '#fff', fontSize: 13 }} />,
            '密钥有效期',
            <Switch checked={expiryEnabled} onChange={handleExpiryToggle} />
          )}
          {expiryEnabled && (
            <div style={{ marginTop: 12 }}>
              <Space size={6} style={{ marginBottom: 10 }}>
                {([7, 30, 90] as const).map((d) => (
                  <Button key={d} size="small" style={presetBtnStyle(expiryPreset === d)} onClick={() => applyPreset(d)}>{d} 天</Button>
                ))}
                <Button size="small" style={presetBtnStyle(expiryPreset === 'custom')} onClick={() => setExpiryPreset('custom')}>自定义</Button>
              </Space>
              <Form.Item name="expired_time" style={{ marginBottom: 4 }}>
                <DatePicker showTime style={{ width: '100%' }} placeholder="选择过期时间" onChange={() => setExpiryPreset('custom')} />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12 }}>选择此 API 密钥的过期时间。</Text>
            </div>
          )}
        </div>

        {/* 额度设置 */}
        <div style={sectionStyle}>
          {sectionHeader(
            '#52c41a',
            <SafetyOutlined style={{ color: '#fff', fontSize: 13 }} />,
            '额度设置',
          )}
          <div style={{ marginTop: 12 }}>
            <Form.Item name="quota" initialValue={0} style={{ marginBottom: 4 }}>
              <InputNumber min={0} style={{ width: '100%' }} onChange={(v) => setQuotaValue(v || 0)} />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12 }}>
              设置此密钥可消费的最大金额。0 = 无限制。
            </Text>
          </div>
          <Form.Item name="unlimited_quota" valuePropName="checked" initialValue={true} hidden><Switch /></Form.Item>
        </div>

        {/* 速率限制 */}
        <div style={sectionStyle}>
          {sectionHeader(
            '#fa8c16',
            <ThunderboltOutlined style={{ color: '#fff', fontSize: 13 }} />,
            '速率限制',
            <Switch checked={rateLimitEnabled} onChange={(v) => {
              setRateLimitEnabled(v);
              if (v) {
                // 开启时 rpm 默认 60
                if (!form.getFieldValue('rpm_limit')) form.setFieldValue('rpm_limit', 60);
              } else {
                form.setFieldValue('rpm_limit', null);
                form.setFieldValue('tpm_limit', null);
              }
            }} />
          )}
          {rateLimitEnabled && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                请求速率单位是"次/分钟"；Token 速率单位是"tok/min"，表示这把 Key 每分钟最多可消耗的总 Token 数（输入 + 输出）。
              </Text>
              <Flex gap={12}>
                <Form.Item
                  label="每分钟请求数（req/min）"
                  name="rpm_limit"
                  initialValue={60}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="Token 速率限制（tok/min）"
                    name="tpm_limit"
                    style={{ marginBottom: 4 }}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="留空表示不限，例如 120000" />
                  </Form.Item>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    单位是每分钟可消耗的总 Token 数，会同时覆盖输入和输出。
                  </Text>
                </div>
              </Flex>
            </div>
          )}
        </div>

        {/* IP 限制 */}
        <div style={{ ...sectionStyle, marginBottom: 0 }}>
          {sectionHeader(
            '#722ed1',
            <LockOutlined style={{ color: '#fff', fontSize: 13 }} />,
            'IP 限制',
            <Switch checked={ipLimitEnabled} onChange={(v) => { setIpLimitEnabled(v); if (!v) form.setFieldValue('allow_ips', ''); }} />
          )}
          {ipLimitEnabled && (
            <div style={{ marginTop: 12 }}>
              <Form.Item name="allow_ips" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={3} placeholder="允许的IP，一行一个，不填写则不限制" />
              </Form.Item>
            </div>
          )}
        </div>

      </Form>
    </Modal>
  );
}
