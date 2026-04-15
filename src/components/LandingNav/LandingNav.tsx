import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  LogoutOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import logoImg from '../../assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

const PRIMARY = '#da7658';
const BORDER = 'rgba(255,255,255,0.08)';
const MUTED = 'rgba(255,255,255,0.45)';

const models = [
  { name: 'Claude Opus 4.6', provider: 'by Anthropic', coming: false },
  { name: 'Claude Sonnet 4.6', provider: 'by Anthropic', coming: false },
  { name: 'Claude Haiku 4.5', provider: 'by Anthropic', coming: false },
  { name: 'GPT-5.4', provider: 'by OpenAI', coming: false },
  { name: 'Gemini', provider: '即将上线', coming: true },
];

export const LandingNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);

  const { user: authUser, logout, isAuthenticated } = useAuth();
  const { user: reduxUser, isAuthenticated: reduxAuth } = useSelector(
    (state: RootState) => state.auth
  );
  const loggedIn = isAuthenticated || reduxAuth;
  const displayName =
    (authUser as any)?.display_name ||
    (authUser as any)?.username ||
    (authUser as any)?.email?.split('@')[0] ||
    reduxUser?.email?.split('@')[0] ||
    'User';
  const userInitial = displayName.substring(0, 1).toUpperCase();

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { label: '定价', path: '/pricing' },
    { label: '文档', path: 'https://ai.apecode.site/docs', external: true },
    { label: '博客', path: 'https://ai.apecode.site/blog', external: true },
    { label: '分销合伙人', path: '/distribution' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${BORDER}`,
        padding: '0 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* ── Logo ── */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/')}
        >
          <img src={logoImg} alt="logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', color: '#fff' }}>
            ApeCode
          </span>
        </div>

        {/* ── Center nav ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}>
          {/* Models dropdown */}
          <div ref={modelRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setModelOpen((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: modelOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: modelOpen ? PRIMARY : 'rgba(255,255,255,0.75)',
                fontSize: 14,
                fontWeight: modelOpen ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!modelOpen) (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                if (!modelOpen) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
              }}
            >
              模型
              <DownOutlined
                style={{
                  fontSize: 10,
                  transition: 'transform 0.2s',
                  transform: modelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Dropdown panel */}
            {modelOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 420,
                  background: '#161616',
                  border: `1px solid rgba(255,255,255,0.12)`,
                  borderRadius: 14,
                  padding: 12,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                }}
              >
                {models.map((m) => (
                  <div
                    key={m.name}
                    onClick={() => !m.coming && setModelOpen(false)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'transparent',
                      border: '1px solid transparent',
                      cursor: m.coming ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: m.coming ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!m.coming) {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 12, color: m.coming ? PRIMARY : MUTED }}>
                      {m.provider}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other nav links */}
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                if (link.external) window.open(link.path, '_blank');
                else navigate(link.path);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: isActive(link.path) ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: isActive(link.path) ? '#fff' : 'rgba(255,255,255,0.75)',
                fontSize: 14,
                fontWeight: isActive(link.path) ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                if (!isActive(link.path))
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = isActive(link.path) ? '#fff' : 'rgba(255,255,255,0.75)';
                if (!isActive(link.path))
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* ── Right: auth buttons ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {loggedIn ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <DashboardOutlined />
                控制台
              </button>
              <Dropdown
                menu={{
                  items: [
                    { key: 'dashboard', icon: <DashboardOutlined />, label: '控制台', onClick: () => navigate('/dashboard') },
                    { type: 'divider' },
                    {
                      key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true,
                      onClick: async () => { await logout(); navigate('/'); },
                    },
                  ],
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Avatar size={34} style={{ background: PRIMARY, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  {userInitial}
                </Avatar>
              </Dropdown>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth/signin')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                登录
              </button>
              <button
                onClick={() => navigate('/auth/signup')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: PRIMARY,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                免费注册
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
