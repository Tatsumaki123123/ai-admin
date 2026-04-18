import { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Segmented,
  Tag,
  Typography,
  InputNumber,
  Divider,
  Badge,
} from 'antd';
import {
  CheckOutlined,
  ThunderboltFilled,
  StarFilled,
  CrownFilled,
  RocketFilled,
  TeamOutlined,
  ShopOutlined,
  BankOutlined,
  AlipayCircleOutlined,
  WechatOutlined,
  SwapOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { usePageHeader } from '../../hooks/usePageContext';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';
import { message } from 'antd';

const { Text } = Typography;

const SUPPORTED_MODELS = [
  'Claude Opus 4.6',
  'Claude Opus 4.5',
  'Claude Sonnet 4.6',
  'Claude Sonnet 4.5',
  'Claude Haiku 4.5',
  'GPT-5.4',
  'GPT-4o',
  'o3',
  'o4-mini',
  'Codex',
  '更多模型持续接入…',
];

type PayMethod = 'wechat' | 'alipay' | 'usdt';
type BillingTab = 'paygo' | 'monthly';

interface Plan {
  key: string;
  name: string;
  badge?: string;
  desc: string;
  price: number;
  dailyQuota: number;
  monthlyEquiv: number;
  savings: string;
  perUnit: string;
  features: string[];
  recommended?: boolean;
  icon: React.ReactNode;
}

const PLANS: Plan[] = [
  {
    key: 'starter',
    name: '入门版',
    badge: '入门',
    desc: '个人开发者，日常编程辅助',
    price: 199,
    dailyQuota: 15,
    monthlyEquiv: 450,
    savings: '94%',
    perUnit: '0.44',
    features: [
      '支持 Claude / GPT / Codex 全系列',
      '每日零点自动刷新额度',
      '可与按量付费余额同时使用',
    ],
    icon: <ThunderboltFilled />,
  },
  {
    key: 'lite',
    name: '轻量版',
    badge: '',
    desc: '个人开发者，日常编程辅助',
    price: 339,
    dailyQuota: 30,
    monthlyEquiv: 900,
    savings: '95%',
    perUnit: '0.38',
    features: [
      '支持 Claude / GPT / Codex 全系列',
      '每日零点自动刷新额度',
      '可与按量付费余额同时使用',
    ],
    icon: <RocketFilled />,
  },
  {
    key: 'standard',
    name: '标准版',
    badge: '推荐',
    desc: '重度代码编写，长文档分析',
    price: 499,
    dailyQuota: 50,
    monthlyEquiv: 1500,
    savings: '95%',
    perUnit: '0.33',
    features: [
      '支持 Claude / GPT / Codex 全系列',
      '每日零点自动刷新额度',
      '可与按量付费余额同时使用',
    ],
    recommended: true,
    icon: <StarFilled />,
  },
  {
    key: 'pro',
    name: '高级版',
    badge: '进阶',
    desc: '全职独立开发者，AI 极客',
    price: 1188,
    dailyQuota: 126,
    monthlyEquiv: 3600,
    savings: '95%',
    perUnit: '0.33',
    features: [
      '支持 Claude / GPT / Codex 全系列',
      '每日零点自动刷新额度',
      '可与按量付费余额同时使用',
    ],
    icon: <CrownFilled />,
  },
  {
    key: 'team',
    name: '团队版',
    badge: '团队',
    desc: '精英用户，小型工作室',
    price: 1888,
    dailyQuota: 200,
    monthlyEquiv: 6000,
    savings: '96%',
    perUnit: '0.31',
    features: [
      '支持 Claude / GPT / Codex 全系列',
      '每日零点自动刷新额度',
      '可与按量付费余额同时使用',
    ],
    icon: <TeamOutlined />,
  },
  {
    key: 'business',
    name: '商业版',
    badge: '旗舰',
    desc: '深度商业用户，中大型工作室',
    price: 4688,
    dailyQuota: 500,
    monthlyEquiv: 15000,
    savings: '96%',
    perUnit: '0.31',
    features: [
      '支持 Claude / GPT / Codex 全系列',
      '每日零点自动刷新额度',
      '可与按量付费余额同时使用',
    ],
    icon: <ShopOutlined />,
  },
  {
    key: 'enterprise',
    name: '企业版',
    badge: '旗舰',
    desc: '深度商业用户，中大型工作室',
    price: 9188,
    dailyQuota: 1000,
    monthlyEquiv: 30000,
    savings: '96%',
    perUnit: '0.31',
    features: [
      '支持 Claude / GPT / Codex 全系列',
      '每日零点自动刷新额度',
      '可与按量付费余额同时使用',
    ],
    icon: <BankOutlined />,
  },
];

// 按量充值预设金额
const PAYGO_PRESETS = [20, 50, 100, 200, 500, 1000];

export const TopUpPage = () => {
  usePageHeader({
    title: '充值 / 订阅',
    description: '选择适合你的方案，按需充值或订阅月卡。',
  });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [payMethod, setPayMethod] = useState<PayMethod>('wechat');
  const [billingTab, setBillingTab] = useState<BillingTab>('monthly');
  const [paygoAmount, setPaygoAmount] = useState<number>(100);

  const panelBg = isDark ? '#1a1a1a' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const subText = isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8';

  const payMethods: { value: PayMethod; label: React.ReactNode }[] = [
    {
      value: 'wechat',
      label: (
        <Flex align="center" gap={5}>
          <WechatOutlined style={{ color: '#07C160', fontSize: 16 }} />
          <span>微信支付</span>
        </Flex>
      ),
    },
    {
      value: 'alipay',
      label: (
        <Flex align="center" gap={5}>
          <AlipayCircleOutlined style={{ color: '#1677FF', fontSize: 16 }} />
          <span>支付宝</span>
        </Flex>
      ),
    },
    {
      value: 'usdt',
      label: (
        <Flex align="center" gap={5}>
          <SwapOutlined style={{ color: '#26A17B', fontSize: 16 }} />
          <span>USDT</span>
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* ── 支付方式 ── */}
      <Flex align="center" gap={12} style={{ marginBottom: 20 }}>
        <Text style={{ color: subText, fontSize: 13 }}>支付方式</Text>
        <Segmented
          value={payMethod}
          onChange={(v) => setPayMethod(v as PayMethod)}
          options={payMethods}
          style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}
        />
      </Flex>

      {/* ── 活动 Banner ── */}
      <div
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${hexToRgba(
                PRIMARY_COLOR,
                0.22
              )} 0%, ${hexToRgba(PRIMARY_COLOR, 0.1)} 100%)`
            : `linear-gradient(135deg, ${hexToRgba(
                PRIMARY_COLOR,
                0.1
              )} 0%, ${hexToRgba(PRIMARY_COLOR, 0.04)} 100%)`,
          border: `1px solid ${hexToRgba(PRIMARY_COLOR, 0.3)}`,
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <Flex align="center" gap={10} style={{ marginBottom: 8 }}>
          <GiftOutlined style={{ color: PRIMARY_COLOR, fontSize: 16 }} />
          <Text strong style={{ color: PRIMARY_COLOR, fontSize: 14 }}>
            4 月福利：首充多少就送多少！
          </Text>
          <Tag
            style={{
              background: PRIMARY_COLOR,
              color: '#fff',
              border: 'none',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            限时福利
          </Tag>
        </Flex>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li>
            <Text style={{ fontSize: 13 }}>
              充 ¥20 按量付费 → 额外送 $20 余额（共 $40）
            </Text>
          </li>
          <li>
            <Text style={{ fontSize: 13 }}>
              充 ¥499 标准版月卡 → 额外送 $499 余额
            </Text>
          </li>
        </ul>
        <Text
          style={{
            fontSize: 12,
            color: subText,
            marginTop: 4,
            display: 'block',
          }}
        >
          赠送余额当日均匀每日均匀发一发，通常 24 小时内到账，仅限首次充值
        </Text>
      </div>

      {/* ── 支持模型 ── */}
      <Card
        style={{
          marginBottom: 20,
          border: `1px solid ${border}`,
          background: panelBg,
        }}
        styles={{ body: { padding: '14px 20px' } }}
      >
        <Flex align="center" gap={12} wrap="wrap">
          <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
            支持模型
          </Text>
          <Tag
            color={PRIMARY_COLOR}
            style={{ margin: 0, fontWeight: 500, fontSize: 12 }}
          >
            全部客户通用
          </Tag>
          <Divider type="vertical" style={{ height: 16, margin: 0 }} />
          {SUPPORTED_MODELS.map((m) => (
            <Tag
              key={m}
              style={{
                margin: '2px 0',
                background: 'transparent',
                border: `1px solid ${border}`,
                color: isDark ? 'rgba(255,255,255,0.65)' : '#475569',
                fontSize: 12,
              }}
            >
              {m}
            </Tag>
          ))}
        </Flex>
      </Card>

      {/* ── 付费模式切换 ── */}
      <Flex align="center" gap={0} style={{ marginBottom: 16 }}>
        <Button
          type={billingTab === 'paygo' ? 'primary' : 'default'}
          icon={<ThunderboltFilled />}
          onClick={() => setBillingTab('paygo')}
          style={{
            borderRadius: '6px 0 0 6px',
            fontWeight: billingTab === 'paygo' ? 600 : 400,
          }}
        >
          按量付费
        </Button>
        <Button
          type={billingTab === 'monthly' ? 'primary' : 'default'}
          icon={<StarFilled />}
          onClick={() => setBillingTab('monthly')}
          style={{
            borderRadius: '0 6px 6px 0',
            marginLeft: -1,
            fontWeight: billingTab === 'monthly' ? 600 : 400,
          }}
        >
          月卡订阅
        </Button>
      </Flex>

      {/* ── 按量付费 ── */}
      {billingTab === 'paygo' && (
        <Card
          style={{ border: `1px solid ${border}`, background: panelBg }}
          styles={{ body: { padding: '24px 28px' } }}
        >
          <Text
            strong
            style={{ fontSize: 15, display: 'block', marginBottom: 6 }}
          >
            充值余额
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: subText,
              display: 'block',
              marginBottom: 20,
            }}
          >
            按 ¥1 = $1 汇率充值，余额永久有效，可随时使用。
          </Text>

          {/* 预设金额 */}
          <Flex gap={10} wrap="wrap" style={{ marginBottom: 20 }}>
            {PAYGO_PRESETS.map((amt) => (
              <Button
                key={amt}
                type={paygoAmount === amt ? 'primary' : 'default'}
                onClick={() => setPaygoAmount(amt)}
                style={{ minWidth: 80, fontWeight: 500 }}
              >
                ¥{amt}
              </Button>
            ))}
          </Flex>

          {/* 自定义金额 */}
          <Flex align="center" gap={12} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, color: subText }}>自定义金额</Text>
            <InputNumber
              prefix="¥"
              min={1}
              max={99999}
              value={paygoAmount}
              onChange={(v) => setPaygoAmount(v ?? 1)}
              style={{ width: 160 }}
              size="large"
            />
          </Flex>

          <Divider style={{ margin: '0 0 20px' }} />

          {/* 汇总 */}
          <Flex justify="space-between" align="center">
            <div>
              <Text style={{ fontSize: 13, color: subText }}>实付金额</Text>
              <div>
                <Text strong style={{ fontSize: 28, color: PRIMARY_COLOR }}>
                  ¥{paygoAmount}
                </Text>
                <Text style={{ fontSize: 13, color: subText, marginLeft: 8 }}>
                  ≈ ${paygoAmount} 余额
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              style={{ minWidth: 140, fontWeight: 600 }}
              onClick={() => message.info('支付功能开发中，敬请期待')}
            >
              立即充值
            </Button>
          </Flex>
        </Card>
      )}

      {/* ── 月卡订阅 ── */}
      {billingTab === 'monthly' && (
        <>
          <Text
            style={{
              fontSize: 13,
              color: subText,
              display: 'block',
              marginBottom: 16,
            }}
          >
            每日固定额度 · 每日零点刷新 · 不累积 · 支持全部 Claude 模型
          </Text>
          <Row gutter={[16, 16]}>
            {PLANS.map((plan) => (
              <Col key={plan.key} xs={24} sm={12} xl={6}>
                <PlanCard
                  plan={plan}
                  isDark={isDark}
                  border={border}
                  panelBg={panelBg}
                  subText={subText}
                />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

/* ── 单个套餐卡片 ── */
interface PlanCardProps {
  plan: Plan;
  isDark: boolean;
  border: string;
  panelBg: string;
  subText: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isDark,
  border,
  panelBg,
  subText,
}) => {
  const cardBorder = plan.recommended
    ? `1px solid ${PRIMARY_COLOR}`
    : `1px solid ${border}`;

  const cardBg = plan.recommended
    ? isDark
      ? hexToRgba(PRIMARY_COLOR, 0.06)
      : hexToRgba(PRIMARY_COLOR, 0.03)
    : panelBg;

  return (
    <Badge.Ribbon
      text={plan.badge || undefined}
      color={plan.recommended ? PRIMARY_COLOR : 'rgba(0,0,0,0)'}
      style={{
        display: plan.badge ? 'block' : 'none',
        fontWeight: 600,
        fontSize: 11,
      }}
    >
      <Card
        style={{ border: cardBorder, background: cardBg, height: '100%' }}
        styles={{ body: { padding: '20px 20px 16px' } }}
      >
        {/* 名称 */}
        <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
          <span style={{ color: PRIMARY_COLOR, fontSize: 16 }}>
            {plan.icon}
          </span>
          <Text strong style={{ fontSize: 15 }}>
            {plan.name}
          </Text>
        </Flex>
        <Text
          style={{
            fontSize: 12,
            color: subText,
            display: 'block',
            marginBottom: 12,
          }}
        >
          {plan.desc}
        </Text>

        {/* 价格 */}
        <div style={{ marginBottom: 6 }}>
          <Text strong style={{ fontSize: 28, color: PRIMARY_COLOR }}>
            ¥{plan.price.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 13, color: subText }}>/月</Text>
        </div>

        {/* 节省比例 */}
        <Text
          style={{
            fontSize: 12,
            color: subText,
            display: 'block',
            marginBottom: 10,
          }}
        >
          相比官方省 {plan.savings}% · ≈¥{plan.perUnit}/美金
        </Text>

        {/* 每日额度 */}
        <div
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
            border: `1px solid ${border}`,
            borderRadius: 6,
            padding: '6px 12px',
            marginBottom: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: subText }}>每日额度</Text>
          <Text strong style={{ fontSize: 13, color: PRIMARY_COLOR }}>
            ${plan.dailyQuota}
          </Text>
          <Text style={{ fontSize: 12, color: subText }}>
            ≈ 月 ${plan.monthlyEquiv}
          </Text>
        </div>

        {/* 特性列表 */}
        <ul style={{ margin: '0 0 16px', paddingLeft: 0, listStyle: 'none' }}>
          {plan.features.map((f) => (
            <li
              key={f}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
                marginBottom: 4,
              }}
            >
              <CheckOutlined
                style={{
                  color: PRIMARY_COLOR,
                  fontSize: 12,
                  marginTop: 3,
                  flexShrink: 0,
                }}
              />
              <Text style={{ fontSize: 12, color: subText, lineHeight: 1.6 }}>
                {f}
              </Text>
            </li>
          ))}
        </ul>

        {/* 按钮 */}
        <Button
          type={plan.recommended ? 'primary' : 'default'}
          block
          style={{ fontWeight: 600 }}
          onClick={() => message.info('订阅功能开发中，敬请期待')}
        >
          立即订阅
        </Button>
      </Card>
    </Badge.Ribbon>
  );
};
