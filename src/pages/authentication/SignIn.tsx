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

import { PATH_AUTH, PATH_DASHBOARD } from '../../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/theme/themeSlice';
import { RootState } from '../../redux/store';

const { Title, Text, Link } = Typography;

type FieldType = {
  username?: string;
  password?: string;
  remember?: boolean;
};

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
    try {
      message.open({
        type: 'loading',
        content: 'Logging in...',
        duration: 0,
      });

      // Call login using AuthContext
      await auth.login({
        username: values.username!,
        password: values.password!,
      });

      message.destroy();
      message.success('Login successful! Redirecting to dashboard...', 1);

      // Set flag to trigger redirect in useEffect
      setIsRedirecting(true);
    } catch (err: any) {
      message.destroy();
      message.error(err.message || 'Login failed. Please try again.');
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
                username: 'a@a.com',
                password: 'abcd.1234',
                remember: true,
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

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={auth.isLoading}
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
