# Mock Login 数据使用说明

## 概述

项目已配置 `/auth/login` 接口的 mock 数据，用于本地开发和测试。

## Mock 数据位置

- **文件路径**: `public/mocks/Login.json`
- **接口映射**: 在 `src/services/api/mockEndpointMapper.ts` 中配置

## 测试账号

使用任意邮箱和密码都能登录成功（mock 数据不验证凭证），返回的用户信息为：

```json
{
  "email": "demo@example.com",
  "userName": "Demo User",
  "roles": ["admin"]
}
```

## 如何使用

### 1. 确保 Mock 模式已开启

在项目中，mock 数据由 Redux `dataMode` 状态控制。检查以下配置：

- 环境变量 `.env` (可选):

  ```
  VITE_USE_MOCK_DATA=true
  ```

- 或者在应用界面切换数据模式（如果项目有提供切换按钮）

### 2. 登录测试

在登录表单中输入任意邮箱和密码，例如：

- Email: `demo@example.com`
- Password: `任意密码`

点击登录后，系统会：

1. 拦截 `/auth/login` 请求
2. 返回 `Login.json` 中的 mock 数据
3. 存储 token 到 localStorage
4. 设置用户认证状态

### 3. 返回的数据结构

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "mock-refresh-token-1234567890",
  "user": {
    "id": "1234567890",
    "email": "demo@example.com",
    "userName": "Demo User",
    "firstName": "Demo",
    "lastName": "User",
    "roles": ["admin"],
    "avatar": "https://i.pravatar.cc/150?img=1"
  },
  "expiresAt": "2024-12-02T00:00:00.000Z"
}
```

## 自定义 Mock 数据

如需修改返回的用户信息或 token，直接编辑 `public/mocks/Login.json` 文件：

```json
{
  "user": {
    "email": "your-email@example.com",
    "userName": "Your Name",
    "roles": ["admin", "user"]
  }
}
```

## 添加其他认证接口的 Mock

如需为其他认证接口添加 mock 数据（如注册、忘记密码等）：

1. 在 `public/mocks/` 创建对应的 JSON 文件，例如 `Register.json`
2. 在 `src/services/api/mockEndpointMapper.ts` 的 `ENDPOINT_MOCK_MAP` 中添加映射：
   ```typescript
   '/auth/register': '/mocks/Register.json',
   ```
3. 如需强制使用 mock（不管数据模式），添加到 `isMockOnlyEndpoint` 函数的列表中

## 切换到真实 API

当后端 API 准备好后：

1. 设置环境变量 `VITE_USE_MOCK_DATA=false`
2. 或在应用界面关闭 mock 模式
3. 从 `mockEndpointMapper.ts` 的 `isMockOnlyEndpoint` 列表中移除 `/auth/login`

## 注意事项

- Mock token 是假的 JWT，无法用于真实的后端验证
- Mock 数据不会进行密码验证，任何凭证都会成功
- 生产环境部署时记得禁用 mock 模式
