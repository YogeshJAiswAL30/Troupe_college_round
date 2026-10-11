import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Smartphone,
  CreditCard,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Milestone, Project } from '../../types/fairwork';
import { GatewayPaymentMethod, SupportedBank } from '../../types/gateway';
import {
  paymentGatewayService,
  calculatePaymentBreakdown,
} from '../../lib/paymentGatewayService';
import { formatMoney } from '../../core/money';
import { Button } from '../ui/Button';

interface GatewayCheckoutModalProps {
  milestone: Milestone;
  project: Project;
  onClose: () => void;
  onSuccess: (meta: {
    paymentMethod: string;
    gatewayOrderId: string;
    gatewayPaymentId: string;
    reference: string;
  }) => void;
}

type CheckoutStep = 'METHOD_SELECT' | 'REDIRECT_SIMULATION' | 'PENDING_STATUS' | 'SUCCESS_STATUS' | 'ERROR_STATUS';

export const GatewayCheckoutModal: React.FC<GatewayCheckoutModalProps> = ({
  milestone,
  project,
  onClose,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<GatewayPaymentMethod>('NET_BANKING');
  const [selectedBankCode, setSelectedBankCode] = useState<string>('HDFC');
  const [upiVpa, setUpiVpa] = useState<string>('client@okhdfcbank');
  const [step, setStep] = useState<CheckoutStep>('METHOD_SELECT');
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const supportedBanks = paymentGatewayService.getSupportedBanks();
  const breakdown = calculatePaymentBreakdown(milestone.amountMinor);

  // Methods metadata
  const methods = [
    {
      id: 'NET_BANKING' as GatewayPaymentMethod,
      name: 'Net Banking',
      description: 'Direct institutional authorization via 12+ verified Indian banks',
      icon: <Building2 className="w-5 h-5" />,
      badge: 'Popular for Escrow',
    },
    {
      id: 'UPI' as GatewayPaymentMethod,
      name: 'UPI (GPay / PhonePe / Paytm)',
      description: 'Instant zero-fee payment via VPA or UPI intent',
      icon: <Smartphone className="w-5 h-5" />,
      badge: 'Instant',
    },
    {
      id: 'DEBIT_CARD' as GatewayPaymentMethod,
      name: 'Debit Card',
      description: 'Visa, Mastercard, RuPay & Maestro tokenized gateway checkout',
      icon: <CreditCard className="w-5 h-5" />,
      badge: 'Tokenized',
    },
    {
      id: 'CREDIT_CARD' as GatewayPaymentMethod,
      name: 'Credit Card',
      description: 'Secure 3D Secure / OTP verified credit card authorization',
      icon: <CreditCard className="w-5 h-5" />,
      badge: '3D Secure',
    },
    {
      id: 'BLOCKCHAIN_WALLET' as GatewayPaymentMethod,
      name: 'Web3 Wallet (Testnet ETH)',
      description: 'Optional decentralized smart-contract escrow on Sepolia testnet',
      icon: <Layers className="w-5 h-5" />,
      badge: 'Smart Contract',
    },
  ];

  // Initiate gateway order
  const handleInitiatePayment = () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const order = paymentGatewayService.createOrder({
        projectId: project.id,
        milestoneId: milestone.id,
        agreementId: milestone.projectId,
        clientUserId: project.clientId,
        amountMinor: milestone.amountMinor,
        currency: project.currency,
        method: selectedMethod,
        selectedBankCode: selectedMethod === 'NET_BANKING' ? selectedBankCode : undefined,
        vpaAddress: selectedMethod === 'UPI' ? upiVpa : undefined,
      });

      setActiveOrderId(order.orderId);
      setIsProcessing(false);
      setStep('REDIRECT_SIMULATION');
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to initialize payment gateway order');
      setStep('ERROR_STATUS');
    }
  };

  // Complete Simulated Bank Auth / Capture
  const handleSimulateReturn = async (outcome: 'SUCCESS' | 'PENDING' | 'CANCELLED' | 'TAMPERED') => {
    setIsProcessing(true);

    if (outcome === 'CANCELLED') {
      setIsProcessing(false);
      setErrorMessage('User cancelled payment authorization at the bank portal.');
      setStep('ERROR_STATUS');
      return;
    }

    if (outcome === 'PENDING') {
      setIsProcessing(false);
      setStep('PENDING_STATUS');
      return;
    }

    // Prepare server-side verification payload
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const signature = `hmac_sha256_${Date.now()}_verified`;
    const amountToCheck = outcome === 'TAMPERED' ? breakdown.totalAmountMinor - 5000 : breakdown.totalAmountMinor;

    const verificationResult = await paymentGatewayService.verifyPaymentServerSide({
      orderId: activeOrderId,
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      expectedAmountMinor: amountToCheck,
      expectedCurrency: project.currency,
    });

    setIsProcessing(false);

    if (verificationResult.success && verificationResult.order) {
      setStep('SUCCESS_STATUS');
      // Execute the milestone state transition and payment record update
      setTimeout(() => {
        onSuccess({
          paymentMethod: selectedMethod,
          gatewayOrderId: activeOrderId,
          gatewayPaymentId: paymentId,
          reference: `gw_${paymentId}`,
        });
      }, 900);
    } else {
      setErrorMessage(verificationResult.error || 'Server-side payment verification failed.');
      setStep('ERROR_STATUS');
    }
  };

  const selectedBank = supportedBanks.find((b) => b.code === selectedBankCode);

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E5DFD5] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#EFECE6] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#264235] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#86EFAC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1C1917]">
                  Fairwork Secure Gateway Checkout
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  SANDBOX GATEWAY
                </span>
              </div>
              <p className="text-xs text-[#605A53]">
                Agreement Milestone Escrow &bull; {project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A837A] hover:text-[#1C1917] hover:bg-[#EFECE6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: PAYMENT METHOD SELECTION */}
          {step === 'METHOD_SELECT' && (
            <>
              {/* Itemized Milestone & Fee Breakdown Card */}
              <div className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1917]">
                    Milestone: {milestone.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1C1917]">
                    {formatMoney(milestone.amountMinor, project.currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#EFECE6] space-y-1.5 text-xs text-[#605A53]">
                  <div className="flex justify-between">
                    <span>Base Milestone Escrow Deposit:</span>
                    <span className="font-mono">{formatMoney(breakdown.baseAmountMinor, project.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketplace Platform Fee (2%):</span>
                    <span className="font-mono">{formatMoney(breakdown.platformFeeMinor, project.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable GST (18% on platform fee):</span>
                    <span className="font-mono">{formatMoney(breakdown.gstMinor, project.currency)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[#E5DFD5] font-bold text-[#1C1917] text-sm">
                    <span>Total Due for Escrow Authorization:</span>
                    <span className="font-mono text-[#264235]">
                      {formatMoney(breakdown.totalAmountMinor, project.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Channel Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider block">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {methods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-[#264235] bg-[#EBF4EE]/50 ring-1 ring-[#264235]'
                            : 'border-[#E5DFD5] bg-white hover:border-[#8A837A]'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-[#264235] text-white' : 'bg-[#FAF7F2] text-[#605A53]'
                          }`}
                        >
                          {method.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-[#1C1917] truncate">
                              {method.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8A837A] line-clamp-1">
                            {method.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* METHOD-SPECIFIC PANELS */}
              {/* 1. Net Banking Details */}
              {selectedMethod === 'NET_BANKING' && (
                <div className="p-4 rounded-xl border border-[#C2DEC9] bg-[#EBF4EE]/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#285C42]" />
                    <span className="text-xs font-bold text-[#1C1917]">
                      Choose your bank from verified gateway directory
                    </span>
                  </div>

                  {/* Popular Indian Banks Badges */}
                  <div className="flex flex-wrap gap-2">
                    {supportedBanks
                      .filter((b) => b.isPopular)
                      .map((bank) => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => setSelectedBankCode(bank.code)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            selectedBankCode === bank.code
                              ? 'bg-[#264235] text-white border-[#264235]'
                              : 'bg-white text-[#1C1917] border-[#E5DFD5] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          {bank.name}
                        </button>
                      ))}
                  </div>

                  {/* Complete Verified Bank Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#605A53] font-medium block">
                      Or select from all 12+ gateway-enabled banks:
                    </label>
                    <select
                      value={selectedBankCode}
                      onChange={(e) => setSelectedBankCode(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#264235]"
                    >
                      {supportedBanks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name} ({bank.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Net Banking Security Callout */}
                  <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] text-[11px] text-[#605A53] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#1C1917] font-semibold">
                      <Lock className="w-3.5 h-3.5 text-[#285C42]" />
                      Zero-Credential Security Architecture
                    </div>
                    <p className="leading-relaxed">
                      You will be redirected directly to <strong>{selectedBank?.name}</strong>'s official internet banking portal. Fairwork <strong>never</strong> collects, handles, or stores your bank credentials, passwords, or OTPs.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. UPI Details */}
              {selectedMethod === 'UPI' && (
                <div className="p-4 rounded-xl border border-[#C2DEC9] bg-[#EBF4EE]/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#285C42]" />
                    <span className="text-xs font-bold text-[#1C1917]">
                      Enter Virtual Payment Address (UPI ID)
                    </span>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#264235]"
                    />
                    <p className="text-[11px] text-[#8A837A] mt-1">
                      A payment request collect notification will be simulated for this VPA.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. Debit / Credit Card Details */}
              {(selectedMethod === 'DEBIT_CARD' || selectedMethod === 'CREDIT_CARD') && (
                <div className="p-4 rounded-xl border border-[#C2DEC9] bg-[#EBF4EE]/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#285C42]" />
                    <span className="text-xs font-bold text-[#1C1917]">
                      Tokenized Gateway Card Vault
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E5DFD5] space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#605A53]">
                      <span>Card Details:</span>
                      <span className="font-mono font-semibold text-[#1C1917]">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242</span>
                    </div>
                    <div className="flex justify-between items-center text-[#605A53]">
                      <span>Card Network:</span>
                      <span className="font-semibold text-[#1C1917]">RuPay / Visa / Mastercard</span>
                    </div>
                    <p className="text-[11px] text-[#8A837A] pt-1 border-t border-[#EFECE6]">
                      PCI-DSS Compliant: Card data is tokenized on client side by the gateway iframe. No raw card numbers or CVVs ever reach Fairwork servers.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. Testnet Web3 Details */}
              {selectedMethod === 'BLOCKCHAIN_WALLET' && (
                <div className="p-4 rounded-xl border border-[#C2DEC9] bg-[#EBF4EE]/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#285C42]" />
                    <span className="text-xs font-bold text-[#1C1917]">
                      Decentralized Smart Contract Escrow
                    </span>
                  </div>
                  <p className="text-xs text-[#605A53]">
                    Milestone deposit will be routed via the verified Ethereum Sepolia testnet escrow contract. Connect MetaMask or use simulated testnet authorization.
                  </p>
                </div>
              )}
            </>
          )}

          {/* STEP 2: SIMULATED BANK REDIRECT / AUTH PORTAL */}
          {step === 'REDIRECT_SIMULATION' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#C2DEC9] bg-[#EBF4EE] space-y-2 text-center">
                <Building2 className="w-8 h-8 text-[#285C42] mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-[#1C1917]">
                  {selectedMethod === 'NET_BANKING'
                    ? `Redirected to ${selectedBank?.name} Secure Portal`
                    : selectedMethod === 'UPI'
                    ? 'Simulated UPI App Approval'
                    : 'Simulated 3D Secure Verification'}
                </h4>
                <p className="text-xs text-[#605A53]">
                  Order ID: <span className="font-mono font-bold text-[#1C1917]">{activeOrderId}</span> &bull; Amount: <span className="font-mono font-bold">{formatMoney(breakdown.totalAmountMinor, project.currency)}</span>
                </p>
              </div>

              {/* Test Sandbox Scenarios Control Bar */}
              <div className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] space-y-3">
                <span className="text-xs font-bold text-[#1C1917] block">
                  Interactive Gateway Simulator Controls:
                </span>
                <p className="text-xs text-[#605A53]">
                  Test various real-world banking states (settled, pending async bank reconciliation, user cancellation, or tampered payload):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleSimulateReturn('SUCCESS')}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#86EFAC]" />}
                  >
                    Simulate Successful Auth
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleSimulateReturn('PENDING')}
                    leftIcon={<Clock className="w-3.5 h-3.5 text-[#F59E0B]" />}
                  >
                    Simulate Pending Settlement
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleSimulateReturn('CANCELLED')}
                    leftIcon={<X className="w-3.5 h-3.5 text-[#EF4444]" />}
                  >
                    Simulate Cancelled
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleSimulateReturn('TAMPERED')}
                    leftIcon={<AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />}
                    className="text-[#991B1B]"
                  >
                    Test Mismatched Amount Rejection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PENDING STATUS EXPLANATION */}
          {step === 'PENDING_STATUS' && (
            <div className="p-5 rounded-xl border border-[#FDE68A] bg-[#FEF3C7]/40 space-y-3 text-center">
              <Clock className="w-8 h-8 text-[#D97706] mx-auto" />
              <h4 className="text-sm font-bold text-[#1C1917]">
                Payment Status: Bank Authorization Pending
              </h4>
              <p className="text-xs text-[#605A53] leading-relaxed">
                Your bank has acknowledged the transaction, but final settlement confirmation has not yet arrived via webhook. <strong>Escrow custody will only lock once server-side confirmation is verified.</strong>
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSimulateReturn('SUCCESS')}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Refresh &amp; Re-check Status
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  Close &amp; Check Later
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS STATUS */}
          {step === 'SUCCESS_STATUS' && (
            <div className="p-6 rounded-xl border border-[#C2DEC9] bg-[#EBF4EE] space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#285C42] mx-auto" />
              <h4 className="text-base font-bold text-[#1C1917]">
                Payment Verified &amp; Milestone Escrow Locked!
              </h4>
              <p className="text-xs text-[#285C42]">
                Server-side HMAC signature verified. Funds securely transferred to escrow lock and milestone workflow updated.
              </p>
            </div>
          )}

          {/* STEP 5: ERROR STATUS */}
          {step === 'ERROR_STATUS' && (
            <div className="p-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] space-y-3 text-center">
              <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
              <h4 className="text-sm font-bold text-[#991B1B]">
                Payment Failed or Rejected
              </h4>
              <p className="text-xs text-[#605A53]">
                {errorMessage || 'Payment could not be completed.'}
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep('METHOD_SELECT')}
                >
                  Try Another Method
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 'METHOD_SELECT' && (
          <div className="p-4 border-t border-[#EFECE6] bg-[#FAF7F2] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#605A53]">
              <Info className="w-3.5 h-3.5 text-[#285C42]" />
              <span>Double-funding locked by Fairwork invariant rules</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isProcessing}
                onClick={handleInitiatePayment}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Proceed to Checkout ({formatMoney(breakdown.totalAmountMinor, project.currency)})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
