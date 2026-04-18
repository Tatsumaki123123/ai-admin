import { useState } from 'react';
import { Modal, Button, Space, Form, Input, Select } from 'antd';
import type { ApiKeyItem } from '../types';

interface Props {
  visible: boolean;
  record: ApiKeyItem | null;
  models: string[];
  apiBase: string;
  onClose: () => void;
}

const APP_LIST = ['Claude', 'Codex', 'Gemini'] as const;
type AppType = 'claude' | 'codex' | 'gemini';

export function CCSwitchModal({
  visible,
  record,
  models,
  apiBase,
  onClose,
}: Props) {
  const [ccApp, setCCApp] = useState<AppType>('claude');
  const [form] = Form.useForm();

  const modelOptions = models.map((m) => ({ label: m, value: m }));

  const handleOpen = async () => {
    try {
      const values = await form.validateFields();
      const key = record!.key.startsWith('sk-') ? record!.key : `sk-${record!.key}`;
      const endpoint = ccApp === 'codex' ? `${apiBase}/v1` : apiBase;
      const params = new URLSearchParams();
      params.set('resource', 'provider');
      params.set('app', ccApp);
      params.set('name', values.name || 'ApeCode');
      params.set('endpoint', endpoint);
      params.set('apiKey', key);
      const mainModel =
        values.main_model || values.codex_model || values.gemini_model;
      if (mainModel) params.set('model', mainModel);
      if (values.haiku_model) params.set('haikuModel', values.haiku_model);
      if (values.sonnet_model) params.set('sonnetModel', values.sonnet_model);
      if (values.opus_model) params.set('opusModel', values.opus_model);
      params.set('homepage', apiBase);
      params.set('enabled', 'true');
      window.open(`ccswitch://v1/import?${params.toString()}`);
      onClose();
    } catch {
      /* validation failed */
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleAppChange = (app: AppType) => {
    setCCApp(app);
    form.resetFields([
      'main_model',
      'haiku_model',
      'sonnet_model',
      'opus_model',
      'codex_model',
      'gemini_model',
    ]);
  };

  if (!record) return null;

  return (
    <Modal
      title="填入 CC Switch"
      open={visible}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleOpen}>
            打开 CC Switch
          </Button>
        </Space>
      }
      width={500}
      destroyOnClose
      afterOpenChange={(open) => {
        if (open) {
          setCCApp('claude');
          form.resetFields();
          form.setFieldsValue({ name: record.name || 'ApeCode' });
        }
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="应用" style={{ marginBottom: 16 }}>
          <Space>
            {APP_LIST.map((app) => (
              <Button
                key={app}
                size="small"
                type={ccApp === app.toLowerCase() ? 'primary' : 'default'}
                onClick={() => handleAppChange(app.toLowerCase() as AppType)}
              >
                {app}
              </Button>
            ))}
          </Space>
        </Form.Item>

        <Form.Item label="名称" name="name" style={{ marginBottom: 12 }}>
          <Input />
        </Form.Item>

        {ccApp === 'claude' && (
          <>
            <Form.Item
              label={
                <>
                  主模型 <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="main_model"
              rules={[{ required: true, message: '请选择主模型' }]}
              style={{ marginBottom: 12 }}
            >
              <Select
                placeholder="请选择模型"
                options={modelOptions}
                showSearch
                allowClear
              />
            </Form.Item>
            <Form.Item
              label="Haiku 模型"
              name="haiku_model"
              style={{ marginBottom: 12 }}
            >
              <Select
                placeholder="请选择模型"
                options={modelOptions}
                showSearch
                allowClear
              />
            </Form.Item>
            <Form.Item
              label="Sonnet 模型"
              name="sonnet_model"
              style={{ marginBottom: 12 }}
            >
              <Select
                placeholder="请选择模型"
                options={modelOptions}
                showSearch
                allowClear
              />
            </Form.Item>
            <Form.Item
              label="Opus 模型"
              name="opus_model"
              style={{ marginBottom: 4 }}
            >
              <Select
                placeholder="请选择模型"
                options={modelOptions}
                showSearch
                allowClear
              />
            </Form.Item>
          </>
        )}

        {ccApp === 'codex' && (
          <Form.Item
            label={
              <>
                主模型 <span style={{ color: 'red' }}>*</span>
              </>
            }
            name="codex_model"
            rules={[{ required: true, message: '请选择模型' }]}
            style={{ marginBottom: 4 }}
          >
            <Select
              placeholder="请选择模型"
              options={modelOptions}
              showSearch
              allowClear
            />
          </Form.Item>
        )}

        {ccApp === 'gemini' && (
          <Form.Item
            label={
              <>
                主模型 <span style={{ color: 'red' }}>*</span>
              </>
            }
            name="gemini_model"
            rules={[{ required: true, message: '请选择模型' }]}
            style={{ marginBottom: 4 }}
          >
            <Select
              placeholder="请选择模型"
              options={modelOptions}
              showSearch
              allowClear
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
