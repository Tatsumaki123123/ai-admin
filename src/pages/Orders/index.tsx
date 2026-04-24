import { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Table, Tag, Flex, Input, Select, type TablePaginationConfig } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';

const { Text } = Typography;

interface TopupItem {
  id: number;
  user_id: number;
  amount: number;
  money: number;
  trade_no: string;
  payment_method: string;
  create_time: number;
  complete_time: number;
  status: string;
}

interface TopupResponse {
  page: number;
  page_size: number;
  total: number;
  items: TopupItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  success:  { label: '成功',   color: '#52c41a' },
  pending:  { label: '待支付', color: '#faad14' },
  failed:   { label: '失败',   color: '#ff4d4f' },
  expired:  { label: '已过期', color: '#8c8c8c' },
  refunded: { label: '已退款', color: '#8c8c8c' },
};

const PAYMENT_LABEL: Record<string, string> = {
  wxpay:  '微信支付',
  alipay: '支付宝',
  usdt:   'USDT',
};

const formatTs = (ts: number) =>
  ts > 0
    ? new Date(ts * 1000).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      })
    : '—';

const isSubscription = (record: TopupItem) => {
  const tradeNo = (record.trade_no || '').toLowerCase();
  return Number(record.amount || 0) === 0 && tradeNo.startsWith('sub');
};

export const OrdersPage = () => {
  usePageHeader({ title: '我的订单', description: '查看充值和订阅记录。' });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [items, setItems] = useState<TopupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1, pageSize: 10, total: 0,
  });
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const fetchOrders = useCallback(async (
    page = 1,
    pageSize = 10,
    kw = keyword,
    status = statusFilter,
    payment = paymentFilter,
  ) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { p: page, page_size: pageSize };
      if (kw.trim()) params.keyword = kw.trim();
      if (status) params.status = status;
      if (payment) params.payment_method = payment;
      const data = await apiClient.get<TopupResponse>('/user/topup/self', { params });
      setItems(data.items ?? []);
      setPagination((p) => ({ ...p, current: data.page, pageSize: data.page_size, total: data.total }));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [keyword, statusFilter, paymentFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const sub = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

  const columns: ColumnsType<TopupItem> = [
    {
      title: '订单号',
      dataIndex: 'trade_no',
      key: 'trade_no',
      width: 260,
      ellipsis: true,
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</Text>
      ),
    },
    {
      title: '类型',
      key: 'type',
      width: 100,
      render: (_, r) => {
        const isSub = isSubscription(r);
        return (
          <Tag style={{
            color: isSub ? '#722ed1' : '#1677ff',
            background: isSub ? 'rgba(114,46,209,0.1)' : 'rgba(22,119,255,0.1)',
            border: `1px solid ${isSub ? 'rgba(114,46,209,0.3)' : 'rgba(22,119,255,0.3)'}`,
            fontWeight: 600, borderRadius: 6,
          }}>
            {isSub ? '订阅套餐' : '充值额度'}
          </Tag>
        );
      },
    },
    {
      title: '金额',
      key: 'money',
      width: 120,
      render: (_, r) => (
        <Flex gap={6} align="center">
          <Text strong>¥{r.money.toFixed(2)}</Text>
          {r.amount > 0 && (
            <Text style={{ color: sub, fontSize: 12 }}>
              ${(r.amount / 500000).toFixed(2)}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 110,
      render: (v: string) => <Text>{PAYMENT_LABEL[v] ?? v}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v: string) => {
        const cfg = STATUS_CONFIG[v] ?? { label: v, color: PRIMARY_COLOR };
        return (
          <Tag style={{
            color: cfg.color,
            background: hexToRgba(cfg.color, 0.1),
            border: `1px solid ${hexToRgba(cfg.color, 0.3)}`,
            fontWeight: 600, borderRadius: 6,
          }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 170,
      render: (v: number) => <Text style={{ fontSize: 13 }}>{formatTs(v)}</Text>,
    },
    {
      title: '完成时间',
      dataIndex: 'complete_time',
      key: 'complete_time',
      width: 170,
      render: (v: number) => (
        <Text style={{ fontSize: 13, color: v > 0 ? undefined : sub }}>{formatTs(v)}</Text>
      ),
    },
  ];

  return (
    <div>
      {/* 筛选栏 */}
      <Flex gap={10} wrap="wrap" style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索订单号..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 240 }}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (!e.target.value.trim()) fetchOrders(1, pagination.pageSize as number, '', statusFilter, paymentFilter);
          }}
          onSearch={(v) => fetchOrders(1, pagination.pageSize as number, v, statusFilter, paymentFilter)}
        />
        <Select
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); fetchOrders(1, pagination.pageSize as number, keyword, v, paymentFilter); }}
          style={{ width: 130 }}
          options={[
            { label: '全部状态', value: '' },
            { label: '成功', value: 'success' },
            { label: '待支付', value: 'pending' },
            { label: '失败', value: 'failed' },
            { label: '已过期', value: 'expired' },
          ]}
        />
        <Select
          value={paymentFilter}
          onChange={(v) => { setPaymentFilter(v); fetchOrders(1, pagination.pageSize as number, keyword, statusFilter, v); }}
          style={{ width: 130 }}
          options={[
            { label: '全部方式', value: '' },
            { label: '微信支付', value: 'wxpay' },
            { label: '支付宝', value: 'alipay' },
            { label: 'USDT', value: 'usdt' },
          ]}
        />
      </Flex>
      <Card
        style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<TopupItem>
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50'],
            style: { padding: '12px 20px' },
          }}
          onChange={(pg) => fetchOrders(pg.current ?? 1, pg.pageSize ?? 10, keyword, statusFilter, paymentFilter)}
          scroll={{ x: 900 }}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};
