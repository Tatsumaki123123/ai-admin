import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Flex,
  List,
  Tag,
  Empty,
  Spin,
} from 'antd';
import {
  GiftOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR, hexToRgba } from '../../theme/colors';

const { Text, Title } = Typography;

interface UserInfo {
  quota: number;
  used_quota: number;
  aff_quota: number;
  request_count: number;
}

interface RedeemRecord {
  id: number;
  name: string;
  quota: number;
  created_time: number;
}

export const RedeemPage = () => {
  usePageHeader({
    title: '兑换码',
    description: '输入兑换码以充值余额或增加并发数',
  });
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [records, setRecords] = useState<RedeemRecord[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUserInfo = useCallback(async () => {
    setLoadingUser(true);
    try {
      const userInfo = await apiClient.get('/user/self');
      setUserInfo(userInfo);
    } catch {
      /* ignore */
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleRedeem = async () => {
    if (!code.trim()) {
      message.warning('请输入兑换码');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post('/user/redeem', { key: code.trim() });
      message.success('兑换成功！');
      setCode('');
      fetchUserInfo();
      setRecords((prev) => [
        {
          id: Date.now(),
          name: code.trim(),
          quota: res?.quota || 0,
          created_time: Math.floor(Date.now() / 1000),
        },
        ...prev,
      ]);
    } catch {
      /* global interceptor handles */
    } finally {
      setSubmitting(false);
    }
  };

  const balance = userInfo ? (userInfo.quota / 500000).toFixed(2) : '0.00';
  const requestCount = userInfo?.request_count ?? 0;

  const cardBg = isDark
    ? `linear-gradient(135deg, ${hexToRgba(PRIMARY_COLOR, 0.6)} 0%, ${hexToRgba(
        PRIMARY_COLOR,
        0.4
      )} 100%)`
    : `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #c46446 100%)`;

  const sectionBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e8e8e8';

  return (
    <Flex gap={20} align="flex-start">
      {/* ── Left column ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Balance card */}
        <div
          style={{
            background: cardBg,
            borderRadius: 16,
            padding: '32px 24px',
            marginBottom: 20,
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <GiftOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
            当前余额
          </div>
          {loadingUser ? (
            <Spin style={{ color: '#fff' }} />
          ) : (
            <>
              <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>
                ${balance}
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                并发数 {requestCount} 请求
              </div>
            </>
          )}
        </div>

        {/* Redeem form */}
        <Card
          style={{
            marginBottom: 16,
            border: `1px solid ${border}`,
            background: sectionBg,
          }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <Text
            strong
            style={{ fontSize: 14, display: 'block', marginBottom: 10 }}
          >
            兑换码
          </Text>
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
          <Text
            type="secondary"
            style={{ fontSize: 12, display: 'block', marginBottom: 14 }}
          >
            兑换码区分大小写
          </Text>
          <Button
            type="primary"
            size="large"
            block
            icon={<CheckCircleOutlined />}
            loading={submitting}
            onClick={handleRedeem}
            style={{ background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
          >
            兑换
          </Button>
        </Card>

        {/* Info */}
        <Card
          style={{
            border: `1px solid ${border}`,
            background: isDark
              ? hexToRgba(PRIMARY_COLOR, 0.08)
              : hexToRgba(PRIMARY_COLOR, 0.06),
          }}
          styles={{ body: { padding: '16px 24px' } }}
        >
          <Flex gap={10} align="flex-start">
            <InfoCircleOutlined
              style={{
                color: PRIMARY_COLOR,
                fontSize: 16,
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                关于兑换码
              </Text>
              <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
                <li>
                  <Text style={{ fontSize: 13 }}>每个兑换码只能使用一次</Text>
                </li>
                <li>
                  <Text style={{ fontSize: 13 }}>
                    兑换码可以增加余额、并发数或试用权限
                  </Text>
                </li>
                <li>
                  <Text style={{ fontSize: 13 }}>
                    如有兑换问题，请联系客服{' '}
                    <Tag color={PRIMARY_COLOR} style={{ fontSize: 12 }}>
                      微信 xxxxx
                    </Tag>
                  </Text>
                </li>
                <li>
                  <Text style={{ fontSize: 13 }}>余额和并发数即时更新</Text>
                </li>
              </ul>
            </div>
          </Flex>
        </Card>
      </div>

      {/* ── Right column: 兑换记录 ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Card
          style={{ border: `1px solid ${border}`, background: sectionBg }}
          styles={{ body: { padding: '16px 20px' } }}
        >
          <Title level={5} style={{ marginBottom: 12 }}>
            兑换记录
          </Title>
          {records.length === 0 ? (
            <Flex
              vertical
              align="center"
              justify="center"
              style={{ padding: '40px 0' }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    您的兑换历史记录显示在这里
                  </Text>
                }
              />
            </Flex>
          ) : (
            <List
              dataSource={records}
              renderItem={(item) => (
                <List.Item>
                  <Flex justify="space-between" style={{ width: '100%' }}>
                    <Text>{item.name}</Text>
                    <Text type="success">
                      +${(item.quota / 500000).toFixed(4)}
                    </Text>
                  </Flex>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </Flex>
  );
};
