import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  DashboardPage,
  ApiKeysPage,
  DeployPage,
  RedeemPage,
  TopUpPage,
  OrdersPage,
  QuotaRecordsPage,
  SubscriptionPage,
  DistributionPage,
  CommissionsPage,
  SettingsPage,
  LogsPage,
  SignInPage,
  SignUpPage,
} from '../pages';
import { AppLayout } from '../layouts';
import { ProtectedRoute } from '../utils/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'keys',
        element: <ApiKeysPage />,
      },
      {
        path: 'deploy',
        element: <DeployPage />,
      },
      {
        path: 'redeem',
        element: <RedeemPage />,
      },
      {
        path: 'purchase',
        element: <TopUpPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'quota-records',
        element: <QuotaRecordsPage />,
      },
      {
        path: 'subscription',
        element: <SubscriptionPage />,
      },
      {
        path: 'distribution',
        element: <DistributionPage />,
      },
      {
        path: 'commissions',
        element: <CommissionsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'logs',
        element: <LogsPage />,
      },
    ],
  },
  ,
  {
    path: '/auth/signin',
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignInPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/auth/signup',
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignUpPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
