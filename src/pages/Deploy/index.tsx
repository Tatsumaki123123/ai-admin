import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Input,
  Typography,
  Button,
  Tabs,
  message,
  Flex,
  Tag,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import type { RootState } from '../../redux/store';

const { Text, Title, Paragraph } = Typography;

interface ApiKeyItem {
  id: number;
  key: string;
  name: string;
  group: string;
  status: number;
}

interface ApiResponse {
  items: ApiKeyItem[];
}

const API_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string) || 'https://ai.apecode.site'
)
  .replace(/\/$/, '')
  .replace('http://localhost:5174', window.location.origin);

const OS_TABS = [
  { key: 'unix', label: 'macOS / Linux / WSL' },
  { key: 'windows', label: 'Windows' },
];

function buildClaudeCommand(key: string, base: string, os: string) {
  if (os === 'unix') {
    return `CLAUDE_TOKEN="${key}" CLAUDE_API_URL="${base}" bash -c "$(curl -fsSL ${base}/install.sh)"`;
  }
  return `$env:CLAUDE_TOKEN="${key}"; $env:CLAUDE_API_URL="${base}"; iwr -useb ${base}/install.ps1 | iex`;
}

function buildOpenClawCommand(key: string, base: string, os: string) {
  if (os === 'unix') {
    return `OPENCLAW_API_KEY="${key}" OPENCLAW_BASE_URL="${base}" bash -c "$(curl -fsSL ${base}/openclaw-install.sh)"`;
  }
  return `$env:OPENCLAW_API_KEY="${key}"; $env:OPENCLAW_BASE_URL="${base}"; iwr -useb ${base}/openclaw-install.ps1 | iex`;
}

function CodeBlock({ content }: { content: string; isDark?: boolean }) {
  const handleCopy = () =>
    navigator.clipboard
      .writeText(content)
      .then(() => message.success('已复制'));

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: 6,
          padding: '16px 56px 16px 16px',
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#d4d4d4',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          overflowX: 'auto',
          minHeight: 56,
          lineHeight: 1.7,
        }}
      >
        {content}
      </div>
      <Button
        size="small"
        onClick={handleCopy}
        style={{ position: 'absolute', top: 10, right: 10 }}
      >
        复制
      </Button>
    </div>
  );
}

export const DeployPage = () => {
  usePageHeader({
    title: '一键部署',
    description: '按 API Key 一键生成 Claude Code 与 OpenClaw 部署命令。',
  });
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApiKeyItem | null>(null);
  const [app, setApp] = useState<'claude' | 'openclaw'>('claude');
  const [os, setOs] = useState<'unix' | 'windows'>('unix');

  const fetchKeys = useCallback(async () => {
    try {
      const data = await apiClient.get<ApiResponse>('/token/', {
        params: { p: 1, size: 100 },
      });
      const items = data?.items || [];
      setKeys(items);
      if (items.length > 0) setSelected(items[0]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const filtered = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.key.toLowerCase().includes(search.toLowerCase()) ||
      (k.group || '').toLowerCase().includes(search.toLowerCase())
  );

  const command = selected
    ? app === 'claude'
      ? buildClaudeCommand(selected.key, API_BASE, os)
      : buildOpenClawCommand(selected.key, API_BASE, os)
    : '';

  const itemBg = (active: boolean) =>
    active ? (isDark ? 'rgba(22,119,255,0.15)' : '#e6f4ff') : 'transparent';

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e8e8e8';

  return (
    <Flex gap={16} style={{ height: '100%' }} align="stretch">
      {/* ── Left: key list ── */}
      <Card
        style={{ width: 280, flexShrink: 0 }}
        styles={{ body: { padding: 16 } }}
      >
        <Title level={5} style={{ marginBottom: 4 }}>
          选择 API Key
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
          左侧选择要部署到客户端中的 API Key，右侧会实时生成对应命令。
        </Paragraph>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索密钥名称、分组或 Key"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 12 }}
          allowClear
        />
        <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              暂无可用密钥
            </Text>
          )}
          {filtered.map((k) => {
            const active = selected?.id === k.id;
            return (
              <div
                key={k.id}
                onClick={() => setSelected(k)}
                style={{
                  background: itemBg(active),
                  border: `1px solid ${active ? '#1677ff' : borderColor}`,
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Flex justify="space-between" align="center">
                  <Text strong style={{ fontSize: 13 }}>
                    {k.name}
                  </Text>
                  {k.group && (
                    <Tag color="orange" style={{ fontSize: 11, margin: 0 }}>
                      {k.group}
                    </Tag>
                  )}
                </Flex>
                <Text
                  type="secondary"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    marginTop: 2,
                    display: 'block',
                  }}
                >
                  {k.key}
                </Text>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Right: command panel ── */}
      <Card style={{ flex: 1 }} styles={{ body: { padding: 24 } }}>
        {!selected ? (
          <Flex align="center" justify="center" style={{ height: 200 }}>
            <Text type="secondary">请先从左侧选择一个 API Key</Text>
          </Flex>
        ) : (
          <>
            <Title level={5} style={{ marginBottom: 4 }}>
              {selected.name}
            </Title>
            {selected.group && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                当前分组：
                <Tag color="orange" style={{ fontSize: 12 }}>
                  {selected.group}
                </Tag>
              </Text>
            )}

            {/* App selector */}
            <Flex gap={16} style={{ margin: '16px 0' }}>
              {(
                [
                  {
                    key: 'claude',
                    label: 'Claude Code',
                    desc: '安装官方 Claude Code CLI，并写入当前密钥配置。',
                  },
                  {
                    key: 'openclaw',
                    label: 'OpenClaw',
                    desc: '安装官方 OpenClaw，并把当前密钥设为默认认证。',
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  onClick={() => setApp(item.key)}
                  style={{
                    flex: 1,
                    border: `1.5px solid ${
                      app === item.key ? '#13c2c2' : borderColor
                    }`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background:
                      app === item.key
                        ? isDark
                          ? 'rgba(19,194,194,0.08)'
                          : '#e6fffb'
                        : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <Text
                    strong
                    style={{ color: app === item.key ? '#13c2c2' : undefined }}
                  >
                    {item.label}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.desc}
                  </Text>
                </div>
              ))}
            </Flex>

            {/* OS tabs */}
            <Tabs
              activeKey={os}
              onChange={(k) => setOs(k as any)}
              items={OS_TABS}
              style={{ marginBottom: 12 }}
            />

            {/* Command */}
            <div
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa',
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 8 }}
              >
                <div>
                  <Text strong style={{ fontSize: 13 }}>
                    一键命令
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {app === 'claude' ? 'Claude Code' : 'OpenClaw'} ·{' '}
                    {os === 'unix' ? 'macOS / Linux / WSL' : 'Windows'}
                  </Text>
                </div>
              </Flex>
              <CodeBlock content={command} isDark={isDark} />
            </div>

            {/* Info */}
            <div
              style={{
                background: isDark ? 'rgba(22,119,255,0.08)' : '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                padding: '10px 14px',
              }}
            >
              <Text style={{ fontSize: 12, color: '#3b82f6' }}>
                {app === 'claude'
                  ? 'ℹ Claude Code 脚本安装的是官方 @anthropic-ai/claude-code 包，包下载优先使用 npmmirror。安装后建议重新打开终端再执行 claude。'
                  : 'ℹ OpenClaw 安装脚本会自动配置 API Key 与代理地址，安装后可直接运行 openclaw 命令。'}
              </Text>
            </div>
          </>
        )}
      </Card>
    </Flex>
  );
};
