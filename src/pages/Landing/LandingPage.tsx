import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Collapse } from 'antd';
import {
  CheckOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  RocketOutlined,
  DollarOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import logoImg from '../../assets/logo.png';
import { LandingNav } from '../../components/LandingNav';

const { Text } = Typography;

const PRIMARY = '#da7658';
const DARK_BG = '#0a0a0a';
const CARD_BG = '#111111';
const BORDER = 'rgba(255,255,255,0.08)';
const MUTED = 'rgba(255,255,255,0.45)';

/* ─── tiny helpers ─────────────────────────────────────── */
const Tag = ({
  children,
  color = PRIMARY,
}: {
  children: string;
  color?: string;
}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: `${color}22`,
      border: `1px solid ${color}55`,
      color,
      marginRight: 6,
      marginBottom: 4,
    }}
  >
    {children}
  </span>
);

const SectionTitle = ({
  badge,
  title,
  sub,
}: {
  badge?: string;
  title: string;
  sub?: string;
}) => (
  <div style={{ textAlign: 'center', marginBottom: 56 }}>
    {badge && (
      <div
        style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          background: `${PRIMARY}22`,
          border: `1px solid ${PRIMARY}55`,
          color: PRIMARY,
          marginBottom: 16,
        }}
      >
        {badge}
      </div>
    )}
    <h2
      style={{
        fontSize: 'clamp(24px, 4vw, 36px)',
        fontWeight: 700,
        color: '#fff',
        margin: '0 0 12px',
        lineHeight: 1.25,
      }}
    >
      {title}
    </h2>
    {sub && (
      <p style={{ color: MUTED, fontSize: 16, margin: 0, maxWidth: 560, marginInline: 'auto' }}>
        {sub}
      </p>
    )}
  </div>
);

