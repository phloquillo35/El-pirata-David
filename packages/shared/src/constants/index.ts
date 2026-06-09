export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

export const CURRENCY = {
  ARS: 'ARS',
  USD: 'USD',
  DEFAULT: 'ARS',
} as const;

export const STORAGE_KEYS = {
  CART: 'el-pirata-david-cart',
  AUTH_TOKEN: 'el-pirata-david-auth-token',
  THEME: 'el-pirata-david-theme',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    GOOGLE: '/auth/google',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  PRODUCTS: {
    BASE: '/products',
    BY_SLUG: (slug: string) => `/products/${slug}`,
    BY_ID: (id: string) => `/products/id/${id}`,
    FEATURED: '/products/featured',
    SEARCH: '/products/search',
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_SLUG: (slug: string) => `/categories/${slug}`,
  },
  CART: {
    BASE: '/cart',
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    TRACKING: (id: string) => `/orders/${id}/tracking`,
  },
  PAYMENTS: {
    CREATE: '/payments/create',
    WEBHOOK: '/payments/webhook',
    CONFIRM_TRANSFER: '/payments/confirm-transfer',
  },
  ADDRESSES: {
    BASE: '/addresses',
  },
  AI_REQUESTS: {
    BASE: '/ai-requests',
    BY_ID: (id: string) => `/ai-requests/${id}`,
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    AI_REQUESTS: '/admin/ai-requests',
    REPORTS: '/admin/reports',
  },
  UPLOAD: {
    IMAGE: '/upload/image',
  },
} as const;

export const MARKETPLACES = [
  { name: 'Mercado Libre', domain: 'mercadolibre.com', icon: 'shopping-bag' },
  { name: 'Amazon', domain: 'amazon.com', icon: 'shopping-cart' },
  { name: 'AliExpress', domain: 'aliexpress.com', icon: 'globe' },
  { name: 'eBay', domain: 'ebay.com', icon: 'shopping-bag' },
  { name: 'Shopify', domain: 'myshopify.com', icon: 'store' },
] as const;

export const SHIPPING_COST = 15000;
export const FREE_SHIPPING_THRESHOLD = 500000;
export const TAX_RATE = 0.1;
