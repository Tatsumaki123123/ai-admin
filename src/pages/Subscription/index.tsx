import { useState, useEffect } from 'react';
import { Card, Button, Typography, Flex, List, Tag, Progress, Spin, Row, Col } from 'antd';
import { CalendarOutlined, CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import { usePageHeader } from '../../hooks/usePageContext';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api/apiClient';

const { Text, Title } = Typography;

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  amount_total: number;
  amount_used: number;
  daily_amount_limit: number;
  daily_amount_used: number;
  daily_reset_time: number;
  start_time: number;
  end_time: number;
  status: string;
  source: string;
  last_reset_time: number;
  next_reset_time: number;
  upgrade_group: string;
  prev_user_group: string;
  created_at: number;
  updated_at: number;
}

interface SubItem {
  subscription: Subscription;
}

interface SubResponse {
  all_subscriptions: SubItem[];
  subscriptions: SubItem[];
  billing_preference: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:   { label: '生效中', color: '#52c41a' },
  expired:  { label: '已过期', color: '#8c8c8c' },
  cancelled:{ label: '已取消', color: '#ff4d4f' },
  pending:  { label: '待生效', color: '#faad14' },
};

const formatTs = (ts: number) =>
  ts > 0
    ? new Date(ts * 1000).toLocaleDateString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
      })
    : '—';

const NOTES = [
  '月卡提供每日固定 USD 额度，每日零点（UTC+8）自动刷新',
  '当日未用完的额度不结转到次日',
  '月卡额度优先消耗，用完后自动切换到按量付费余额',
  '到期后自动停止，不会自动续费',
  '续费后新订阅立即生效，与旧订阅不叠加',
];

