import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Flex,
  Table,
  Tag,
  Empty,
  Spin,
  Modal,
  message,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  GiftOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';

const { Text, Title } = Typography;

const QUOTA_UNIT = 500_000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  quota: number;
  used_quota: number;
  aff_quota: number;
  request_count: number;
  display_name: string;
  username: string;
}

interface RedemptionRecord {
  amount: number;
  trade_no: string;
  complete_time: number;
  money: number;
  type: string;
  status: string;
}

interface RedemptionResponse {
  items: RedemptionRecord[];
  total: number;
  page: number;
  page_size: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUsd(raw: number): string {
  const v = raw / QUOTA_UNIT;
  return v < 0.01 ? `$${v.toFixed(4)}` : `$${v.toFixed(2)}`;
}

function fmtTs(ts: number): string {
  return ts > 0
    ? new Date(ts * 1000).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      })
    : '—';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const RedeemPage = () => {
  usePageHeader({ title: '兑换码', description: '输入兑换码以充值余额' });
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [successModal, setSuccessModal] = useState<{ open: boolean; quota: number }>({ open: false, quota: 0 });

  const [records, setRecords] = useState<RedemptionRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1, pageSize: 10, total: 0,
  });

  const fetchUserInfo = useCallback(async () => {
    setLoadingUser(true);
    try {
      const info = await apiClient.get('/user/self');
      setUserInfo(info as UserInfo);
    } catch { /* ignore */ }
    finally { setLoadingUser(false); }
  }, []);

  const fetchRecords = useCallback(async (page = 1, pageSize = 10) => {
    setLoadingRecords(true);
    try {
      const data: RedemptionResponse = await apiClient.get('/user/topup/redemptions', {
        params: { page, page_size: pageSize },
      });
      setRecords(data?.items ?? []);
      setPagination((p) => ({
        ...p,
        current: data?.page ?? page,
        pageSize: data?.page_size ?? pageSize,
        total: data?.total ?? 0,
      }));
    } catch { /* ignore */ }
    finally { setLoadingRecords(false); }
  }, []);

  useEffect(() => { fetchUserInfo(); }, [fetchUserInfo]);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) { message.warning('请输入兑换码'); return; }
    setSubmitting(true);
    try {
      const res: any = await apiClient.post('/user/topup', { key: trimmed });
      const quotaUnits: number = typeof res === 'number' ? res : (res?.data ?? 0);
      setCode('');
      fetchUserInfo();
      fetchRecords(1, pagination.pageSize as number);
      setSuccessModal({ open: true, quota: quotaUnits });
    } catch { /* interceptor handles */ }
    finally { setSubmitting(false); }
  };

  const balance = userInfo
    ? `$${(userInfo.quota / QUOTA_UNIT).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$0.00';

  const cardBg = isDark
    ? `linear-gradient(135deg, ${hexToRgba(PRIMARY_COLOR, 0.6)} 0%, ${hexToRgba(PRIMARY_COLOR, 0.4)} 100%)`
    : `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #c46446 100%)`;
  const sectionBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e8e8e8';
  const sub = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const columns: ColumnsType<RedemptionRecord> = [
    {
      title: '兑换码 ID',
      dataIndex: 'trade_no',
      key: 'trade_no',
      width: 120,
      render: (v: string) => {
        const parts = v?.split('-') ?? [];
        const id = parts[1] ?? v;
        return <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>#{id}</Text>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: () => (
        <Tag style={{
          color: '#52c41a', background: 'rgba(82,196,26,0.1)',
          border: '1px solid rgba(82,196,26,0.3)', fontWeight: 600, borderRadius: 6,
        }}>成功</Tag>
      ),
    },
    {
      title: '获得额度',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      width: 120,
      render: (v: number) => (
        <Text strong style={{ color: '#52c41a' }}>+{fmtUsd(v)}</Text>
      ),
    },
    {
      title: '兑换时间',
      dataIndex: 'complete_time',
      key: 'complete_time',
      width: 160,
      render: (v: number) => <Text style={{ color: sub, fontSize: 13 }}>{fmtTs(v)}</Text>,
    },
  ];

  return (
    <>
      <Flex gap={20} align="flex-start" wrap="wrap">
        {/* ── Left column ── */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          {/* Balance card */}
          <div style={{
            background: cardBg, borderRadius: 16, padding: '32px 24px',
            marginBottom: 20, textAlign: 'center', color: '#fff',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}>
              <GiftOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>当前余额</div>
            {loadingUser ? (
              <Spin style={{ color: '#fff' }} />
            ) : (
              <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>{balance}</div>
            )}
          </div>

          {/* Redeem form */}
          <Card
            style={{ marginBottom: 16, border: `1px solid ${border}`, background: sectionBg }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>兑换码</Text>
            <Input
              prefix={<GiftOutlined style={{ color: '#aaa' }} />}
              placeholder="请输入兑换码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onPressEnter={handleRedeem}
              size="large"
              style={{ marginBottom: 6 }}
              allowClear
            />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 14 }}>
              兑换码区分大小写
            </Text>
            <Button
              type="primary" size="large" block
              icon={<CheckCircleOutlined />}
              loading={submitting} onClick={handleRedeem}
              style={{ background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
            >
              兑换
            </Button>
          </Card>

          {/* Info */}
          <Card
            style={{
              border: `1px solid ${border}`,
              background: isDark ? hexToRgba(PRIMARY_COLOR, 0.08) : hexToRgba(PRIMARY_COLOR, 0.06),
            }}
            styles={{ body: { padding: '16px 24px' } }}
          >
            <Flex gap={10} align="flex-start">
              <InfoCircleOutlined style={{ color: PRIMARY_COLOR, fontSize: 16, marginTop: 2, flexShrink: 0 }} />
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>关于兑换码</Text>
                <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
                  <li><Text style={{ fontSize: 13 }}>每个兑换码只能使用一次</Text></li>
                  <li><Text style={{ fontSize: 13 }}>兑换成功后额度即时到账</Text></li>
                  <li>
                    <Text style={{ fontSize: 13 }}>
                      如有问题请联系客服{' '}
                      <Tag color={PRIMARY_COLOR} style={{ fontSize: 12 }}>微信 xxxxx</Tag>
                    </Text>
                  </li>
                </ul>
              </div>
            </Flex>
          </Card>
        </div>

        {/* ── Right column: history ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>兑换记录</Title>}
            extra={
              <Button
                size="small" icon={<ReloadOutlined />}
                loading={loadingRecords}
                onClick={() => fetchRecords(pagination.current as number, pagination.pageSize as number)}
              >
                刷新
              </Button>
            }
            style={{ border: `1px solid ${border}`, background: sectionBg }}
            styles={{ body: { padding: 0 } }}
          >
            {!loadingRecords && records.length === 0 ? (
              <Flex vertical align="center" justify="center" style={{ padding: '48px 0' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<Text type="secondary" style={{ fontSize: 13 }}>暂无兑换记录</Text>}
                />
              </Flex>
            ) : (
              <Table<RedemptionRecord>
                columns={columns}
                dataSource={records}
                rowKey="trade_no"
                loading={loadingRecords}
                pagination={{
                  ...pagination,
                  showTotal: (total) => `共 ${total} 条`,
                  size: 'small',
                  style: { padding: '10px 16px' },
                  onChange: (page, pageSize) => fetchRecords(page, pageSize),
                }}
                style={{ borderRadius: 12, overflow: 'hidden' }}
                locale={{ emptyText: '暂无兑换记录' }}
              />
            )}
          </Card>
        </div>
      </Flex>

      {/* ── Success modal ── */}
      <Modal
        open={successModal.open}
        onOk={() => setSuccessModal({ open: false, quota: 0 })}
        onCancel={() => setSuccessModal({ open: false, quota: 0 })}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="好的" centered
        title={
          <Flex align="center" gap={8}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            <span>兑换成功</span>
          </Flex>
        }
      >
        <Flex vertical align="center" gap={16} style={{ padding: '24px 0 8px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(82,196,26,0.1)', border: '2px solid rgba(82,196,26,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DollarOutlined style={{ fontSize: 28, color: '#52c41a' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : '#888', marginBottom: 4 }}>
              本次兑换获得余额
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#52c41a', lineHeight: 1.2 }}>
              {fmtUsd(successModal.quota)}
            </div>
          </div>
        </Flex>
      </Modal>
    </>
  );
};