/* ─── model card ───────────────────────────────────────── */
const ModelCard = ({
  provider,
  name,
  desc,
  tags,
  inputPrice,
  outputPrice,
  highlight,
}: {
  provider: string;
  name: string;
  desc: string;
  tags: string[];
  inputPrice: string;
  outputPrice: string;
  highlight?: boolean;
}) => (
  <div
    style={{
      background: highlight ? `linear-gradient(135deg, ${PRIMARY}18, ${CARD_BG})` : CARD_BG,
      border: `1px solid ${highlight ? PRIMARY + '55' : BORDER}`,
      borderRadius: 16,
      padding: '24px',
      position: 'relative',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${PRIMARY}22`;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
    }}
  >
    <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{provider}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{name}</div>
    <div style={{ fontSize: 14, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>{desc}</div>
    <div style={{ marginBottom: 16 }}>
      {tags.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </div>
    <div
      style={{
        display: 'flex',
        gap: 16,
        paddingTop: 16,
        borderTop: `1px solid ${BORDER}`,
        fontSize: 13,
      }}
    >
      <div>
        <div style={{ color: MUTED, marginBottom: 2 }}>输入</div>
        <div style={{ color: '#fff', fontWeight: 600 }}>{inputPrice}</div>
      </div>
      <div>
        <div style={{ color: MUTED, marginBottom: 2 }}>输出</div>
        <div style={{ color: '#fff', fontWeight: 600 }}>{outputPrice}</div>
      </div>
    </div>
  </div>
);

/* ─── pricing card ─────────────────────────────────────── */
const PricingCard = ({
  name,
  price,
  unit,
  desc,
  features,
  highlight,
  badge,
}: {
  name: string;
  price: string;
  unit?: string;
  desc: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: highlight ? `linear-gradient(135deg, ${PRIMARY}22, ${CARD_BG})` : CARD_BG,
        border: `1px solid ${highlight ? PRIMARY : BORDER}`,
        borderRadius: 20,
        padding: '32px 28px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: PRIMARY,
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            padding: '3px 14px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
          }}
        >
          {badge}
        </div>
      )}
      <div style={{ fontSize: 14, color: MUTED, marginBottom: 8 }}>{name}</div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{price}</span>
        {unit && <span style={{ color: MUTED, fontSize: 14, marginLeft: 4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>{desc}</div>
      <div style={{ flex: 1, marginBottom: 28 }}>
        {features.map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
            <CheckOutlined style={{ color: PRIMARY, fontSize: 13, marginTop: 2, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/auth/signup')}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 10,
          border: highlight ? 'none' : `1px solid ${BORDER}`,
          background: highlight ? PRIMARY : 'transparent',
          color: highlight ? '#fff' : 'rgba(255,255,255,0.75)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
      >
        选择方案
      </button>
    </div>
  );
};

/* ─── main component ───────────────────────────────────── */
export const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tools = [
    { name: 'Claude Code', desc: 'Anthropic 官方 CLI' },
    { name: 'Codex', desc: 'OpenAI 编码 CLI' },
    { name: 'OpenCode', desc: '开源多模型 CLI' },
    { name: 'OpenClaw', desc: '龙虾 AI 助手' },
    { name: 'Cursor', desc: 'AI-first 编辑器' },
    { name: 'VS Code', desc: 'Continue / Cline' },
    { name: 'Windsurf', desc: 'AI 编码编辑器' },
    { name: 'CherryStudio', desc: '桌面 AI 客户端' },
  ];

  const faqs = [
    {
      key: '1',
      label: 'ApeCode 是什么？',
      children: 'ApeCode 是一个 AI API 中转平台，让国内开发者无需梯子、无需海外账号，即可以极低价格调用 Claude、GPT 等顶级 AI 模型。',
    },
    {
      key: '2',
      label: '国内能直接用吗？需要梯子吗？',
      children: '完全不需要梯子。ApeCode 在国内有专线节点，直接访问即可，延迟低、速度快。',
    },
    {
      key: '3',
      label: '为什么价格这么便宜（1块钱=1刀）？',
      children: '我们通过企业级采购渠道批量购买 API 额度，规模化红利直接让利给开发者。1 元人民币 = 1 美元额度，约官方 1.4 折。',
    },
    {
      key: '4',
      label: '1 块钱大概能用多少？',
      children: '以 Claude Sonnet 4.6 为例，输入 5000 Token + 输出 2000 Token 约 $0.045，充值 ¥1 可进行约 22 次这样的对话。一杯奶茶的钱够用一周。',
    },
    {
      key: '5',
      label: '月卡的「每日额度」怎么用？用不完能累积吗？',
      children: '月卡每日零点刷新固定额度，当日未用完的额度不累积到次日。月卡额度与按量余额可同时使用，互不影响。',
    },
    {
      key: '6',
      label: '服务稳定性怎么保障？',
      children: '多线路智能调度，单线故障秒级切换，7×24 小时监控，99.9% 可用率保障。每笔调用可追溯，费用明细一目了然。',
    },
  ];

  return (
    <div style={{ background: DARK_BG, minHeight: '100vh', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <LandingNav />

      {/* ── BANNER ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}22 0%, transparent 60%)`,
          borderBottom: `1px solid ${PRIMARY}33`,
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: 14,
        }}
      >
        <GiftOutlined style={{ color: PRIMARY, marginRight: 8 }} />
        <span style={{ color: 'rgba(255,255,255,0.9)' }}>
          🎁 4 月福利：首充多少就送多少！首次充值任意金额，额外赠送等额美元余额。
        </span>
        <button
          onClick={() => navigate('/auth/signup')}
          style={{
            marginLeft: 12,
            padding: '2px 12px',
            borderRadius: 20,
            border: `1px solid ${PRIMARY}`,
            background: 'transparent',
            color: PRIMARY,
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          立即领取
        </button>
      </div>

      {/* ── HERO ── */}
      <section style={{ padding: 'clamp(60px, 10vw, 120px) 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 20,
              background: `${PRIMARY}18`,
              border: `1px solid ${PRIMARY}44`,
              color: PRIMARY,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            <span>ApeCode — Claude Code 超强平替</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(36px, 7vw, 68px)',
              fontWeight: 800,
              lineHeight: 1.1,
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}
          >
            ApeCode
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              color: MUTED,
              margin: '0 0 12px',
              lineHeight: 1.6,
            }}
          >
            稳定、实惠、开箱即用的 AI API 中转服务
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 40 }}>
            专为开发者打造的 AI API 中转平台
          </p>

          {/* code block */}
          <div
            style={{
              background: '#0d0d0d',
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: '20px 24px',
              textAlign: 'left',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 13,
              lineHeight: 1.8,
              marginBottom: 36,
              overflowX: 'auto',
            }}
          >
            <div style={{ color: MUTED, marginBottom: 4 }}># 一键调用 Claude API</div>
            <div>
              <span style={{ color: '#7dd3fc' }}>$ curl</span>
              <span style={{ color: '#fff' }}> -X POST https://ai.apecode.site/api/v1/messages \</span>
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#86efac' }}>-H</span>
              <span style={{ color: '#fde68a' }}> "Authorization: Bearer sk-xxx"</span>
              <span style={{ color: '#fff' }}> \</span>
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#86efac' }}>-H</span>
              <span style={{ color: '#fde68a' }}> "Content-Type: application/json"</span>
              <span style={{ color: '#fff' }}> \</span>
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#86efac' }}>-d</span>
              <span style={{ color: '#fde68a' }}> '&#123;"model": "claude-sonnet-4-6", "messages": [...]&#125;'</span>
            </div>
            <div style={{ marginTop: 8, color: MUTED }}># 200 OK</div>
            <div style={{ color: '#86efac' }}>&#123;"content": "Hello!"&#125;</div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/auth/signup')}
              style={{
                padding: '12px 32px',
                borderRadius: 10,
                border: 'none',
                background: PRIMARY,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            >
              立即体验
            </button>
            <button
              onClick={() => window.open('https://ai.apecode.site/docs', '_blank')}
              style={{
                padding: '12px 32px',
                borderRadius: 10,
                border: `1px solid ${BORDER}`,
                background: 'transparent',
                color: 'rgba(255,255,255,0.8)',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              查看文档
            </button>
          </div>

          {/* stats row */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 52,
              paddingTop: 40,
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            {[
              { label: '1 RMB = 1 USD', sub: '官方 1.4 折' },
              { label: '多线路调度', sub: '自动故障切换' },
              { label: '99.9% 稳定率', sub: '7×24 监控' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{s.label}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle
            badge="为什么选择 ApeCode"
            title="用户需要的，我们都有"
            sub="专为中国用户打造的 AI API 中转平台，免梯子、免注册海外账号"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            {[
              {
                icon: <SafetyOutlined style={{ fontSize: 24, color: PRIMARY }} />,
                title: '满血不掺水',
                desc: '官方企业级通道直连，拒绝逆向阉割和以次充好。内置一键 Key 测试功能，模型真假立验——全网独家。',
              },
              {
                icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#faad14' }} />,
                title: '一键接入',
                desc: '一个 API 密钥调用所有模型。支持 Claude Code、Codex、OpenClaw、Cursor 等 8+ 工具，CC-Switch 一键配置。',
              },
              {
                icon: <DollarOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
                title: '极致性价比',
                desc: '1 元 = 1 刀额度，约官方 1.4 折。企业级采购渠道，规模化红利直接让利开发者。额度永不过期。',
              },
              {
                icon: <RocketOutlined style={{ fontSize: 24, color: '#1677ff' }} />,
                title: '稳定透明',
                desc: '多线路智能调度，单线故障秒级切换。每笔调用可追溯，费用明细一目了然，不花一分冤枉钱。',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: CARD_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: '28px 24px',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = `${PRIMARY}55`)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = BORDER)
                }
              >
                <div style={{ marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODELS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle
            badge="支持模型"
            title="一个 Key，调用所有模型"
            sub="Claude 全系列满血支持，GPT / o3 / Codex 同步可用"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              marginBottom: 32,
            }}
          >
            <ModelCard
              provider="Anthropic"
              name="Claude Opus 4.6"
              desc="最强推理模型，适合复杂推理与高价值工程任务"
              tags={['推理', '编码', '最强']}
              inputPrice="$5/MTok"
              outputPrice="$25/MTok"
            />
            <ModelCard
              provider="Anthropic"
              name="Claude Sonnet 4.6"
              desc="日常主力编码模型，速度与性能的最佳组合"
              tags={['编码', '高效', '主力']}
              inputPrice="$3/MTok"
              outputPrice="$15/MTok"
              highlight
            />
            <ModelCard
              provider="Anthropic"
              name="Claude Haiku 4.5"
              desc="最快模型，适合轻量补全与快速迭代"
              tags={['快速', '轻量']}
              inputPrice="$0.8/MTok"
              outputPrice="$4/MTok"
            />
            <ModelCard
              provider="OpenAI"
              name="GPT-5.4"
              desc="OpenAI 最新旗舰模型，融合推理与编码"
              tags={['推理', '编码', '多模态']}
              inputPrice="$5/MTok"
              outputPrice="$15/MTok"
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: MUTED, fontSize: 14 }}>
              同时支持：
              {['GPT-4o', 'o3', 'o3-pro', 'o4-mini', 'Codex', '更多持续接入...'].map((m) => (
                <span
                  key={m}
                  style={{
                    display: 'inline-block',
                    margin: '4px 6px',
                    padding: '3px 12px',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${BORDER}`,
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 13,
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle
            badge="平台支持"
            title="兼容你喜欢的所有工具"
            sub="兼容 OpenAI 格式，几乎支持所有主流 AI 编程工具和 IDE"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {tools.map((tool) => (
              <div
                key={tool.name}
                style={{
                  background: CARD_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'border-color 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = `${PRIMARY}55`)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = BORDER)
                }
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `${PRIMARY}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: PRIMARY,
                    flexShrink: 0,
                  }}
                >
                  {tool.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{tool.name}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{tool.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BILLING ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionTitle
            badge="计费说明"
            title="简单透明，用多少付多少"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 40,
            }}
          >
            {[
              {
                icon: '💱',
                title: '1 人民币 = 1 美元额度',
                desc: '充值 100 元即获得 $100 额度。官方汇率约 7.2，相当于 1.4 折使用全部 Claude 模型。',
              },
              {
                icon: '⚡',
                title: '按量计费',
                desc: '每次 API 调用按实际 Token 消耗扣费，与官方计价方式一致。用多少扣多少，额度永不过期。',
              },
              {
                icon: '📅',
                title: '月卡更划算',
                desc: '月卡用户每日享有固定额度（如 $50/天），折合低至 0.31 元/美金。额度每日零点刷新。',
              },
              {
                icon: '👑',
                title: 'VIP 等级折扣',
                desc: '累计消费自动升级 VIP，享受更低倍率。最高 VIP8 享 0.88 折倍率，消费越多越便宜。',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: CARD_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: '24px',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* example calc */}
          <div
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: '28px 32px',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              💡 举个例子
            </div>
            <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.9 }}>
              使用 Claude Sonnet 4.6 进行一次编码对话（输入 5000 Token，输出 2000 Token）：
              <br />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                输入：5,000 ÷ 1,000,000 × $3 = <strong style={{ color: '#fff' }}>$0.015</strong>
              </span>
              <br />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                输出：2,000 ÷ 1,000,000 × $15 = <strong style={{ color: '#fff' }}>$0.030</strong>
              </span>
              <br />
              <span style={{ color: PRIMARY, fontWeight: 600 }}>
                合计：$0.045（约 ¥0.045，不到 5 分钱）
              </span>
              <br />
              充值 ¥1 就能进行约 22 次这样的对话。
              <strong style={{ color: '#fff' }}> 一杯奶茶的钱够用一周。</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionTitle
            badge="定价方案"
            title="按需付费，灵活选择"
            sub="按量付费永不过期，月卡用户每天享受大额度刷新"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
              marginBottom: 32,
            }}
          >
            <PricingCard
              name="标准"
              price="¥100"
              desc="开发者常用"
              features={['$100 额度', '永不过期', '支持全部模型']}
            />
            <PricingCard
              name="标准版月卡"
              price="¥499"
              unit="/月"
              desc="重度代码编写、长文档分析"
              features={['$50/天额度', '每日刷新', '支持全部模型', '≈ 0.33 ¥/USD']}
              highlight
              badge="推荐"
            />
            <PricingCard
              name="团队版月卡"
              price="¥1,888"
              unit="/月"
              desc="极高频用户、小型工作室"
              features={['$200/天额度', '每日刷新', '支持全部模型', '≈ 0.31 ¥/USD']}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/pricing')}
              style={{
                padding: '10px 28px',
                borderRadius: 10,
                border: `1px solid ${BORDER}`,
                background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              查看全部套餐
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionTitle badge="常见问题" title="FAQ" sub="还有其他问题？欢迎联系我们" />
          <Collapse
            items={faqs}
            ghost
            style={{ color: '#fff' }}
            expandIconPosition="end"
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: '80px 24px',
          background: `radial-gradient(ellipse at center, ${PRIMARY}18 0%, transparent 70%)`,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            3 分钟开始你的 AI 编码之旅
          </h2>
          <p style={{ color: MUTED, fontSize: 16, marginBottom: 36 }}>
            注册账号 → 充值 → 创建 API Key → 开始使用。就是这么简单。
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            style={{
              padding: '14px 40px',
              borderRadius: 12,
              border: 'none',
              background: PRIMARY,
              color: '#fff',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 16,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          >
            立即注册
          </button>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            最低 ¥20 起充 · 额度永不过期 · 支持微信 / 支付宝 / USDT
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: `1px solid ${BORDER}`,
          padding: '48px 24px 32px',
          background: '#0a0a0a',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 40,
            marginBottom: 48,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <img src={logoImg} alt="logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>ApeCode</span>
            </div>
            <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
              Claude Code 超强平替<br />稳定、实惠、开箱即用
            </div>
          </div>
          {[
            {
              title: '产品',
              links: ['按量付费', '月卡订阅', '模型定价', '企业方案'],
            },
            {
              title: '支持模型',
              links: ['Claude Opus / Sonnet / Haiku', 'GPT-5.4 / GPT-4o', 'o3 / o4-mini / Codex'],
            },
            {
              title: '资源',
              links: ['使用文档', '博客', '常见问题'],
            },
            {
              title: '联系我们',
              links: ['support@apecode.ai', '分销合作', '隐私政策', '服务条款'],
            },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
                {col.title}
              </div>
              {col.links.map((link) => (
                <div key={link} style={{ marginBottom: 10 }}>
                  <span
                    style={{ fontSize: 13, color: MUTED, cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLSpanElement).style.color = '#fff')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLSpanElement).style.color = MUTED)}
                  >
                    {link}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Text style={{ color: MUTED, fontSize: 13 }}>© 2026 ApeCode. All rights reserved.</Text>
          <Text style={{ color: MUTED, fontSize: 13 }}>Made with ❤️ by ApeCode Team</Text>
        </div>
      </footer>
    </div>
  );
};
