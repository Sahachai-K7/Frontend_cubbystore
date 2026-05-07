import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { RequireAuth } from './RequireAuth'

// Lazy-load user-area pages — saves initial bundle
const WalletPage = lazy(() =>
  import('@/pages/WalletPage').then((m) => ({ default: m.WalletPage })),
)
const TopupPage = lazy(() =>
  import('@/pages/TopupPage').then((m) => ({ default: m.TopupPage })),
)
const CartPage = lazy(() =>
  import('@/pages/CartPage').then((m) => ({ default: m.CartPage })),
)
const OrdersPage = lazy(() =>
  import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })),
)
const OrderDetailPage = lazy(() =>
  import('@/pages/OrderDetailPage').then((m) => ({
    default: m.OrderDetailPage,
  })),
)
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const WishlistPage = lazy(() =>
  import('@/pages/WishlistPage').then((m) => ({ default: m.WishlistPage })),
)
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)
const TermsPage = lazy(() =>
  import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })),
)
const FaqPage = lazy(() =>
  import('@/pages/FaqPage').then((m) => ({ default: m.FaqPage })),
)
const EmailVerifiedPage = lazy(() =>
  import('@/pages/EmailVerifiedPage').then((m) => ({
    default: m.EmailVerifiedPage,
  })),
)

// Lazy-load all admin pages — admins are < 5% of users so split entire bundle
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  })),
)
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/AdminOrdersPage').then((m) => ({
    default: m.AdminOrdersPage,
  })),
)
const AdminOrderDetailPage = lazy(() =>
  import('@/pages/admin/AdminOrderDetailPage').then((m) => ({
    default: m.AdminOrderDetailPage,
  })),
)
const AdminReviewsPage = lazy(() =>
  import('@/pages/admin/AdminReviewsPage').then((m) => ({
    default: m.AdminReviewsPage,
  })),
)
const AdminContactLinksPage = lazy(() =>
  import('@/pages/admin/AdminContactLinksPage').then((m) => ({
    default: m.AdminContactLinksPage,
  })),
)
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({
    default: m.AdminUsersPage,
  })),
)
const AdminUserDetailPage = lazy(() =>
  import('@/pages/admin/AdminUserDetailPage').then((m) => ({
    default: m.AdminUserDetailPage,
  })),
)
const AdminAuditLogPage = lazy(() =>
  import('@/pages/admin/AdminAuditLogPage').then((m) => ({
    default: m.AdminAuditLogPage,
  })),
)
const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/AdminCategoriesPage').then((m) => ({
    default: m.AdminCategoriesPage,
  })),
)
const AdminProductsPage = lazy(() =>
  import('@/pages/admin/AdminProductsPage').then((m) => ({
    default: m.AdminProductsPage,
  })),
)
const AdminProductCreatePage = lazy(() =>
  import('@/pages/admin/AdminProductCreatePage').then((m) => ({
    default: m.AdminProductCreatePage,
  })),
)
const AdminProductEditPage = lazy(() =>
  import('@/pages/admin/AdminProductEditPage').then((m) => ({
    default: m.AdminProductEditPage,
  })),
)
const AdminPaymentConfigPage = lazy(() =>
  import('@/pages/admin/AdminPaymentConfigPage').then((m) => ({
    default: m.AdminPaymentConfigPage,
  })),
)
const AdminWebhookConfigPage = lazy(() =>
  import('@/pages/admin/AdminWebhookConfigPage').then((m) => ({
    default: m.AdminWebhookConfigPage,
  })),
)
const AdminWebhookEventsPage = lazy(() =>
  import('@/pages/admin/AdminWebhookEventsPage').then((m) => ({
    default: m.AdminWebhookEventsPage,
  })),
)
const AdminIpAllowlistPage = lazy(() =>
  import('@/pages/admin/AdminIpAllowlistPage').then((m) => ({
    default: m.AdminIpAllowlistPage,
  })),
)
const AdminPromoCodesPage = lazy(() =>
  import('@/pages/admin/AdminPromoCodesPage').then((m) => ({
    default: m.AdminPromoCodesPage,
  })),
)
const AdminBulkImportPage = lazy(() =>
  import('@/pages/admin/AdminBulkImportPage').then((m) => ({
    default: m.AdminBulkImportPage,
  })),
)

function RouteFallback() {
  return (
    <div className="px-4 py-12 text-center text-sm text-muted-foreground">
      กำลังโหลดหน้า…
    </div>
  )
}

function withSuspense(node: React.ReactNode) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <ErrorBoundary>{node}</ErrorBoundary>
    </Suspense>
  )
}

export const router = createBrowserRouter([
  // Admin lives in its own top-level layout — no public Header/Footer/BottomNav
  {
    path: '/admin',
    element: <RequireAuth adminOnly />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: withSuspense(<AdminDashboardPage />) },
          { path: 'categories', element: withSuspense(<AdminCategoriesPage />) },
          { path: 'products', element: withSuspense(<AdminProductsPage />) },
          {
            path: 'products/new',
            element: withSuspense(<AdminProductCreatePage />),
          },
          {
            path: 'products/bulk',
            element: withSuspense(<AdminBulkImportPage />),
          },
          {
            path: 'products/:id',
            element: withSuspense(<AdminProductEditPage />),
          },
          { path: 'orders', element: withSuspense(<AdminOrdersPage />) },
          {
            path: 'orders/:id',
            element: withSuspense(<AdminOrderDetailPage />),
          },
          { path: 'reviews', element: withSuspense(<AdminReviewsPage />) },
          { path: 'users', element: withSuspense(<AdminUsersPage />) },
          { path: 'users/:id', element: withSuspense(<AdminUserDetailPage />) },
          { path: 'audit-log', element: withSuspense(<AdminAuditLogPage />) },
          { path: 'promo-codes', element: withSuspense(<AdminPromoCodesPage />) },
          {
            path: 'contact-links',
            element: withSuspense(<AdminContactLinksPage />),
          },
          {
            path: 'payment-config',
            element: withSuspense(<AdminPaymentConfigPage />),
          },
          {
            path: 'webhook-config',
            element: withSuspense(<AdminWebhookConfigPage />),
          },
          {
            path: 'webhook-events',
            element: withSuspense(<AdminWebhookEventsPage />),
          },
          {
            path: 'ip-allowlist',
            element: withSuspense(<AdminIpAllowlistPage />),
          },
        ],
      },
    ],
  },

  // Public + signed-in user routes share the same shell (header/footer/bottom-nav)
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'privacy', element: withSuspense(<PrivacyPage />) },
      { path: 'terms', element: withSuspense(<TermsPage />) },
      { path: 'faq', element: withSuspense(<FaqPage />) },
      { path: 'email-verified', element: withSuspense(<EmailVerifiedPage />) },
      {
        element: <RequireAuth />,
        children: [
          { path: 'cart', element: withSuspense(<CartPage />) },
          { path: 'orders', element: withSuspense(<OrdersPage />) },
          { path: 'orders/:id', element: withSuspense(<OrderDetailPage />) },
          { path: 'profile', element: withSuspense(<ProfilePage />) },
          { path: 'wallet', element: withSuspense(<WalletPage />) },
          { path: 'wallet/topup', element: withSuspense(<TopupPage />) },
          { path: 'wishlist', element: withSuspense(<WishlistPage />) },
        ],
      },
      { path: '*', element: <PlaceholderPage title="ไม่พบหน้านี้" /> },
    ],
  },
])
