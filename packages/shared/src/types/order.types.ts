export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  STOCK = 'STOCK',
  LINK_REQUEST = 'LINK_REQUEST',
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  type: OrderType;
  status: OrderStatus;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
  shippingAddressId?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export interface CreateOrderDTO {
  items: { productId: string; quantity: number }[];
  shippingAddressId: string;
  notes?: string;
}

export interface IOrderTracking {
  id: string;
  orderId: string;
  status: OrderStatus;
  description: string;
  createdAt: Date;
}

export interface OrderListFilters {
  status?: OrderStatus;
  type?: OrderType;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}
