import type { Meta, StoryObj } from '@storybook/react';
import { withRouter } from 'storybook-addon-react-router-v6';

import { SitemapCard } from './SitemapCard.tsx';

const MOCK_ITEMS = [
  { title: 'profile', path: '/user-profile/details' },
  { title: 'settings', path: '/user-profile/preferences' },
  { title: 'security', path: '/user-profile/security' },
];

const meta = {
  title: 'Components/Sitemap',
  component: SitemapCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [withRouter],
} satisfies Meta<typeof SitemapCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: {
      title: 'navigation',
      links: MOCK_ITEMS.map((d) => ({ title: d.title, path: '#' })),
    },
    style: { width: 400 },
  },
};
