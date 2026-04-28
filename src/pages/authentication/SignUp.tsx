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
import { PATH_AUTH } from '../../constants';
import { useNavigate } from 'react-router-dom';
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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';
  const auth = useAuth();
  const [formInstance] = Form.useForm();

  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileRef = useRef<any>(null);

  useEffect(() => {
    apiRequest.get<any>('/status').then((data) => {
      const disabled = import.meta.env.VITE_DISABLE_TURNSTILE === 'true';
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

  const onFinish = async (values: any) => {
    if (serverStatus?.turnstile_check && !turnstileReady) {
      message.error(t('auth.captchaRequired'));
      return;
    }
    try {
      message.open({ type: 'loading', content: t('auth.registerLoading'), duration: 0 });
      await auth.register({
        username: values.email,
        email: values.email,
        password: values.password,
        aff_code: values.invitationCode,
      });
      message.destroy();
      message.success(t('auth.registerSuccess'), 1);
      setTimeout(() => navigate(PATH_AUTH.signin), 1000);
    } catch (error: any) {
      message.destroy();
      message.error(error.message || t('auth.registerFailed'));
      if (serverStatus?.turnstile_check) {
        clearTurnstileToken();
        setTurnstileReady(false);
        turnstileRef.current?.reset();
      }
    }
  };

  const labelStyle = { fontWeight: 700, fontSize: 14, color: isDark ? '#F5EBE7' : '#2D1A12' } as const;

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
        <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
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
              <img src={logoImg} alt="logo" style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover', display: 'block' }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{t('auth.brandName')}</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 16, letterSpacing: '0.05em' }}>
              {t('auth.tagline')}
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {t('auth.heroTitle')}<br />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{t('auth.heroSubtitle')}</span>
            </h1>
          </div>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 44 }}>
            {t('auth.heroDesc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
            {[
              { icon: '⚡', title: t('auth.feature1Title'), desc: t('auth.feature1Desc') },
              { icon: '🛡️', title: t('auth.feature2Title'), desc: t('auth.feature2Desc') },
              { icon: '💰', title: t('auth.feature3Title'), desc: t('auth.feature3Desc') },
            ].map((item) => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 28 }}>
            {[
              { value: t('auth.stat1Value'), label: t('auth.stat1Label') },
              { value: t('auth.stat2Value'), label: t('auth.stat2Label') },
              { value: t('auth.stat3Value'), label: t('auth.stat3Label') },
            ].map((stat, i) => (
              <div key={stat.label} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
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
              boxShadow: isDark ? '0 18px 40px rgba(0,0,0,0.4)' : '0 18px 40px rgba(112,144,176,0.12)',
              borderRadius: '20px',
              border: 'none',
            }}
          >
            <Flex vertical align="flex-start" gap="large" style={{ width: '100%' }}>
              <Flex vertical gap={4}>
                <Title level={2} className="m-0" style={{ fontSize: '28px', fontWeight: 700, color: isDark ? '#F5EBE7' : '#2D1A12' }}>
                  {t('auth.signUpTitle')}
                </Title>
                <Text style={{ color: HORIZON.secondaryText, fontSize: '14px' }}>
                  {t('auth.signUpSubtitle')}
                </Text>
              </Flex>

              <Form
                name="sign-up-form"
                layout="vertical"
                style={{ width: '100%' }}
                initialValues={{
                  ...(import.meta.env.DEV && {
                    email: 'a@a.com',
                    password: '12345678',
                    cPassword: '12345678',
                  }),
                }}
                onFinish={onFinish}
                autoComplete="off"
                requiredMark={false}
                form={formInstance}
              >
                <Form.Item<FieldType>
                  label={<Text style={labelStyle}>{t('auth.emailLabel')}</Text>}
                  name="email"
                  rules={[
                    { required: true, message: t('auth.emailRequired') },
                    { type: 'email', message: t('auth.emailInvalid') },
                  ]}
                >
                  <Input placeholder={t('auth.emailPlaceholder')} size="large" />
                </Form.Item>

                <Form.Item<FieldType>
                  label={<Text style={labelStyle}>{t('auth.passwordLabel')}</Text>}
                  name="password"
                  rules={[
                    { required: true, message: t('auth.passwordRequired') },
                    { min: 8, message: t('auth.passwordMin') },
                    { max: 20, message: t('auth.passwordMax') },
                  ]}
                >
                  <Input.Password placeholder={t('auth.passwordPlaceholder')} size="large" />
                </Form.Item>

                <Form.Item<FieldType>
                  label={<Text style={labelStyle}>{t('auth.confirmPasswordLabel')}</Text>}
                  name="cPassword"
                  rules={[
                    { required: true, message: t('auth.confirmPasswordRequired') },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) return Promise.resolve();
                        return Promise.reject(new Error(t('auth.passwordMismatch')));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder={t('auth.confirmPasswordPlaceholder')} size="large" />
                </Form.Item>

                <Form.Item<FieldType>
                  label={<Text style={labelStyle}>{t('auth.inviteCodeLabel')}</Text>}
                  name="invitationCode"
                >
                  <Input placeholder={t('auth.inviteCodePlaceholder')} size="large" />
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
                    {t('auth.signUpBtn')}
                  </Button>
                </Form.Item>

                <Flex justify="center" gap={4} style={{ marginTop: '1rem' }}>
                  <Text style={{ color: isDark ? 'rgba(245,235,231,0.6)' : '#A08070' }}>{t('auth.hasAccount')}</Text>
                  <Link href={PATH_AUTH.signin} style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>
                    {t('auth.goSignIn')}
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
