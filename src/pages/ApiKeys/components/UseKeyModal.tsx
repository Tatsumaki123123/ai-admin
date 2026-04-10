import { useState } from 'react';
import { Modal, Button, Flex, Tabs, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { message } from 'antd';
import type { ApiKeyItem } from '../types';

const { Text } = Typography;

interface Props {
  visible: boolean;
  record: ApiKeyItem | null;
  apiBase: string;
  isDark: boolean;
  onClose: () => void;
}

const OS_ITEMS = [
  { key: 'macos', label: 'macOS / Linux' },
  { key: 'windows', label: 'Windows CMD' },
  { key: 'powershell', label: 'PowerShell' },
];

function CodeBlock({
  label,
  content,
  isDark,
}: {
  label: string;
  content: string;
  isDark: boolean;
}) {
  const codeBlockStyle: React.CSSProperties = {
    background: isDark ? '#1a1a1a' : '#1e1e1e',
    borderRadius: 6,
    padding: '12px 14px',
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#d4d4d4',
    whiteSpace: 'pre',
    overflowX: 'auto',
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 6 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {label}
        </Text>
        <Button
          size="small"
          icon={<CopyOutlined />}
          onClick={() =>
            navigator.clipboard
              .writeText(content)
              .then(() => message.success('已复制'))
          }
        >
          复制
        </Button>
      </Flex>
      <div style={codeBlockStyle}>{content}</div>
    </div>
  );
}

export function UseKeyModal({
  visible,
  record,
  apiBase,
  isDark,
  onClose,
}: Props) {
  const [app, setApp] = useState<'claude' | 'opencode'>('claude');
  const [os, setOs] = useState<'macos' | 'windows' | 'powershell'>('macos');

  if (!record) return null;

  const key = record.key;
  const base = apiBase;

  const claudeTerminal: Record<string, string> = {
    macos: `export ANTHROPIC_BASE_URL="${base}"\nexport ANTHROPIC_AUTH_TOKEN="${key}"\nexport CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`,
    windows: `set ANTHROPIC_BASE_URL=${base}\nset ANTHROPIC_AUTH_TOKEN=${key}\nset CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`,
    powershell: `$env:ANTHROPIC_BASE_URL="${base}"\n$env:ANTHROPIC_AUTH_TOKEN="${key}"\n$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`,
  };

  const claudeSettingsJson = JSON.stringify(
    {
      env: {
        ANTHROPIC_BASE_URL: base,
        ANTHROPIC_AUTH_TOKEN: key,
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
        CLAUDE_CODE_ATTRIBUTION_HEADER: '0',
      },
    },
    null,
    2
  );

  const opencodeTerminal: Record<string, string> = {
    macos: `export OPENAI_BASE_URL="${base}"\nexport OPENAI_API_KEY="${key}"`,
    windows: `set OPENAI_BASE_URL=${base}\nset OPENAI_API_KEY=${key}`,
    powershell: `$env:OPENAI_BASE_URL="${base}"\n$env:OPENAI_API_KEY="${key}"`,
  };

  const infoBox = (
    <div
      style={{
        background: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 6,
        padding: '10px 12px',
      }}
    >
      <Text style={{ fontSize: 12, color: '#3b82f6' }}>
        ℹ 这些环境变量将在当前终端会话中生效。如需永久配置，请将其添加到
        ~/.bashrc、~/.zshrc 或相应的配置文件中。
      </Text>
    </div>
  );

  return (
    <Modal
      title="使用 API 密钥"
      open={visible}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={620}
      destroyOnClose
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        将以下环境变量添加到您的终端配置文件或直接在终端中运行。
      </Text>

      {/* API Key display */}
      <Flex
        align="center"
        gap={8}
        style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0'}`,
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 16,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
          API 密钥
        </Text>
        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            flex: 1,
            wordBreak: 'break-all',
          }}
        >
          {key}
        </Text>
        <Button
          size="small"
          icon={<CopyOutlined />}
          onClick={() =>
            navigator.clipboard
              .writeText(key)
              .then(() => message.success('已复制'))
          }
        />
      </Flex>

      <Tabs
        activeKey={app}
        onChange={(k) => setApp(k as any)}
        items={[
          {
            key: 'claude',
            label: 'Claude Code',
            children: (
              <div>
                <Tabs
                  size="small"
                  activeKey={os}
                  onChange={(k) => setOs(k as any)}
                  items={OS_ITEMS}
                  style={{ marginBottom: 12 }}
                />
                <CodeBlock
                  isDark={isDark}
                  label="Terminal"
                  content={claudeTerminal[os]}
                />
                <Text
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    color: '#f59e0b',
                    fontWeight: 500,
                  }}
                >
                  VSCode Claude Code
                </Text>
                <CodeBlock
                  isDark={isDark}
                  label="~/.claude/settings.json"
                  content={claudeSettingsJson}
                />
                {infoBox}
              </div>
            ),
          },
          {
            key: 'opencode',
            label: 'OpenCode',
            children: (
              <div>
                <Tabs
                  size="small"
                  activeKey={os}
                  onChange={(k) => setOs(k as any)}
                  items={OS_ITEMS}
                  style={{ marginBottom: 12 }}
                />
                <CodeBlock
                  isDark={isDark}
                  label="Terminal"
                  content={opencodeTerminal[os]}
                />
                {infoBox}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
