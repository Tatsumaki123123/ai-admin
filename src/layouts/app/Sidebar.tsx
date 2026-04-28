import {
  DashboardOutlined,
  KeyOutlined,
  ThunderboltOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  CalendarOutlined,
  GiftOutlined,
  TeamOutlined,
  DollarOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import logoImg from '../../assets/logo.png';
import { PRIMARY_COLOR } from '../../theme/colors';
import { useEffect, useRef } from 'react';
import { MENU_GROUPS, ALL_MENU_ITEMS } from './menuConfig';

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

const ALL_ITEMS = ALL_MENU_ITEMS;

// ── CSS 注入（只注入一次）────────────────────────────────────────────────────
const STYLE_ID = 'sidebar-keyframes';
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes sidebar-dot-in {
      0%   { transform: scale(0) rotate(-90deg); opacity: 0; }
      60%  { transform: scale(1.4) rotate(10deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes sidebar-dot-out {
      0%   { transform: scale(1); opacity: 1; }
      100% { transform: scale(0); opacity: 0; }
    }
    @keyframes sidebar-label-in {
      0%   { opacity: 0; transform: translateX(-6px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes sidebar-icon-pop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.18); }
      70%  { transform: scale(0.94); }
      100% { transform: scale(1); }
    }
    .sidebar-item-selected .sidebar-icon {
      animation: sidebar-icon-pop 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    .sidebar-item-selected .sidebar-dot {
      animation: sidebar-dot-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }
    .sidebar-label-visible {
      animation: sidebar-label-in 0.22s ease forwards;
    }
    /* 折叠按钮箭头旋转 */
    .collapse-arrow {
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    .collapse-arrow.is-collapsed {
      transform: rotate(0deg);
    }
    .collapse-arrow.is-expanded {
      transform: rotate(180deg);
    }
  `;
  document.head.appendChild(style);
}

// ── 单个菜单项 ────────────────────────────────────────────────────────────────
interface MenuItemProps {
  item: typeof ALL_ITEMS[0];
  selected: boolean;
  collapsed: boolean;
  isDark: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, selected, collapsed, isDark, onClick }) => {
  const prevSelected = useRef(selected);
  const wasJustSelected = selected && !prevSelected.current;
  useEffect(() => { prevSelected.current = selected; });

  const iconBg = selected ? item.iconBg : isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9';
  const iconColor = selected ? '#fff' : isDark ? 'rgba(255,255,255,0.5)' : '#64748b';

  const inner = (
    <div
      onClick={onClick}
      className={selected ? 'sidebar-item-selected' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 44,
        borderRadius: 10,
        cursor: 'pointer',
        padding: collapsed ? '0 0' : '0 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 12,
        background: selected
          ? isDark ? 'rgba(255,255,255,0.09)' : '#ffffff'
          : 'transparent',
        boxShadow: selected && !isDark ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
        transition: 'background 0.18s, box-shadow 0.18s',
        margin: '1px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!selected)
          (e.currentTarget as HTMLDivElement).style.background =
            isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
      }}
      onMouseLeave={e => {
        if (!selected)
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      {/* 图标容器 */}
      <div
        className="sidebar-icon"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 14,
          color: iconColor,
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {item.icon}
      </div>

      {/* 文字标签 — 折叠时完全不渲染，避免占位 */}
      {!collapsed && (
        <span
          className={wasJustSelected ? 'sidebar-label-visible' : ''}
          style={{
            fontSize: 13.5,
            fontWeight: selected ? 600 : 400,
            color: selected
              ? isDark ? '#fff' : '#0f172a'
              : isDark ? 'rgba(255,255,255,0.6)' : '#475569',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.15s, font-weight 0.15s',
          }}
        >
          {item.label}
        </span>
      )}

      {/* 右侧彩色圆点 */}
      {!collapsed && (
        <div
          className="sidebar-dot"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: item.iconBg,
            flexShrink: 0,
            opacity: selected ? 1 : 0,
            transform: selected ? 'scale(1)' : 'scale(0)',
            transition: selected ? 'none' : 'opacity 0.15s, transform 0.15s',
          }}
        />
      )}
    </div>
  );

  return collapsed
    ? <Tooltip title={item.label} placement="right">{inner}</Tooltip>
    : inner;
};

// ── 折叠按钮 ──────────────────────────────────────────────────────────────────
const CollapseButton: React.FC<{ collapsed: boolean; isDark: boolean; onClick: () => void }> = ({
  collapsed, isDark, onClick,
}) => {
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const color = isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8';

  const btn = (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 8,
        padding: collapsed ? '0' : '0 12px',
        background: 'transparent',
        border: `1px solid ${border}`,
        borderRadius: 10,
        cursor: 'pointer',
        color,
        fontSize: 13,
        fontWeight: 500,
        outline: 'none',
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
        el.style.color = isDark ? '#fff' : '#475569';
        el.style.borderColor = isDark ? 'rgba(255,255,255,0.18)' : '#cbd5e1';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = 'transparent';
        el.style.color = color;
        el.style.borderColor = border;
      }}
    >
      {/* 双箭头 SVG，旋转动画 */}
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        className={`collapse-arrow ${collapsed ? 'is-collapsed' : 'is-expanded'}`}
        style={{ flexShrink: 0 }}
      >
        <path d="M2.5 3.5L6.5 7.5L2.5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.5 3.5L11.5 7.5L7.5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      {/* 文字，折叠时隐藏 */}
      {!collapsed && (
        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>收起</span>
      )}
    </button>
  );

  return collapsed
    ? <Tooltip title="展开侧边栏" placement="right">{btn}</Tooltip>
    : btn;
};

// ── 主组件 ────────────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const isDark = mytheme === 'dark';

  const selectedKey =
    ALL_ITEMS.find(item => location.pathname.startsWith(item.key))?.key || '/dashboard';

  const bg     = isDark ? '#141414' : '#F8FAFC';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';

  return (
    <div
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        minWidth: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        background: bg,
        borderRight: `1px solid ${border}`,
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        zIndex: 99,
        overflow: 'hidden',
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Logo ── */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
          cursor: 'pointer',
          gap: 10,
          overflow: 'hidden',
        }}
      >
        <img
          src={logoImg}
          alt="logo"
          style={{ width: 32, height: 32, minWidth: 32, borderRadius: 8, objectFit: 'cover' }}
        />
        {/* 品牌名：折叠时用 visibility+width 隐藏，不影响 logo 居中 */}
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: isDark ? '#fff' : '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            width: collapsed ? 0 : 'auto',
            opacity: collapsed ? 0 : 1,
            transition: 'opacity 0.2s ease, width 0.25s ease',
          }}
        >
          ApeCode
        </span>
      </div>

      {/* ── Menu ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '12px 8px' : '12px 10px',
          overscrollBehavior: 'contain',
          transition: 'padding 0.25s ease',
        }}
      >
        {MENU_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 4 }}>
            {/* 分组标题：折叠时高度归零 */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isDark ? 'rgba(255,255,255,0.28)' : '#94a3b8',
                padding: collapsed ? '0 12px' : '8px 12px 4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                height: collapsed ? 0 : 'auto',
                opacity: collapsed ? 0 : 1,
                transition: 'height 0.2s ease, opacity 0.15s ease, padding 0.2s ease',
                pointerEvents: 'none',
              }}
            >
              {group.label}
            </div>

            {/* 折叠时分组分隔线 */}
            {collapsed && gi > 0 && (
              <div style={{ height: 1, background: border, margin: '4px 4px 8px' }} />
            )}

            {group.items.map(item => (
              <MenuItem
                key={item.key}
                item={item}
                selected={selectedKey === item.key}
                collapsed={collapsed}
                isDark={isDark}
                onClick={() => navigate(item.key)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ── Bottom ── */}
      <div
        style={{
          borderTop: `1px solid ${border}`,
          flexShrink: 0,
          padding: collapsed ? '12px 8px' : '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          transition: 'padding 0.25s ease',
        }}
      >
        <CollapseButton
          collapsed={collapsed}
          isDark={isDark}
          onClick={() => onCollapse(!collapsed)}
        />
      </div>
    </div>
  );
};
