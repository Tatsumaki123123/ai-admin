import { Card, Button, Typography, Flex, List } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { usePageHeader } from '../../hooks/usePageContext';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { PRIMARY_COLOR } from '../../theme/colors';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const NOTES = [
  '月卡提供每日固定 USD 额度，每日零点（UTC+8）自动刷新',
  '当日未用完的额度不结转到次日',
  '月卡额度优先消耗，用完后自动切换到按量付费余额',
  '到期后自动停止，不会自动续费',
  '续费后新订阅立即生效，与旧订阅不叠加',
];

export const SubscriptionPage = () => {
  usePageHeader({
    title: '我的订阅',
    description: '管理你的月卡订阅。',
  });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const navigate = useNavigate();

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const subTextColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <div>
      {/* Empty state card */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          marginBottom: 16,
        }}
        styles={{ body: { padding: '60px 24px' } }}
      >
        <Flex vertical align="center" gap={12}>
          <CalendarOutlined
            style={{
              fontSize: 48,
              color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            }}
          />
          <Title level={4} style={{ margin: 0 }}>
            暂无有效订阅
          </Title>
          <Text style={{ color: subTextColor, textAlign: 'center' }}>
            订阅月卡套餐，享受每日固定额度和更优惠的价格。
          </Text>
          <Button
            type="primary"
            size="large"
            style={{
              marginTop: 8,
              background: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              borderRadius: 8,
              fontWeight: 600,
            }}
            onClick={() => navigate('/purchase')}
          >
            浏览套餐
          </Button>
        </Flex>
      </Card>

      {/* Notes card */}
      <Card
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
        }}
      >
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
          月卡说明
        </Title>
        <List
          dataSource={NOTES}
          renderItem={(item) => (
            <List.Item style={{ border: 'none', padding: '4px 0' }}>
              <Text style={{ color: subTextColor }}>
                <span style={{ marginRight: 8 }}>•</span>
                {item}
              </Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
