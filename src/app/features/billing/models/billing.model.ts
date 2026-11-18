
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'VOID';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'OTHER';

// export interface InvoicePatient {
//   id: string;
//   user?: {
//     firstName: string;
//     lastName: string;
//     email?: string;
//   };
// }

export interface InvoiceItem {
  id: string;
  description: string;
  itemType: string;
  referenceId?: string | null;
  quantity: number;
  unitPrice: number | string;
  amount: number | string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  appointmentId: string;
  patientId: string;
  subtotal: number | string;
  tax: number | string;
  discount: number | string;
  total: number | string;
  status: InvoiceStatus;
  issuedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  patient?: InvoicePatient;
  items?: InvoiceItem[];
  appointment?: {
    doctor?: {
      user?: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number | string;
  refundAmount: number | string;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: 'NONE' | 'RAZORPAY';
  referenceNumber?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  recordedBy?: {
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
}

export interface InvoiceBalance {
  invoiceId: string;
  invoiceNumber: string;
  invoiceTotal: number;
  totalPaid: number;
  totalRefunded: number;
  netPaid: number;
  balanceAmount: number;
  status: InvoiceStatus;
  paymentStatus: 'FULLY_PAID' | 'PARTIALLY_PAID' | 'UNPAID';
}

export interface CreateInvoiceRequest {
  appointmentId: string;
  tax?: number;
  discount?: number;
}

export interface RecordPaymentRequest {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  idempotencyKey?: string;
  notes?: string;
}

export interface CreateRazorpayOrderRequest {
  invoiceId: string;
}

export interface VerifyRazorpayPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface InvoicePatient {
  id: string;
  patientNumber?: string;
  user?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string | null;
  };
}

export interface InvoicePaymentHistory {
  id: string;
  invoiceNumber: string;
  total: number | string;
  status: InvoiceStatus;
  payments: PaymentWithRecorder[];
}

export interface PaymentWithRecorder extends Payment {
  recordedBy?: {
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
}

export interface RazorpayOrderResponse {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  razorpay: {
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
  };
  amount: number;
  status: PaymentStatus;
}

export interface RecordPaymentResponse {
  payment: Payment;
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    paidAmount: number;
    balanceAmount: number;
    status: InvoiceStatus;
  };
}
