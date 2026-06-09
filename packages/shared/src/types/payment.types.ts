export enum PaymentMethod {
  MERCADO_PAGO = 'MERCADO_PAGO',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface IPayment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionId?: string;
  payerEmail?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MercadoPagoPreference {
  items: {
    id: string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    currencyId: string;
    pictureUrl?: string;
  }[];
  payer?: {
    name?: string;
    email?: string;
  };
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
  autoReturn: 'approved';
  notificationUrl: string;
}

export interface BankTransferInfo {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  accountType: string;
  rut: string;
  email: string;
  reference: string;
}