export const SubscriptionPage = () => {
  usePageHeader({ title: '我的订阅', description: '管理你的月卡订阅。' });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const navigate = useNavigate();

  const [data, setData] = useState<SubResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<SubResponse>('/subscription/self')
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const sub = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const activeSubs = data?.subscriptions ?? [];
  const allSubs = data?.all_subscriptions ?? [];
  const hasActive = activeSubs.length > 0;

  return (
    <div>
      {loading ? (
        <Flex justify="center" style={{ padding: '80px 0' }}>
          <Spin size="large" />
        </Flex>
      ) : hasActive ? (
        <>
          {/* 当前生效订阅 — 一行 3 个 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {activeSubs.map(({ subscription: s }) => {
            const usedPct = s.amount_total > 0
              ? Math.min(100, Math.round((s.amount_used / s.amount_total) * 100))
              : 0;
            const totalUSD = (s.amount_total / 500000).toFixed(2);
            const usedUSD  = (s.amount_used  / 500000).toFixed(2);
            const cfg = STATUS_CONFIG[s.status] ?? { label: s.status, color: PRIMARY_COLOR };
            const daysLeft = s.end_time > 0
              ? Math.max(0, Math.ceil((s.end_time - Date.now() / 1000) / 86400))
              : null;

            return (
              <Col key={s.id} xs={24} sm={12} lg={8}>
              <Card
                style={{ background: cardBg, border: `1px solid ${hexToRgba(PRIMARY_COLOR, 0.3)}`, borderRadius: 12, height: '100%' }}
                styles={{ body: { padding: '20px 24px' } }}
              >
                <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
                  <Flex align="center" gap={10}>
                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                    <div>
                      <Flex align="center" gap={8}>
                        <Text strong style={{ fontSize: 16 }}>套餐 #{s.plan_id}</Text>
                        <Tag style={{
                          color: cfg.color,
                          background: hexToRgba(cfg.color, 0.1),
                          border: `1px solid ${hexToRgba(cfg.color, 0.3)}`,
                          fontWeight: 600, borderRadius: 6,
                        }}>{cfg.label}</Tag>
                      </Flex>
                      <Text style={{ color: sub, fontSize: 13 }}>
                        {formatTs(s.start_time)} — {formatTs(s.end_time)}
                        {daysLeft !== null && (
                          <span style={{ marginLeft: 8, color: daysLeft <= 7 ? '#faad14' : sub }}>
                            （剩余 {daysLeft} 天）
                          </span>
                        )}
                      </Text>
                    </div>
                  </Flex>
                  <Button type="primary" onClick={() => navigate('/purchase')}>续费</Button>
                </Flex>

                {/* 总额度进度 */}
                <div style={{ marginTop: 16 }}>
                  <Flex justify="space-between" style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, color: sub }}>总额度使用</Text>
                    <Text style={{ fontSize: 13 }}>
                      <Text strong>${usedUSD}</Text>
                      <Text style={{ color: sub }}> / ${totalUSD}</Text>
                    </Text>
                  </Flex>
                  <Progress
                    percent={usedPct}
                    strokeColor={usedPct >= 90 ? '#ff4d4f' : usedPct >= 70 ? '#faad14' : PRIMARY_COLOR}
                    trailColor={isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'}
                    showInfo={false}
                    size="small"
                  />
                </div>

                {/* 每日额度进度 */}
                {s.daily_amount_limit > 0 && (() => {
                  const dailyUsedPct = Math.min(100, Math.round((s.daily_amount_used / s.daily_amount_limit) * 100));
                  const dailyLimitUSD = (s.daily_amount_limit / 500000).toFixed(2);
                  const dailyUsedUSD  = (s.daily_amount_used  / 500000).toFixed(2);
                  const resetTs = s.daily_reset_time > 0 ? s.daily_reset_time : s.next_reset_time;
                  const resetStr = resetTs > 0
                    ? new Date(resetTs * 1000).toLocaleTimeString('zh-CN', {
                        month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '—';
                  return (
                    <div style={{
                      marginTop: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    }}>
                      <Flex justify="space-between" align="center" style={{ marginBottom: 6 }}>
                        <Flex align="center" gap={6}>
                          <ClockCircleOutlined style={{ color: sub, fontSize: 13 }} />
                          <Text style={{ fontSize: 13, color: sub }}>今日额度</Text>
                        </Flex>
                        <Flex align="center" gap={8}>
                          <Text style={{ fontSize: 13 }}>
                            <Text strong>${dailyUsedUSD}</Text>
                            <Text style={{ color: sub }}> / ${dailyLimitUSD}</Text>
                          </Text>
                          <Text style={{ fontSize: 12, color: sub }}>
                            重置于 {resetStr}
                          </Text>
                        </Flex>
                      </Flex>
                      <Progress
                        percent={dailyUsedPct}
                        strokeColor={dailyUsedPct >= 90 ? '#ff4d4f' : dailyUsedPct >= 70 ? '#faad14' : '#1890ff'}
                        trailColor={isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  );
                })()}
              </Card>
              </Col>
            );
          })}
          </Row>
          {/* 历史订阅（非当前生效的） */}
          {allSubs.filter(({ subscription: s }) =>
            !activeSubs.some((a) => a.subscription.id === s.id)
          ).length > 0 && (
            <Card
              style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, marginBottom: 16 }}
              styles={{ body: { padding: '16px 24px' } }}
            >
              <Text strong style={{ display: 'block', marginBottom: 12 }}>历史订阅</Text>
              {allSubs
                .filter(({ subscription: s }) => !activeSubs.some((a) => a.subscription.id === s.id))
                .map(({ subscription: s }) => {
                  const cfg = STATUS_CONFIG[s.status] ?? { label: s.status, color: '#8c8c8c' };
                  return (
                    <Flex key={s.id} justify="space-between" align="center"
                      style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}
                    >
                      <Flex align="center" gap={8}>
                        <ClockCircleOutlined style={{ color: sub }} />
                        <Text style={{ color: sub, fontSize: 13 }}>套餐 #{s.plan_id}</Text>
                        <Text style={{ color: sub, fontSize: 12 }}>
                          {formatTs(s.start_time)} — {formatTs(s.end_time)}
                        </Text>
                      </Flex>
                      <Tag style={{
                        color: cfg.color,
                        background: hexToRgba(cfg.color, 0.1),
                        border: `1px solid ${hexToRgba(cfg.color, 0.3)}`,
                        borderRadius: 6,
                      }}>{cfg.label}</Tag>
                    </Flex>
                  );
                })}
            </Card>
          )}
        </>
      ) : (
        /* 空状态 */
        <Card
          style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, marginBottom: 16 }}
          styles={{ body: { padding: '60px 24px' } }}
        >
          <Flex vertical align="center" gap={12}>
            <CalendarOutlined style={{ fontSize: 48, color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }} />
            <Title level={4} style={{ margin: 0 }}>暂无有效订阅</Title>
            <Text style={{ color: sub, textAlign: 'center' }}>
              订阅月卡套餐，享受每日固定额度和更优惠的价格。
            </Text>
            <Button type="primary" size="large" style={{ marginTop: 8, fontWeight: 600 }} onClick={() => navigate('/purchase')}>
              浏览套餐
            </Button>
          </Flex>
        </Card>
      )}

      {/* 月卡说明 */}
      <Card style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12 }}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>月卡说明</Title>
        <List
          dataSource={NOTES}
          renderItem={(item) => (
            <List.Item style={{ border: 'none', padding: '4px 0' }}>
              <Text style={{ color: sub }}><span style={{ marginRight: 8 }}>•</span>{item}</Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
