import {
  Button,
  Card,
  Col,
  Dropdown,
  Flex,
  Form,
  Input,
  message,
  Row,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import { MoonOutlined, SunOutlined, GlobalOutlined } from '@ant-design/icons';
import { Turnstile } from '@marsidev/react-turnstile';

import { PATH_AUTH, PATH_DASHBOARD } from '../../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/theme/themeSlice';
import { RootState } from '../../redux/store';
import { apiRequest, setTurnstileToken, clearTurnstileToken } from '../../services/api/apiClient';
import { HORIZON, PRIMARY_COLOR } from '../../theme/colors';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/logo.png';

const { Title, Text, Link } = Typography;

type FieldType = {
  username?: string;
  password?: string;
};

interface ServerStatus {
  turnstile_check: boolean;
  turnstile_site_key: string;
}

export const SignInPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
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
    if (serverStatus?.turnstile_check && !turnstileReady) {
      message.error(t('auth.captchaRequired'));
      return;
    }
    try {
      message.open({ type: 'loading', content: t('auth.loginLoading'), duration: 0 });
      await auth.login({ username: values.username!, password: values.password! });
      message.destroy();
      message.success(t('auth.loginSuccess'), 1);
      setIsRedirecting(true);
    } catch (err: any) {
      message.destroy();
      message.error(err.message || t('auth.loginFailed'));
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
        background: isDark ? HORIZON.bgDark : HORIZON.bgLight,
      }}
      align="middle"
      justify="center"
    >
      {/* 左侧宣传区（仅大屏显示） */}
      <Col
        xs={0}
        lg={12}
        style={{
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(160deg, #1A1210 0%, #2C1A0E 50%, #1A1210 100%)'
            : 'linear-gradient(160deg, #C46446 0%, #da7658 45%, #E8956A 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景装饰 */}
        <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
          {/* Logo + 品牌名 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#fff',
              padding: 4,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              <img
                src={logoImg}
                alt="logo"
                style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover', display: 'block' }}
              />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              {t('auth.brandName')}
            </span>
          </div>

          {/* 主标题 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 16,
              letterSpacing: '0.05em',
            }}>
              {t('auth.tagline')}
            </div>
            <h1 style={{
              fontSize: 38,
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              {t('auth.heroTitle')}<br />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{t('auth.heroSubtitle')}</span>
            </h1>
          </div>

          <p style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            marginBottom: 44,
          }}>
            {t('auth.heroDesc')}
          </p>

          {/* 特性列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
            {[
              {
                icon: '⚡',
                title: t('auth.feature1Title'),
                desc: t('auth.feature1Desc'),
              },
              {
                icon: '🛡️',
                title: t('auth.feature2Title'),
                desc: t('auth.feature2Desc'),
              },
              {
                icon: '💰',
                title: t('auth.feature3Title'),
                desc: t('auth.feature3Desc'),
              },
            ].map((item) => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 底部数据 */}
          <div style={{
            display: 'flex', gap: 0,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: 28,
          }}>
            {[
              { value: t('auth.stat1Value'), label: t('auth.stat1Label') },
              { value: t('auth.stat2Value'), label: t('auth.stat2Label') },
              { value: t('auth.stat3Value'), label: t('auth.stat3Label') },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                flex: 1,
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Col>

      {/* 右侧表单区 */}
      <Col
        xs={24}
        lg={12}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* 右上角：语言切换 + 主题切换 */}
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                selectedKeys: [currentLang],
                items: [
                  {
                    key: 'zh',
                    label: <Flex align="center" gap={8}><span>🇨🇳</span><span>{t('auth.langZh')}</span></Flex>,
                    onClick: () => i18n.changeLanguage('zh'),
                  },
                  {
                    key: 'en',
                    label: <Flex align="center" gap={8}><span>🇺🇸</span><span>{t('auth.langEn')}</span></Flex>,
                    onClick: () => i18n.changeLanguage('en'),
                  },
                ],
              }}
            >
              <Button
                type="text"
                icon={<GlobalOutlined />}
                size="small"
                style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#888', fontSize: 13 }}
              >
                {currentLang === 'zh' ? '中文' : 'EN'}
              </Button>
            </Dropdown>
            <Tooltip title={t('auth.toggleTheme')}>
              <Switch
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                checked={mytheme === 'dark'}
                onClick={() => dispatch(toggleTheme())}
              />
            </Tooltip>
          </div>

          <Card
            style={{
              boxShadow: isDark
                ? '0 18px 40px rgba(0,0,0,0.4)'
                : '0 18px 40px rgba(112,144,176,0.12)',
              borderRadius: '20px',
              border: 'none',
            }}
          >
            <Flex vertical align="flex-start" gap="large" style={{ width: '100%' }}>
              <Flex vertical gap={4}>
                <Title level={2} className="m-0" style={{ fontSize: '28px', fontWeight: 700, color: isDark ? '#F5EBE7' : '#2D1A12' }}>
                  {t('auth.signInTitle')}
                </Title>
                <Text style={{ color: HORIZON.secondaryText, fontSize: '14px' }}>
                  {t('auth.signInSubtitle')}
                </Text>
              </Flex>

              <Form
                name="sign-in-form"
                layout="vertical"
                style={{ width: '100%' }}
                initialValues={{
                  ...(import.meta.env.DEV && {
                    username: 'c@a.com',
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
                  label={<Text style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#F5EBE7' : '#2D1A12' }}>{t('auth.emailLabel')}</Text>}
                  name="username"
                  rules={[{ required: true, message: t('auth.usernameRequired') }]}
                >
                  <Input
                    placeholder={t('auth.emailPlaceholder')}
                    size="large"
                    style={{ width: '100%' }}
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item<FieldType>
                  label={
                    <Flex justify="space-between" style={{ width: '100%' }}>
                      <Text style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#F5EBE7' : '#2D1A12' }}>{t('auth.passwordLabel')}</Text>
                    </Flex>
                  }
                  name="password"
                  rules={[
                    { required: true, message: t('auth.passwordRequired') },
                    { min: 8, message: t('auth.passwordMin') },
                    { max: 20, message: t('auth.passwordMax') },
                  ]}
                >
                  <Input.Password
                    placeholder={t('auth.passwordPlaceholder')}
                    size="large"
                    style={{ width: '100%' }}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </Form.Item>

                {/* Turnstile widget */}
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
                        message.error(t('auth.captchaFailed'));
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
                      background: HORIZON.gradient,
                      borderColor: 'transparent',
                      height: 50,
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {t('auth.signInBtn')}
                  </Button>
                </Form.Item>

                <Flex justify="center" gap={4} style={{ marginTop: '1rem' }}>
                  <Text style={{ color: isDark ? 'rgba(245,235,231,0.6)' : '#A08070' }}>{t('auth.noAccount')}</Text>
                  <Link href={PATH_AUTH.signup} style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>
                    {t('auth.createAccount')}
                  </Link>
                </Flex>
              </Form>
            </Flex>
          </Card>
        </div>
      </Col>
    </Row>
  );
};
