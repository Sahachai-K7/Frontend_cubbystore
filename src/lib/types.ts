export type Category = {
  id: string
  name: string
  slug: string
  parentId: string | null
  sortOrder: number
  createdAt: string
}

export type ProductListItem = {
  id: string
  name: string
  slug: string
  price: string
  imageUrl: string | null
  soldCount: number
  categoryId: string | null
  availableCount: number
  avgRating: string
  reviewCount: number
}

export type ProductDetail = ProductListItem & {
  description: string | null
  isActive: boolean
  createdAt: string
  category: { id: string; name: string; slug: string } | null
}

export type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  userName: string | null
}

export type ReviewSummary = { avg: number; count: number }

export type ReviewableItem = {
  orderItemId: string
  orderId: string
  productId: string
  productNameSnapshot: string
  productSlug: string | null
  deliveredAt: string | null
  existingReviewId: string | null
}

export type AdminReviewRow = {
  id: string
  productId: string
  productName: string | null
  productSlug: string | null
  userId: string
  userName: string | null
  userEmail: string | null
  rating: number
  comment: string | null
  deletedByAdmin: boolean
  createdAt: string
}

export type ContactPlatform =
  | 'line'
  | 'discord'
  | 'telegram'
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'email'
  | 'phone'
  | 'other'

export type ContactLinkPublic = {
  id: string
  platform: ContactPlatform
  label: string
  url: string
  sortOrder: number
}

export type ContactLinkAdmin = ContactLinkPublic & {
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type DashboardSummary = {
  sales: {
    today: { total: string; count: number }
    last7d: { total: string; count: number }
    last30d: { total: string; count: number }
  }
  orders: {
    paid: number
    delivered: number
    deliveryFailed: number
  }
  users: { newLast24h: number }
  stock: {
    lowCount: number
    topLow: Array<{
      id: string
      name: string
      slug: string
      soldCount: number
      available: number
    }>
  }
  topSellers: Array<{
    productId: string | null
    name: string | null
    slug: string | null
    qtySold: number
    revenue: string
  }>
  topups: { pendingCount: number; pendingTotal: string }
  walletLiability: string
}

export type AdminUserRow = {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  emailVerified: boolean
  createdAt: string
  orderCount: number
  totalSpent: string
  walletBalance: string
}

export type AdminUserDetail = {
  user: {
    id: string
    email: string
    name: string | null
    role: 'user' | 'admin'
    emailVerified: boolean
    createdAt: string
    updatedAt: string
  }
  stats: {
    orderCount: number
    totalSpent: string
    walletBalance: string
  }
  orders: Array<{
    id: string
    total: string
    status: 'paid' | 'delivered' | 'delivery_failed'
    createdAt: string
  }>
  walletTransactions: WalletTransaction[]
  sessions: Array<{
    id: string
    ipAddress: string | null
    userAgent: string | null
    expiresAt: string
    createdAt: string
  }>
}

export type AuditLogRow = {
  id: string
  adminId: string
  adminEmail: string | null
  adminName: string | null
  action: string
  target: string | null
  payload: unknown
  ip: string | null
  createdAt: string
}

export type AdminProduct = {
  id: string
  categoryId: string | null
  name: string
  slug: string
  description: string | null
  price: string
  imageUrl: string | null
  soldCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type StockItem = {
  id: string
  productId: string
  payload: string
  status: 'available' | 'sold'
  orderItemId: string | null
  soldAt: string | null
  createdAt: string
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

export type Topup = {
  id: string
  userId: string
  amountBase: string
  amountToPay: string
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled'
  expiresAt: string
  confirmedAt: string | null
  createdAt: string
}

export type TopupCreated = {
  id: string
  amountBase: string
  amountToPay: string
  expiresAt: string
  qrPayload: string
  qrDataUrl: string
}

export type WalletTransaction = {
  id: string
  userId: string
  type: 'topup' | 'purchase' | 'refund' | 'adjust'
  amount: string
  balanceAfter: string
  refId: string | null
  note: string | null
  createdAt: string
}

export type WalletInfo = {
  balance: string
  transactions: WalletTransaction[]
}

export type PaymentConfig = {
  id: number
  promptpayId: string
  promptpayIdType: 'phone' | 'citizen_id' | 'tax_id' | 'ewallet'
  accountName: string | null
  updatedAt: string
}

export type WebhookConfigSafe = {
  apiKeyHint: string
  mustContain: string[]
  amountRegex: string
  expiryMinutes: number
  randomMinDelta: string
  randomMaxDelta: string
  updatedAt: string
}

export type IpAllowlistRow = {
  id: string
  cidr: string
  label: string | null
  enabled: boolean
  addedBy: string | null
  addedAt: string
}

export type CartLine = {
  productId: string
  qty: number
  addedAt: string
  name: string
  slug: string
  price: string
  imageUrl: string | null
  isActive: boolean
  availableCount: number
}

export type CartView = {
  items: CartLine[]
  total: string
  count: number
}

export type Order = {
  id: string
  userId: string
  subtotal: string | null
  discount: string | null
  promoCode: string | null
  total: string
  status: 'paid' | 'delivered' | 'delivery_failed' | 'refunded'
  deliveredAt: string | null
  deliveryError: string | null
  refundedAt: string | null
  refundReason: string | null
  createdAt: string
}

export type OrderLine = {
  id: string
  orderId: string
  productId: string
  productNameSnapshot: string
  qty: number
  unitPrice: string
  delivered: Array<{
    id: string
    payload: string
    soldAt: string | null
  }>
}

export type OrderDetail = {
  order: Order
  lines: OrderLine[]
}

export type AdminOrderRow = Order & {
  userEmail: string | null
  userName: string | null
}

export type AdminOrderDetail = OrderDetail & {
  customer: { email: string; name: string | null } | null
}

export type WebhookEvent = {
  id: string
  rawBody: string
  headers: Record<string, string> | null
  sourceIp: string | null
  parsedAmount: string | null
  status:
    | 'matched'
    | 'unmatched'
    | 'rejected_filter'
    | 'rejected_invalid_key'
    | 'invalid_payload'
  matchedTopupId: string | null
  receivedAt: string
}

export type PromoCode = {
  id: string
  code: string
  type: 'percent' | 'amount'
  value: string
  minTotal: string | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  note: string | null
  createdAt: string
  updatedAt: string
}

export type PromoValidation = {
  ok: true
  code: string
  discount: string
  subtotal: string
  finalTotal: string
  type: 'percent' | 'amount'
  value: string
}

export type WishlistItem = {
  productId: string
  createdAt: string
  notifiedAt: string | null
  name: string
  slug: string
  price: string
  imageUrl: string | null
  isActive: boolean
  availableCount: number
}

export type SalesChartDay = {
  date: string
  revenue: string
  count: number
}

export type BulkImportResult = {
  name: string
  status: 'created' | 'skipped' | 'error'
  productId?: string
  slug?: string
  stockAdded?: number
  error?: string
}
