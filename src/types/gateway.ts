/**
 * Fairwork Payment Gateway Integration Types & Standards
 * Target: Indian Freelancing Marketplace with Agreement-Based Milestone Escrow
 * Supported Channels: UPI, Net Banking, Debit Card, Credit Card, Blockchain (Testnet)
 */

export type GatewayPaymentMethod =
  | 'UPI'
  | 'NET_BANKING'
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'BLOCKCHAIN_WALLET';

export type GatewayTransactionStatus =
  | 'INITIATED'
  | 'PENDING_BANK_AUTH'
  | 'AUTHORIZED'
  | 'CAPTURED_SETTLED'
  | 'FAILED'
  | 'USER_CANCELLED'
  | 'EXPIRED_ABANDONED'
  | 'REFUNDED';

export interface SupportedBank {
  code: string;
  name: string;
  isPopular?: boolean;
  gatewayAvailable: boolean;
}

export interface GatewayOrder {
  orderId: string;
  projectId: string;
  milestoneId: string;
  agreementId: string;
  clientUserId: string;
  amountMinor: number;
  currency: string;
  method: GatewayPaymentMethod;
  selectedBankCode?: string;
  vpaAddress?: string;
  status: GatewayTransactionStatus;
  idempotencyKey: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  feeItemization: {
    baseAmountMinor: number;
    platformFeeMinor: number;
    gstMinor: number; // 18% GST on platform fee
    gatewayFeeMinor: number;
    totalAmountMinor: number;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: 'payment.captured' | 'payment.failed' | 'payment.pending' | 'refund.processed';
  provider: 'RAZORPAY_SANDBOX' | 'CASHFREE_SANDBOX' | 'FAIRWORK_SECURE_GATEWAY';
  timestamp: number;
  data: {
    orderId: string;
    paymentId: string;
    amountMinor: number;
    currency: string;
    method: string;
    bank?: string;
    vpa?: string;
    status: string;
    errorDescription?: string;
  };
  signature: string;
}
