import { Layout } from 'antd';
import { ReactNode, useState } from 'react';
import { Sidebar, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from './Sidebar';
import { Topbar } from './Topbar';

const { Content, Footer } = Layout;

interface AppPageLayoutProps {
  children: ReactNode;
}

export const AppPageLayout: React.FC<AppPageLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      {/* 右侧内容 */}
      <Layout
        style={{
          marginLeft: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* 顶部导航栏 */}
        <Topbar collapsed={collapsed} />

        {/* 主内容区域 */}
        <Content
          style={{
            padding: '24px',
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 128px)',
          }}
        >
          {children}
        </Content>

        {/* 底部页脚 */}
        <Footer
          style={{
            textAlign: 'center',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          ApeCode ©2026 Created by Ape{' '}
        </Footer>
      </Layout>
    </Layout>
  );
};
