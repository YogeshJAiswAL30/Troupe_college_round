import { describe, it, expect, beforeEach } from 'vitest';
import {
  paymentGatewayService,
  calculatePaymentBreakdown,
  SUPPORTED_INDIAN_BANKS,
} from '../../lib/paymentGatewayService';

describe('Payment Gateway Integration Service', () => {
  beforeEach(() => {
    paymentGatewayService.clearStorage();
  });

  describe('Itemized Fee Calculation Invariants', () => {
    it('calculates 2% platform fee and 18% GST correctly on milestone amount', () => {
      // Example: ₹10,000 milestone (10,000 * 100 = 1,000,000 minor units)
      const baseMinor = 1000000;
      const breakdown = calculatePaymentBreakdown(baseMinor);

      // Platform fee: 2% of 1,000,000 = 20,000 minor units (₹200)
      expect(breakdown.platformFeeMinor).toBe(20000);
      // GST: 18% of 20,000 = 3,600 minor units (₹36)
      expect(breakdown.gstMinor).toBe(3600);
      // Gateway fee buffer: 0
      expect(breakdown.gatewayFeeMinor).toBe(0);
      // Total amount: 1,000,000 + 20,000 + 3,600 = 1,023,600 minor units (₹10,236)
      expect(breakdown.totalAmountMinor).toBe(1023600);
    });

    it('handles small fractional roundings deterministically', () => {
      // ₹1,234.50 = 123,450 minor units
      const baseMinor = 123450;
      const breakdown = calculatePaymentBreakdown(baseMinor);

      expect(breakdown.baseAmountMinor).toBe(123450);
      expect(breakdown.totalAmountMinor).toBeGreaterThan(baseMinor);
      expect(Number.isInteger(breakdown.totalAmountMinor)).toBe(true);
    });
  });

  describe('Net Banking Gateway Directory', () => {
    it('returns only verified gateway-supported Indian banks', () => {
      const banks = paymentGatewayService.getSupportedBanks();
      expect(banks.length).toBeGreaterThanOrEqual(10);

      const codes = banks.map((b) => b.code);
      expect(codes).toContain('HDFC');
      expect(codes).toContain('ICIC');
      expect(codes).toContain('SBIN');
      expect(codes).toContain('UTIB'); // Axis
      expect(codes).toContain('KKBK'); // Kotak

      // Every returned bank must have gatewayAvailable = true
      expect(banks.every((b) => b.gatewayAvailable)).toBe(true);
    });
  });

  describe('Order Creation & Idempotency', () => {
    it('creates an order with INITIATED status and 15-minute expiration', () => {
      const order = paymentGatewayService.createOrder({
        projectId: 'proj_ecommerce_01',
        milestoneId: 'ms_01',
        agreementId: 'agr_01',
        clientUserId: 'client_01',
        amountMinor: 500000, // ₹5,000
        currency: 'INR',
        method: 'NET_BANKING',
        selectedBankCode: 'HDFC',
      });

      expect(order.orderId).toMatch(/^order_/);
      expect(order.status).toBe('INITIATED');
      expect(order.selectedBankCode).toBe('HDFC');
      expect(order.amountMinor).toBe(order.feeItemization.totalAmountMinor);

      const expiresAt = new Date(order.expiresAt).getTime();
      const createdAt = new Date(order.createdAt).getTime();
      expect(expiresAt - createdAt).toBeCloseTo(15 * 60 * 1000, -2);
    });
  });

  describe('Server-Side Payment Verification (Anti-Tampering & Idempotency)', () => {
    it('verifies valid payment with matching amount, currency, and signature', async () => {
      const order = paymentGatewayService.createOrder({
        projectId: 'proj_ecommerce_01',
        milestoneId: 'ms_01',
        agreementId: 'agr_01',
        clientUserId: 'client_01',
        amountMinor: 500000,
        currency: 'INR',
        method: 'UPI',
        vpaAddress: 'client@okhdfcbank',
      });

      const verification = await paymentGatewayService.verifyPaymentServerSide({
        orderId: order.orderId,
        gatewayPaymentId: 'pay_test_123',
        gatewaySignature: 'hmac_sha256_valid_sig',
        expectedAmountMinor: order.amountMinor,
        expectedCurrency: 'INR',
      });

      expect(verification.success).toBe(true);
      expect(verification.order?.status).toBe('CAPTURED_SETTLED');
      expect(verification.order?.gatewayPaymentId).toBe('pay_test_123');
    });

    it('rejects verification if amount does not match order ledger (tampered client callback)', async () => {
      const order = paymentGatewayService.createOrder({
        projectId: 'proj_ecommerce_01',
        milestoneId: 'ms_01',
        agreementId: 'agr_01',
        clientUserId: 'client_01',
        amountMinor: 500000,
        currency: 'INR',
        method: 'NET_BANKING',
        selectedBankCode: 'ICIC',
      });

      const verification = await paymentGatewayService.verifyPaymentServerSide({
        orderId: order.orderId,
        gatewayPaymentId: 'pay_test_123',
        gatewaySignature: 'hmac_sha256_valid_sig',
        expectedAmountMinor: order.amountMinor - 1000, // Tampered amount
        expectedCurrency: 'INR',
      });

      expect(verification.success).toBe(false);
      expect(verification.error).toContain('Mismatched amount');

      const stored = paymentGatewayService.getOrder(order.orderId);
      expect(stored?.status).toBe('FAILED');
    });

    it('rejects verification if currency does not match order currency', async () => {
      const order = paymentGatewayService.createOrder({
        projectId: 'proj_ecommerce_01',
        milestoneId: 'ms_01',
        agreementId: 'agr_01',
        clientUserId: 'client_01',
        amountMinor: 500000,
        currency: 'INR',
        method: 'CREDIT_CARD',
      });

      const verification = await paymentGatewayService.verifyPaymentServerSide({
        orderId: order.orderId,
        gatewayPaymentId: 'pay_test_123',
        gatewaySignature: 'hmac_sha256_valid_sig',
        expectedAmountMinor: order.amountMinor,
        expectedCurrency: 'USD', // Mismatched currency
      });

      expect(verification.success).toBe(false);
      expect(verification.error).toContain('Mismatched currency');
    });

    it('enforces idempotency on duplicate verification calls (e.g. browser refresh)', async () => {
      const order = paymentGatewayService.createOrder({
        projectId: 'proj_ecommerce_01',
        milestoneId: 'ms_01',
        agreementId: 'agr_01',
        clientUserId: 'client_01',
        amountMinor: 500000,
        currency: 'INR',
        method: 'DEBIT_CARD',
      });

      // First verification
      const first = await paymentGatewayService.verifyPaymentServerSide({
        orderId: order.orderId,
        gatewayPaymentId: 'pay_test_123',
        gatewaySignature: 'hmac_sha256_valid_sig',
        expectedAmountMinor: order.amountMinor,
        expectedCurrency: 'INR',
      });
      expect(first.success).toBe(true);
      expect(first.order?.status).toBe('CAPTURED_SETTLED');

      // Second verification (browser page reload / retry)
      const second = await paymentGatewayService.verifyPaymentServerSide({
        orderId: order.orderId,
        gatewayPaymentId: 'pay_test_123',
        gatewaySignature: 'hmac_sha256_valid_sig',
        expectedAmountMinor: order.amountMinor,
        expectedCurrency: 'INR',
      });

      // Should succeed gracefully without double capturing
      expect(second.success).toBe(true);
      expect(second.error).toContain('already captured and settled');
    });
  });

  describe('Signed Webhook Processing & Replay Attack Defense', () => {
    it('processes legitimate payment.captured webhook and transitions order to CAPTURED_SETTLED', () => {
      const order = paymentGatewayService.createOrder({
        projectId: 'proj_ecommerce_01',
        milestoneId: 'ms_01',
        agreementId: 'agr_01',
        clientUserId: 'client_01',
        amountMinor: 500000,
        currency: 'INR',
        method: 'UPI',
      });

      const webhookResult = paymentGatewayService.processWebhook({
        eventId: 'evt_unique_101',
        eventType: 'payment.captured',
        provider: 'FAIRWORK_SECURE_GATEWAY',
        timestamp: Date.now(),
        signature: 'valid_hmac_sha256_webhook_signature',
        data: {
          orderId: order.orderId,
          paymentId: 'pay_wh_888',
          amountMinor: order.amountMinor,
          currency: 'INR',
          method: 'UPI',
          status: 'CAPTURED_SETTLED',
        },
      });

      expect(webhookResult.handled).toBe(true);
      expect(webhookResult.duplicate).toBe(false);
      expect(webhookResult.status).toBe('CAPTURED_SETTLED');

      const updated = paymentGatewayService.getOrder(order.orderId);
      expect(updated?.status).toBe('CAPTURED_SETTLED');
      expect(updated?.gatewayPaymentId).toBe('pay_wh_888');
    });

    it('rejects replayed webhook with duplicate event ID', () => {
      const order = paymentGatewayService.createOrder({
        projectId: 'proj_ecommerce_01',
        milestoneId: 'ms_01',
        agreementId: 'agr_01',
        clientUserId: 'client_01',
        amountMinor: 500000,
        currency: 'INR',
        method: 'NET_BANKING',
      });

      const payload = {
        eventId: 'evt_replay_attack_202',
        eventType: 'payment.captured' as const,
        provider: 'FAIRWORK_SECURE_GATEWAY' as const,
        timestamp: Date.now(),
        signature: 'valid_hmac_sha256_signature',
        data: {
          orderId: order.orderId,
          paymentId: 'pay_wh_999',
          amountMinor: order.amountMinor,
          currency: 'INR',
          method: 'NET_BANKING',
          status: 'CAPTURED_SETTLED' as const,
        },
      };

      // 1st delivery
      const res1 = paymentGatewayService.processWebhook(payload);
      expect(res1.handled).toBe(true);

      // 2nd delivery (Replay attack simulation)
      const res2 = paymentGatewayService.processWebhook(payload);
      expect(res2.handled).toBe(false);
      expect(res2.duplicate).toBe(true);
      expect(res2.error).toContain('Duplicate webhook event rejected');
    });

    it('rejects webhook with invalid signature', () => {
      const order = paymentGatewayService.createOrder({
        projectId: 'proj_ecommerce_01',
        milestoneId: 'ms_01',
        agreementId: 'agr_01',
        clientUserId: 'client_01',
        amountMinor: 500000,
        currency: 'INR',
        method: 'UPI',
      });

      const res = paymentGatewayService.processWebhook({
        eventId: 'evt_forged_303',
        eventType: 'payment.captured',
        provider: 'FAIRWORK_SECURE_GATEWAY',
        timestamp: Date.now(),
        signature: 'invalid_forged_signature',
        data: {
          orderId: order.orderId,
          paymentId: 'pay_fraud',
          amountMinor: order.amountMinor,
          currency: 'INR',
          method: 'UPI',
          status: 'CAPTURED_SETTLED',
        },
      });

      expect(res.handled).toBe(false);
      expect(res.error).toContain('signature verification failed');
    });
  });
});
