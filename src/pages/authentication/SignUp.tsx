import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Switch,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Verify as PuzzleCaptcha } from 'react-puzzle-captcha';
import 'react-puzzle-captcha/dist/react-puzzle-captcha.css';
import { Turnstile } from '@marsidev/react-turnstile';
import { PATH_AUTH } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/theme/themeSlice';
import { RootState } from '../../redux/store';
import { apiRequest, setTurnstileToken, clearTurnstileToken } from '../../services/api/apiClient';

const { Title, Text, Link } = Typography;

type FieldType = {
  email?: string;
  password?: string;
  cPassword?: string;
  invitationCode?: string;
};

interface ServerStatus {
  turnstile_check: boolean;
  turnstile_site_key: string;
}

export const SignUpPage = () => {
  const {
    token: { colorPrimary, colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const auth = useAuth();
  const [formInstance] = Form.useForm();
  const [imageCodeVerified, setImageCodeVerified] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);

  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
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

  const handleVerify = () => {
    setImageCodeVerified(true);
    message.success('Verification passed!');
    setVerifyModalVisible(false);
  };

  const handleVerifyFail = () => {
    setImageCodeVerified(false);
    message.error('Verification failed, please try again');
  };

  const onFinish = async (values: any) => {
    console.log('Sign up values:', values);

    if (!imageCodeVerified) {
      message.error('Please complete image verification first');
      return;
    }

    // If Turnstile is enabled, require a valid token
    if (serverStatus?.turnstile_check && !turnstileReady) {
      message.error('请先完成人机验证');
      return;
    }

    try {
      message.open({
        type: 'loading',
        content: 'Creating your account...',
        duration: 0,
      });

      await auth.register({
        username: values.email,
        email: values.email,
        password: values.password,
        aff_code: values.invitationCode,
      });

      message.destroy();
      message.success(
        'Account created successfully! Redirecting to login...',
        1
      );

      setTimeout(() => {
        navigate(PATH_AUTH.signin);
      }, 1000);
    } catch (error: any) {
      message.destroy();
      message.error(error.message || 'Registration failed');
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
                Register
              </Title>
              <Text style={{ color: '#999', fontSize: '14px' }}>
                Create @Bcode account
              </Text>
            </Flex>

            <Form
              name="sign-up-form"
              layout="vertical"
              style={{ width: '100%' }}
              initialValues={{
                remember: true,
                email: 'a@a.com',
                password: '12345678',
                cPassword: '12345678',
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              requiredMark={false}
              form={formInstance}
            >
              <Form.Item<FieldType>
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  placeholder="Enter your email"
                  style={{ width: '100%' }}
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
                />
              </Form.Item>

              <Form.Item<FieldType>
                label="Confirm Password"
                name="cPassword"
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('Passwords do not match')
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Confirm your password"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item label="Image Verification">
                <Button
                  block
                  size="large"
                  onClick={() => setVerifyModalVisible(true)}
                  style={{
                    background: imageCodeVerified ? '#52c41a' : '#C17856',
                    color: '#fff',
                    borderColor: imageCodeVerified ? '#52c41a' : '#C17856',
                  }}
                  disabled={imageCodeVerified}
                >
                  {imageCodeVerified
                    ? '✓ Verification Passed'
                    : 'Click to Verify'}
                </Button>
              </Form.Item>

              <Form.Item<FieldType>
                label="Invitation Code"
                name="invitationCode"
                rules={[]}
              >
                <Input
                  placeholder="Enter invitation code (optional)"
                  style={{ width: '100%' }}
                />
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
                  style={{ background: '#C17856', borderColor: '#C17856' }}
                >
                  Register
                </Button>
              </Form.Item>

              <Flex justify="center" gap={4} style={{ marginTop: '1rem' }}>
                <Text>Already have an account?</Text>
                <Link href={PATH_AUTH.signin} style={{ color: colorPrimary }}>
                  Sign in
                </Link>
              </Flex>
            </Form>

            <Modal
              title="Image Verification"
              open={verifyModalVisible}
              onCancel={() => setVerifyModalVisible(false)}
              footer={null}
              centered
            >
              <PuzzleCaptcha
                onSuccess={handleVerify}
                onFail={handleVerifyFail}
              />
            </Modal>
          </Flex>
        </Card>
      </Col>
    </Row>
  );
};
