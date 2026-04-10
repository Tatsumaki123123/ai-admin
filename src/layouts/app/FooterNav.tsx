import { Layout } from 'antd';

const { Footer } = Layout;

type FooterNavProps = React.HTMLAttributes<HTMLDivElement>;

const FooterNav = ({ ...others }: FooterNavProps) => {
  return <Footer {...others}>ApeCode © 2026 Created by Ape</Footer>;
};

export default FooterNav;
