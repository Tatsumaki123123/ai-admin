import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Table } from 'antd';
import {
  CheckOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import logoImg from '../../assets/logo.png';
import { LandingNav } from '../../components/LandingNav';

const { Text } = Typography;

const PRIMARY = '#da7658';
const DARK_BG = '#0a0a0a';
const CARD_BG = '#111111';
const BORDER = 'rgba(255,255,255,0.08)';
const MUTED = 'rgba(255,255,255,0.45)';

/* ─── paygo card ─────────────────────────────────────────── */
interface PaygoCardProps {
  name: string;
  desc: string;
  price: number;
  usd: number;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

const PaygoCard = ({ name, desc, price, usd, features, highlight, badge }: PaygoCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: highlight ? `linear-gradient(135deg, ${PRIMARY}18, ${CARD_BG})` : CARD_BG,
        border: `1px solid ${highlight ? PRIMARY : BORDER}`,
        borderRadius: 16,
        padding: '24px 20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${PRIMARY}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* discount badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          background: '#52c41a22',
          border: '1px solid #52c41a55',
          color: '#52c41a',
          marginBottom: 10,
          width: 'fit-content',
        }}
      >
        省86%
      </div>
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '2px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: PRIMARY,
            color: '#fff',
          }}
        >
          {badge}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>{desc}</div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: '#fff' }}>¥{price}</span>
      </div>
      <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>${usd} USD 额度</div>
      <div style={{ flex: 1, marginBottom: 20 }}>
        {features.map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckOutlined style={{ color: PRIMARY, fontSize: 12, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/purchase')}
        style={{
          width: '100%',
          padding: '9px 0',
          borderRadius: 8,
          border: highlight ? 'none' : `1px solid ${BORDER}`,
          background: highlight ? PRIMARY : 'transparent',
          color: highlight ? '#fff' : 'rgba(255,255,255,0.7)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.8')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
      >
        立即充值
      </button>
    </div>
  );
};

/* ─── subscription card ──────────────────────────────────── */
interface SubCardProps {
  name: string;
  desc: string;
  price: number;
  dailyUsd: number;
  monthlyUsd: number;
  rate: string;
  discount: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

const SubCard = ({ name, desc, price, dailyUsd, monthlyUsd, rate, discount, features, highlight, badge }: SubCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: highlight ? `linear-gradient(135deg, ${PRIMARY}18, ${CARD_BG})` : CARD_BG,
        border: `1px solid ${highlight ? PRIMARY : BORDER}`,
        borderRadius: 16,
        padding: '24px 20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${PRIMARY}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          background: '#1677ff22',
          border: '1px solid #1677ff55',
          color: '#1677ff',
          marginBottom: 10,
          width: 'fit-content',
        }}
      >
        {discount}
      </div>
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '2px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: PRIMARY,
            color: '#fff',
          }}
        >
          {badge}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>{desc}</div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: '#fff' }}>¥{price}</span>
        <span style={{ color: MUTED, fontSize: 13, marginLeft: 4 }}>/月</span>
      </div>
      {/* stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          marginBottom: 20,
          padding: '12px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 10,
        }}
      >
        {[
          { label: '每日额度', value: `$${dailyUsd}` },
          { label: '月总额度', value: `$${monthlyUsd}` },
          { label: '折合', value: `¥${rate}/USD` },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, marginBottom: 20 }}>
        {features.map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckOutlined style={{ color: PRIMARY, fontSize: 12, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/purchase')}
        style={{
          width: '100%',
          padding: '9px 0',
          borderRadius: 8,
          border: highlight ? 'none' : `1px solid ${BORDER}`,
          background: highlight ? PRIMARY : 'transparent',
          color: highlight ? '#fff' : 'rgba(255,255,255,0.7)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.8')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
      >
        立即订阅
      </button>
    </div>
  );
};


/* ─── main page ──────────────────────────────────────────── */
export const PricingPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'paygo' | 'subscription'>('paygo');

  const paygoPlans: PaygoCardProps[] = [
    { name: '体验', desc: '适合初次体验', price: 20, usd: 20, features: ['$20 额度', '永不过期', '支持全部模型'] },
    { name: '基础', desc: '日常轻度使用', price: 50, usd: 50, features: ['$50 额度', '永不过期', '支持全部模型'] },
    { name: '标准', desc: '开发者常用', price: 100, usd: 100, features: ['$100 额度', '永不过期', '支持全部模型'], highlight: true, badge: '热门' },
    { name: '进阶', desc: '高频使用', price: 500, usd: 500, features: ['$500 额度', '永不过期', '支持全部模型'] },
    { name: '专业', desc: '专业开发者', price: 1000, usd: 1000, features: ['$1000 额度', '永不过期', '支持全部模型'] },
    { name: '企业', desc: '企业级用量', price: 5000, usd: 5000, features: ['$5000 额度', '永不过期', '支持全部模型', '优先支持'] },
  ];

  const subPlans: SubCardProps[] = [
    { name: '入门版', desc: '个人开发者、日常编程辅助', price: 199, dailyUsd: 15, monthlyUsd: 450, rate: '0.44', discount: '0.6折', features: ['$15/天额度', '每日刷新', '支持全部模型', '≈ 0.44 ¥/USD'], badge: '入门' },
    { name: '轻量版', desc: '个人开发者、日常编程辅助', price: 339, dailyUsd: 30, monthlyUsd: 900, rate: '0.38', discount: '0.5折', features: ['$30/天额度', '每日刷新', '支持全部模型', '≈ 0.38 ¥/USD'] },
    { name: '标准版', desc: '重度代码编写、长文档分析', price: 499, dailyUsd: 50, monthlyUsd: 1500, rate: '0.33', discount: '0.5折', features: ['$50/天额度', '每日刷新', '支持全部模型', '≈ 0.33 ¥/USD'], highlight: true, badge: '推荐' },
    { name: '高级版', desc: '全职独立开发者、AI 极客', price: 1188, dailyUsd: 120, monthlyUsd: 3600, rate: '0.33', discount: '0.5折', features: ['$120/天额度', '每日刷新', '支持全部模型', '≈ 0.33 ¥/USD'], badge: '进阶' },
    { name: '团队版', desc: '极高频用户、小型工作室', price: 1888, dailyUsd: 200, monthlyUsd: 6000, rate: '0.31', discount: '0.4折', features: ['$200/天额度', '每日刷新', '支持全部模型', '≈ 0.31 ¥/USD'], badge: '团队' },
    { name: '商业版', desc: '资深高频用户、中大型工作室', price: 4688, dailyUsd: 500, monthlyUsd: 15000, rate: '0.31', discount: '0.4折', features: ['$500/天额度', '每日刷新', '支持全部模型', '≈ 0.31 ¥/USD'] },
    { name: '企业版', desc: '资深高频用户、中大型工作室', price: 9188, dailyUsd: 1000, monthlyUsd: 30000, rate: '0.31', discount: '0.4折', features: ['$1000/天额度', '每日刷新', '支持全部模型', '≈ 0.31 ¥/USD'], badge: '旗舰' },
  ];

  interface ModelRow { model: string; provider: string; input: string; output: string; cacheWrite?: string; cacheRead?: string; }
  const models: ModelRow[] = [
    { model: 'Claude Opus 4.6', provider: 'Anthropic', input: '$5', output: '$25', cacheWrite: '$6.25', cacheRead: '$0.5' },
    { model: 'Claude Opus 4.5', provider: 'Anthropic', input: '$5', output: '$25', cacheWrite: '$6.25', cacheRead: '$0.5' },
    { model: 'Claude Sonnet 4.6', provider: 'Anthropic', input: '$3', output: '$15', cacheWrite: '$3.75', cacheRead: '$0.3' },
    { model: 'Claude Sonnet 4.5', provider: 'Anthropic', input: '$3', output: '$15', cacheWrite: '$3.75', cacheRead: '$0.3' },
    { model: 'Claude Haiku 4.5', provider: 'Anthropic', input: '$0.8', output: '$4', cacheWrite: '$1', cacheRead: '$0.08' },
    { model: 'GPT-5.4', provider: 'OpenAI', input: '$5', output: '$15', cacheWrite: '—', cacheRead: '—' },
    { model: 'GPT-5', provider: 'OpenAI', input: '$5', output: '$15', cacheWrite: '—', cacheRead: '—' },
    { model: 'GPT-5 Mini', provider: 'OpenAI', input: '$1.5', output: '$6', cacheWrite: '—', cacheRead: '—' },
    { model: 'GPT-4o', provider: 'OpenAI', input: '$2.5', output: '$10', cacheWrite: '—', cacheRead: '—' },
    { model: 'o3', provider: 'OpenAI', input: '$10', output: '$40', cacheWrite: '—', cacheRead: '—' },
    { model: 'o3-pro', provider: 'OpenAI', input: '$20', output: '$80', cacheWrite: '—', cacheRead: '—' },
    { model: 'o4-mini', provider: 'OpenAI', input: '$1.1', output: '$4.4', cacheWrite: '—', cacheRead: '—' },
    { model: 'Codex Mini', provider: 'OpenAI', input: '$1.5', output: '$6', cacheWrite: '—', cacheRead: '—' },
  ];

  const modelColumns: ColumnsType<ModelRow> = [
    {
      title: '模型',
      key: 'model',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: r.provider === 'Anthropic' ? `${PRIMARY}22` : 'rgba(22,119,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              color: r.provider === 'Anthropic' ? PRIMARY : '#1677ff',
              flexShrink: 0,
            }}
          >
            {r.provider === 'Anthropic' ? 'A' : 'O'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{r.model}</div>
            <div style={{ fontSize: 12, color: MUTED }}>{r.provider}</div>
          </div>
        </div>
      ),
    },
    { title: '输入 /MTok', dataIndex: 'input', key: 'input', align: 'right', render: (v) => <Text style={{ color: '#52c41a', fontWeight: 600 }}>{v}</Text> },
    { title: '输出 /MTok', dataIndex: 'output', key: 'output', align: 'right', render: (v) => <Text style={{ color: '#fa8c16', fontWeight: 600 }}>{v}</Text> },
    { title: '缓存写入 /MTok', dataIndex: 'cacheWrite', key: 'cacheWrite', align: 'right', render: (v) => <Text style={{ color: v === '—' ? MUTED : '#fff' }}>{v}</Text> },
    { title: '缓存读取 /MTok', dataIndex: 'cacheRead', key: 'cacheRead', align: 'right', render: (v) => <Text style={{ color: v === '—' ? MUTED : '#fff' }}>{v}</Text> },
  ];

  const vipLevels = [
    { level: '普通', multiplier: '1x', threshold: '注册即享', discount: '—' },
    { level: 'VIP1', multiplier: '0.98x', threshold: '¥299', discount: '2%' },
    { level: 'VIP2', multiplier: '0.95x', threshold: '¥1299', discount: '5%' },
    { level: 'VIP3', multiplier: '0.93x', threshold: '¥2999', discount: '7%' },
    { level: 'VIP5', multiplier: '0.9x', threshold: '¥5999', discount: '10%' },
    { level: 'VIP8', multiplier: '0.88x', threshold: '¥9999', discount: '12%' },
  ];

  const sectionTitle = (badge: string, title: string, sub?: string) => (
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: `${PRIMARY}22`, border: `1px solid ${PRIMARY}55`, color: PRIMARY, marginBottom: 14 }}>
        {badge}
      </div>
      <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.25 }}>{title}</h2>
      {sub && <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ background: DARK_BG, minHeight: '100vh', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <LandingNav />

      {/* ── HERO ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px 56px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: `${PRIMARY}22`, border: `1px solid ${PRIMARY}55`, color: PRIMARY, marginBottom: 20 }}>
            透明定价
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            透明定价，按需选择
          </h1>
          <p style={{ color: MUTED, fontSize: 16, margin: 0 }}>
            PAYGO 按量付费 + 月卡订阅，满足不同场景需求
          </p>
        </div>
      </section>

      {/* ── TAB SWITCH ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48, padding: '0 24px' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 4, gap: 4 }}>
          {([
            { key: 'paygo', label: '按量付费', icon: <ThunderboltOutlined /> },
            { key: 'subscription', label: '月卡订阅', icon: <StarOutlined /> },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 24px',
                borderRadius: 8,
                border: 'none',
                background: tab === t.key ? PRIMARY : 'transparent',
                color: tab === t.key ? '#fff' : MUTED,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PAYGO PLANS ── */}
      {tab === 'paygo' && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {sectionTitle('按量付费 (Pay-As-You-Go)', '按量付费', '1 RMB = 1 USD 额度 · 永不过期')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {paygoPlans.map((p) => <PaygoCard key={p.name} {...p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── SUBSCRIPTION PLANS ── */}
      {tab === 'subscription' && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {sectionTitle('月卡订阅', '月卡订阅', '每日固定额度，每日刷新，性价比更高')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {subPlans.map((p) => <SubCard key={p.name} {...p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── MODEL PRICING ── */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {sectionTitle('模型定价明细', '模型定价明细', '按 Token 计费，用多少付多少')}
          <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            <Table<ModelRow>
              columns={modelColumns}
              dataSource={models}
              rowKey="model"
              pagination={false}
              style={{ background: 'transparent' }}
            />
          </div>
        </div>
      </section>

      {/* ── VIP ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {sectionTitle('VIP 等级', 'VIP 等级', '累计消费越多，倍率越优惠')}

          {/* VIP cards row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
            {vipLevels.map((v, i) => (
              <div
                key={v.level}
                style={{
                  background: i === vipLevels.length - 1 ? `linear-gradient(135deg, ${PRIMARY}22, ${CARD_BG})` : CARD_BG,
                  border: `1px solid ${i === vipLevels.length - 1 ? PRIMARY : BORDER}`,
                  borderRadius: 12,
                  padding: '16px 20px',
                  textAlign: 'center',
                  minWidth: 110,
                  flex: '1 1 110px',
                  maxWidth: 160,
                }}
              >
                <div style={{ marginBottom: 6 }}>
                  <CrownOutlined style={{ color: i === 0 ? MUTED : PRIMARY, fontSize: 18 }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{v.level}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: i === 0 ? MUTED : PRIMARY, marginBottom: 4 }}>{v.multiplier}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{v.threshold}</div>
              </div>
            ))}
          </div>

          {/* VIP table */}
          <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            <Table
              columns={[
                { title: '等级', dataIndex: 'level', key: 'level', render: (v) => <Text style={{ fontWeight: 600, color: '#fff' }}>{v}</Text> },
                { title: '倍率', dataIndex: 'multiplier', key: 'multiplier', render: (v) => <Text style={{ color: PRIMARY, fontWeight: 700 }}>{v}</Text> },
                { title: '累计消费门槛', dataIndex: 'threshold', key: 'threshold', render: (v) => <Text style={{ color: MUTED }}>{v}</Text> },
                { title: '折扣', dataIndex: 'discount', key: 'discount', render: (v) => <Text style={{ color: v === '—' ? MUTED : '#52c41a', fontWeight: 600 }}>{v}</Text> },
              ]}
              dataSource={vipLevels}
              rowKey="level"
              pagination={false}
              style={{ background: 'transparent' }}
            />
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE ── */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d' }}>
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            textAlign: 'center',
            background: `radial-gradient(ellipse at center, ${PRIMARY}18 0%, transparent 70%)`,
            padding: '60px 32px',
            borderRadius: 24,
            border: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 16 }}>🏢</div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
            企业定制方案
          </h2>
          <p style={{ color: MUTED, fontSize: 15, marginBottom: 32 }}>
            支持企业对公转账、开具发票、定制 API 部署
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.open('mailto:support@apecode.ai')}
              style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: PRIMARY, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              联系我们
            </button>
            <button
              onClick={() => navigate('/purchase')}
              style={{ padding: '10px 28px', borderRadius: 10, border: `1px solid ${BORDER}`, background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}
            >
              查看个人方案
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '32px 24px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={logoImg} alt="logo" style={{ width: 24, height: 24, borderRadius: 6 }} />
            <Text style={{ color: MUTED, fontSize: 13 }}>© 2026 ApeCode. All rights reserved.</Text>
          </div>
          <Text style={{ color: MUTED, fontSize: 13 }}>Made with ❤️ by ApeCode Team</Text>
        </div>
      </footer>
    </div>
  );
};
