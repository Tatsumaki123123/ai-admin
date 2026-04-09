import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="欢迎"
      subTitle="请登录继续使用系统"
      extra={
        <Button type="primary" onClick={() => navigate('/auth/signin')}>
          前往登录
        </Button>
      }
    />
  );
};
