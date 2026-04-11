import { useState, useEffect, useCallback } from 'react';
import { Card, Input, Select, Typography, Table, Tag, Flex, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';

const { Text } = Typography;
const { Option } = Select;

interface Order {
  id: string;
  order_no: string;
  product_name: string;
  amount: number;
  quota_value: number;
  payment_method: string;
  status: string;
  created_time: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending_payment: {
    label: '待支付',
    color: '#faad14',
    bg: 'rgba(250,173,20,0.12)',
  },
  paid: { label: '已支付', color: '#52c41a', bg: 'rgba(82,196,26,0.12)' },
  cancelled: {
    label: '已取消',
    color: '#8c8c8c',
    bg: 'rgba(140,140,140,0.12)',
  },
  refunded: { label: '已退款', color: '#ff4d4f', bg: 'rgba(255,77,79,0.12)' },
};

const PAYMENT_LABEL: Record<string, string> = {
  wechat: '微信',
  alipay: '支付宝',
  usdt: 'USDT',
};

const formatTimestamp = (ts: number) =>
  new Date(ts * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

export const OrdersPage = () => {
  usePageHeader({
    title: '我的订单',
    description: '查看订单历史和支付记录。',
  });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/order/list');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      }
    } catch {
      /* global interceptor handles */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      !searchText ||
      order.order_no.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchPayment =
      paymentFilter === 'all' || order.payment_method === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const subTextColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      render: (val: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{val}</Text>
      ),
    },
    {
      title: '商品',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: '金额',
      key: 'amount',
      render: (_, record) => (
        <Space size={4}>
          <Text strong>¥{record.amount.toFixed(2)}</Text>
          <Text style={{ color: subTextColor, fontSize: 12 }}>
            /${record.quota_value.toFixed(2)}
          </Text>
        </Space>
      ),
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (val: string) => (
        <Text>{PAYMENT_LABEL[val] ?? val.toUpperCase()}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => {
        const cfg = STATUS_CONFIG[val] ?? {
          label: val,
          color: PRIMARY_COLOR,
          bg: hexToRgba(PRIMARY_COLOR, 0.12),
        };
        return (
          <Tag
            style={{
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${hexToRgba(cfg.color, 0.3)}`,
              fontWeight: 600,
              borderRadius: 6,
            }}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_time',
      key: 'created_time',
      render: (val: number) => <Text>{formatTimestamp(val)}</Text>,
    },
  ];

  const selectStyle = {
    width: 140,
  };

  return (
    <div>
      {/* Filters */}
      <Flex gap={12} wrap="wrap" style={{ marginBottom: 20 }}>
        <Input
          placeholder="搜索订单号..."
          prefix={<SearchOutlined style={{ color: subTextColor }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 240 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={selectStyle}
        >
          <Option value="all">全部状态</Option>
          <Option value="pending_payment">待支付</Option>
          <Option value="paid">已支付</Option>
          <Option value="cancelled">已取消</Option>
          <Option value="refunded">已退款</Option>
        </Select>
        <Select
          value={paymentFilter}
          onChange={setPaymentFilter}
          style={selectStyle}
        >
          <Option value="all">全部方式</Option>
          <Option value="wechat">微信</Option>
          <Option value="alipay">支付宝</Option>
          <Option value="usdt">USDT</Option>
        </Select>
      </Flex>

      {/* Orders Table */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<Order>
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={
            filteredOrders.length > 10 ? { pageSize: 10, size: 'small' } : false
          }
          style={{ borderRadius: 12, overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};
