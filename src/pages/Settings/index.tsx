import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Flex, message } from 'antd';
import { usePageHeader } from '../../hooks/usePageContext';
import apiClient from '../../services/api/apiClient';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../redux/store';
import { setUser } from '../../redux/auth/authSlice';

const { Text, Title } = Typography;

const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
};

export const SettingsPage = () => {
  usePageHeader({
    title: '个人设置',
    description: '管理你的账户信息。',
  });

  const { mytheme } = useSelector((state: RootState) => state.theme);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const isDark = mytheme === 'dark';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const subTextColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  // Username
  const [newUsername, setNewUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);

  // Password
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [updatingPwd, setUpdatingPwd] = useState(false);

  // Live user info from API
  const [email, setEmail] = useState(user?.email ?? '');
  const [username, setUsername] = useState(user?.userName ?? '');

  useEffect(() => {
    apiClient
      .get('/user/self')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          setEmail(d.email ?? user?.email ?? '');
          setUsername(d.username ?? user?.userName ?? '');
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      message.warning('请输入新用户名');
      return;
    }
    setUpdatingUsername(true);
    try {
      const res = await apiClient.put('/user/self', {
        username: newUsername.trim(),
      });
      if (res.data?.success) {
        message.success('用户名已更新');
        setUsername(newUsername.trim());
        dispatch(setUser({ ...user!, userName: newUsername.trim() }));
        setNewUsername('');
      }
    } catch {
      /* global interceptor handles */
    } finally {
      setUpdatingUsername(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPwd || !newPwd) {
      message.warning('请填写当前密码和新密码');
      return;
    }
    if (newPwd.length < 8) {
      message.warning('新密码至少 8 个字符');
      return;
    }
    setUpdatingPwd(true);
    try {
      const res = await apiClient.put('/user/password', {
        old_password: currentPwd,
        new_password: newPwd,
      });
      if (res.data?.success) {
        message.success('密码已修改');
        setCurrentPwd('');
        setNewPwd('');
      }
    } catch {
      /* global interceptor handles */
    } finally {
      setUpdatingPwd(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${borderColor}`,
    borderRadius: 12,
    marginBottom: 16,
  };

  const dividerStyle: React.CSSProperties = {
    borderTop: `1px solid ${borderColor}`,
    margin: 0,
  };

  return (
    <div style={{ maxWidth: 560 }}>
      {/* 账户信息 */}
      <Card style={cardStyle}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
          账户信息
        </Title>
        <div style={ROW_STYLE}>
          <Text style={{ color: subTextColor }}>邮箱</Text>
          <Text>{email || '—'}</Text>
        </div>
        <hr style={dividerStyle} />
        <div style={ROW_STYLE}>
          <Text style={{ color: subTextColor }}>用户名</Text>
          <Text>{username || '—'}</Text>
        </div>
      </Card>

      {/* 修改用户名 */}
      <Card style={cardStyle}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
          修改用户名
        </Title>
        <Flex vertical gap={12}>
          <Input
            placeholder="新用户名"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onPressEnter={handleUpdateUsername}
          />
          <div>
            <Button
              type="primary"
              loading={updatingUsername}
              onClick={handleUpdateUsername}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              更新
            </Button>
          </div>
        </Flex>
      </Card>

      {/* 修改密码 */}
      <Card style={cardStyle}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
          修改密码
        </Title>
        <Text
          style={{
            color: subTextColor,
            fontSize: 13,
            display: 'block',
            marginBottom: 16,
          }}
        >
          密码至少 8 个字符。
        </Text>
        <Flex vertical gap={12}>
          <Input.Password
            placeholder="当前密码"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
          />
          <Input.Password
            placeholder="新密码"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
          />
          <div>
            <Button
              type="primary"
              loading={updatingPwd}
              onClick={handleUpdatePassword}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              修改密码
            </Button>
          </div>
        </Flex>
      </Card>
    </div>
  );
};
