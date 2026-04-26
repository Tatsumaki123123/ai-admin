import {
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  message,
  Row,
  Switch,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Turnstile } from '@marsidev/react-turnstile';

import { PATH_AUTH, PATH_DASHBOARD } from '../../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/theme/themeSlice';
import { RootState } from '../../redux/store';
import { apiRequest, setTurnstileToken, clearTurnstileToken } from '../../services/api/apiClient';

const { Title, Text, Link } = Typography;

type FieldType = {
  username?: string;
  password?: string;
  remember?: boolean;
};

interface ServerStatus {
  turnstile_check: boolean;
  turnstile_site_key: string;
}

export const SignInPage = () => {
  const {
    token: { colorPrimary, colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const auth = useAuth();
  const [formInstance] = Form.useForm();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  // turnstileReady tracks whether the widget has produced a valid token,
  // used only to enable/disable the submit button.
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileRef = useRef<any>(null);

  // Fetch server status to check if Turnstile is enabled
  useEffect(() => {
    apiRequest.get<any>('/status').then((data) => {
      // VITE_DISABLE_TURNSTILE=true → skip widget entirely
      const disabled = import.meta.env.VITE_DISABLE_TURNSTILE === 'true';
      // VITE_TURNSTILE_DEV_TOKEN → interceptor handles it, no widget needed
      const hasDevToken = import.meta.env.DEV && !!import.meta.env.VITE_TURNSTILE_DEV_TOKEN;
      const turnstileCheck = (disabled || hasDevToken) ? false : (data?.turnstile_check ?? false);
      const devSiteKey = import.meta.env.VITE_TURNSTILE_DEV_SITE_KEY as string | undefined;
      const siteKey = (import.meta.env.DEV && devSiteKey)
        ? devSiteKey
        : (data?.turnstile_site_key ?? '');
      setServerStatus({ turnstile_check: turnstileCheck, turnstile_site_key: siteKey });
    }).catch(() => {
      setServerStatus({ turnstile_check: false, turnstile_site_key: '' });
    });
  }, []);

  // Monitor authentication status and redirect when user logs in
  useEffect(() => {
    if (auth.isAuthenticated && isRedirecting) {
      const fromLocation = location.state?.from?.pathname;
      const targetPath = fromLocation || PATH_DASHBOARD.default;
      navigate(targetPath, { replace: true });
      setIsRedirecting(false);
    }
  }, [auth.isAuthenticated, isRedirecting, navigate, location]);

  const onFinish = async (values: any) => {
    // If Turnstile is enabled, require a valid token
    if (serverStatus?.turnstile_check && !turnstileReady) {
      message.error('请先完成人机验证');
      return;
    }

    try {
      message.open({
        type: 'loading',
        content: 'Logging in...',
        duration: 0,
      });

      await auth.login({ username: values.username!, password: values.password! });

      message.destroy();
      message.success('Login successful! Redirecting to dashboard...', 1);
      setIsRedirecting(true);
    } catch (err: any) {
      message.destroy();
      message.error(err.message || 'Login failed. Please try again.');
      // Reset widget so user gets a fresh token on retry
      if (serverStatus?.turnstile_check) {
        clearTurnstileToken();
        setTurnstileReady(false);
        turnstileRef.current?.reset();
      }
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Row
      style={{
        minHeight: '100vh',
        overflow: 'auto',
        position: 'relative',
        background: colorBgContainer,
      }}
      align="middle"
      justify="center"
    >
      <div
        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
      >
        <Tooltip title="Toggle theme">
          <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={mytheme === 'dark'}
            onClick={() => dispatch(toggleTheme())}
          />
        </Tooltip>
      </div>
      <Col xs={22} sm={20} md={16} lg={12} xl={10}>
        <Card
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
          }}
        >
          <Flex vertical align="center" gap="large" style={{ width: '100%' }}>
            <Flex vertical align="center" gap="small">
              <Title level={2} className="m-0" style={{ fontSize: '32px' }}>
                Login
              </Title>
              <Text style={{ color: '#999', fontSize: '14px' }}>
                Sign in to @Bcode account
              </Text>
            </Flex>

            <Form
              name="sign-in-form"
              layout="vertical"
              style={{ width: '100%' }}
              initialValues={{
                remember: true,
                ...(import.meta.env.DEV && {
                  username: 'a@a.com',
                  password: 'abcd.1234',
                }),
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              requiredMark={false}
              form={formInstance}
            >
              <Form.Item<FieldType>
                label="Username/Email"
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'Please input your username or email',
                  },
                ]}
              >
                <Input
                  placeholder="Enter your username or email"
                  style={{ width: '100%' }}
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item<FieldType>
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please input your password' },
                  {
                    min: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  {
                    max: 20,
                    message: 'Password must be no more than 20 characters',
                  },
                ]}
              >
                <Input.Password
                  placeholder="Enter your password (8-20 characters)"
                  style={{ width: '100%' }}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </Form.Item>

              <Form.Item<FieldType> name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              {/* Turnstile widget — only rendered when server has it enabled */}
              {serverStatus?.turnstile_check && serverStatus.turnstile_site_key && (
                <Form.Item>
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={serverStatus.turnstile_site_key}
                    onSuccess={(token) => { setTurnstileToken(token); setTurnstileReady(true); }}
                    onExpire={() => { clearTurnstileToken(); setTurnstileReady(false); }}
                    onError={() => {
                      clearTurnstileToken();
                      setTurnstileReady(false);
                      message.error('人机验证加载失败，请刷新重试');
                    }}
                    options={{ theme: mytheme === 'dark' ? 'dark' : 'light' }}
                  />
                </Form.Item>
              )}

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={auth.isLoading}
                  disabled={serverStatus?.turnstile_check ? !turnstileReady : false}
                  block
                  style={{
                    background: colorPrimary,
                    borderColor: colorPrimary,
                  }}
                >
                  Login
                </Button>
              </Form.Item>

              <Flex justify="center" gap={4} style={{ marginTop: '1rem' }}>
                <Text>Don't have an account?</Text>
                <Link href={PATH_AUTH.signup} style={{ color: colorPrimary }}>
                  Sign up here
                </Link>
              </Flex>
            </Form>
          </Flex>
        </Card>
      </Col>
    </Row>
  );
};
