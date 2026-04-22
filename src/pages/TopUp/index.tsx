import { useState, useEffect, useRef } from 'react';
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
  Spin,
  Modal,
} from 'antd';
import {
  ThunderboltFilled,
  StarFilled,
  AlipayCircleOutlined,
  WechatOutlined,
  SwapOutlined,
  GiftOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { usePageHeader } from '../../hooks/usePageContext';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';
import { message } from 'antd';
import apiClient from '../../services/api/apiClient';

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

interface ApiPlan {
  id: number;
  title: string;
  subtitle: string;
  price_amount: number;
  currency: string;
  duration_unit: string;
  duration_value: number;
  custom_seconds: number;
  enabled: boolean;
  sort_order: number;
  stripe_price_id: string;
  creem_product_id: string;
  max_purchase_per_user: number;
  upgrade_group: string;
  total_amount: number;
  quota_reset_period: string;
  quota_reset_custom_seconds: number;
  created_at: number;
  updated_at: number;
}

interface PlanItem {
  plan: ApiPlan;
}

interface PayResponse {
  data: {
    device: string;
    money: string;
    name: string;
    notify_url: string;
    out_trade_no: string;
    pid: string;
    return_url: string;
    sign: string;
    sign_type: string;
    type: string;
  };
  message: string;
  url: string;
}

interface PayModalState {
  visible: boolean;
  payUrl: string;
  money: string;
  name: string;
  type: string;
  out_trade_no: string;
  submitUrl: string;
  submitData: Record<string, string>;
}

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
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [payModal, setPayModal] = useState<PayModalState>({
    visible: false, payUrl: '', money: '', name: '', type: '', out_trade_no: '', submitUrl: '', submitData: {},
  });
  const [paying, setPaying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const panelBg = isDark ? '#1a1a1a' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const subText = isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8';

  useEffect(() => {
    setPlansLoading(true);
    apiClient.get<PlanItem[]>('/subscription/plans')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        // 按 sort_order 排序，过滤掉未启用的
        setPlans(list.filter((p) => p.plan.enabled).sort((a, b) => a.plan.sort_order - b.plan.sort_order));
      })
      .catch(() => { /* ignore */ })
      .finally(() => setPlansLoading(false));
  }, []);

  const handleSubscribe = async (planId: number) => {
    const payment_method = payMethod === 'wechat' ? 'wxpay' : 'alipay';
    setPaying(true);
    try {
      const res = await apiClient.post<PayResponse>('/subscription/epay/pay', {
        plan_id: planId,
        payment_method,
      });
      const params = new URLSearchParams();
      Object.entries(res.data).forEach(([k, v]) => params.set(k, String(v)));
      const fullPayUrl = `${res.url}?${params.toString()}`;
      setPayModal({
        visible: true,
        payUrl: fullPayUrl,
        money: res.data.money,
        name: res.data.name,
        type: res.data.type,
        out_trade_no: res.data.out_trade_no,
        submitUrl: res.url,
        submitData: res.data as unknown as Record<string, string>,
      });
    } catch {
      message.error('发起支付失败，请重试');
    } finally {
      setPaying(false);
    }
  };

  const stopPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startPoll = (out_trade_no: string) => {
    stopPoll();
    pollRef.current = setInterval(async () => {
      try {
        const res = await apiClient.get<{ items: { trade_no: string; status: string }[] }>(
          '/user/topup/self', { params: { p: 1, page_size: 10 } }
        );
        const matched = res.items?.find(
          (item) => item.trade_no === out_trade_no && item.status === 'success'
        );
        if (matched) {
          stopPoll();
          message.success('支付成功！订阅已生效');
          setPayModal((p) => ({ ...p, visible: false }));
        }
      } catch { /* ignore */ }
    }, 3000);
  };

  // 弹窗打开时启动轮询，关闭时停止
  useEffect(() => {
    if (payModal.visible && payModal.out_trade_no) {
      startPoll(payModal.out_trade_no);
    } else {
      stopPoll();
    }
    return stopPoll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payModal.visible, payModal.out_trade_no]);

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
          <Text style={{ fontSize: 13, color: subText, display: 'block', marginBottom: 16 }}>
            每日固定额度 · 每日零点刷新 · 不累积 · 支持全部 Claude 模型
          </Text>
          {plansLoading ? (
            <Flex justify="center" style={{ padding: '60px 0' }}>
              <Spin size="large" />
            </Flex>
          ) : plans.length === 0 ? (
            <Flex justify="center" style={{ padding: '60px 0' }}>
              <Text style={{ color: subText }}>暂无可用套餐</Text>
            </Flex>
          ) : (
            <Row gutter={[16, 16]}>
              {plans.map((item) => (
                <Col key={item.plan.id} xs={24} sm={12} xl={6}>
                  <PlanCard
                    plan={item.plan}
                    isDark={isDark}
                    border={border}
                    panelBg={panelBg}
                    subText={subText}
                    paying={paying}
                    onSubscribe={handleSubscribe}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* ── 支付弹窗 ── */}
      <Modal
        open={payModal.visible}
        onCancel={() => { stopPoll(); setPayModal((p) => ({ ...p, visible: false })); }}
        footer={
          <Button block size="large" onClick={() => { stopPoll(); setPayModal((p) => ({ ...p, visible: false })); }}>
            关闭
          </Button>
        }
        title={payModal.type === 'wxpay' ? '微信扫码支付' : '支付宝扫码支付'}
        centered
        width={400}
        styles={{ body: { textAlign: 'center', padding: '16px 24px 8px' } }}
      >
        <Text type="secondary" style={{ fontSize: 13 }}>请支付精确金额</Text>
        <div style={{ margin: '8px 0 4px' }}>
          <Text strong style={{ fontSize: 36, color: payModal.type === 'wxpay' ? '#07C160' : '#1677ff' }}>
            ¥{payModal.money}
          </Text>
        </div>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
          {payModal.name}
        </Text>

        {/* 二维码 */}
        <div style={{
          display: 'inline-block',
          padding: 12,
          background: '#fff',
          borderRadius: 12,
          border: `2px solid ${payModal.type === 'wxpay' ? '#07C160' : '#1677ff'}`,
          marginBottom: 16,
        }}>
          {payModal.payUrl ? (
            <QRCodeSVG value={payModal.payUrl} size={200} />
          ) : (
            <Flex justify="center" align="center" style={{ width: 200, height: 200 }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} />} />
            </Flex>
          )}
        </div>

        <Text style={{ display: 'block', fontSize: 13, marginBottom: 8 }}>
          请用{payModal.type === 'wxpay' ? '微信' : '支付宝'}扫描二维码完成支付
        </Text>
        <Flex justify="center" align="center" gap={6} style={{ marginBottom: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a', display: 'inline-block' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>等待支付确认中...</Text>
        </Flex>
        <a
          href={payModal.payUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: payModal.type === 'wxpay' ? '#07C160' : '#1677ff' }}
        >
          扫码有问题？点击跳转支付页面
        </a>
      </Modal>
    </div>
  );
};

/* ── 单个套餐卡片 ── */
interface PlanCardProps {
  plan: ApiPlan;
  isDark: boolean;
  border: string;
  panelBg: string;
  subText: string;
  paying: boolean;
  onSubscribe: (planId: number) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isDark, border, panelBg, subText, paying, onSubscribe }) => {
  // total_amount 单位同 quota，除以 500000 得 USD
  const totalUSD = plan.total_amount / 500000;
  // 时长描述
  const durationLabel = plan.duration_unit === 'month'
    ? `${plan.duration_value} 个月`
    : plan.duration_unit === 'day'
    ? `${plan.duration_value} 天`
    : `${plan.duration_value} ${plan.duration_unit}`;

  const cardBorder = `1px solid ${border}`;
  const cardBg = panelBg;

  return (
    <Card
      style={{ border: cardBorder, background: cardBg, height: '100%' }}
      styles={{ body: { padding: '20px 20px 16px' } }}
    >
      {/* 名称 */}
      <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
        <StarFilled style={{ color: PRIMARY_COLOR, fontSize: 16 }} />
        <Text strong style={{ fontSize: 15 }}>{plan.title}</Text>
      </Flex>
      {plan.subtitle && (
        <Text style={{ fontSize: 12, color: subText, display: 'block', marginBottom: 12 }}>
          {plan.subtitle}
        </Text>
      )}

      {/* 价格 */}
      <div style={{ marginBottom: 6 }}>
        <Text strong style={{ fontSize: 28, color: PRIMARY_COLOR }}>
          {plan.currency === 'USD' ? '$' : '¥'}{plan.price_amount.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 13, color: subText }}>/{durationLabel}</Text>
      </div>

      {/* 总额度 */}
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
        <Text style={{ fontSize: 12, color: subText }}>总额度</Text>
        <Text strong style={{ fontSize: 13, color: PRIMARY_COLOR }}>
          ${totalUSD.toLocaleString()}
        </Text>
      </div>

      {/* 额度重置周期 */}
      {plan.quota_reset_period && plan.quota_reset_period !== 'never' && (
        <Text style={{ fontSize: 12, color: subText, display: 'block', marginBottom: 10 }}>
          额度重置：{plan.quota_reset_period}
        </Text>
      )}

      {/* 按钮 */}
      <Button
        type="primary"
        block
        loading={paying}
        style={{ fontWeight: 600, marginTop: 8 }}
        onClick={() => onSubscribe(plan.id)}
      >
        立即订阅
      </Button>
    </Card>
  );
};
