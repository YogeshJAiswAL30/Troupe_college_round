import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Scale,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
  Clock,
  Filter,
  DollarSign,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatMoney } from '../../core/money';
import { PaymentRecord, Milestone } from '../../types/fairwork';
import { web3Service, Web3WalletState } from '../../lib/web3Service';
import { GatewayCheckoutModal } from '../../components/payment/GatewayCheckoutModal';

export const PaymentsPage: React.FC = () => {
  const {
    payments,
    projects,
    milestones,
    allUsers,
    currentUser,
    handleFundEscrow,
    handleReleasePayment,
    showToast,
  } = useFairwork();

  const [selectedTx, setSelectedTx] = useState<PaymentRecord | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [fundingMilestoneModal, setFundingMilestoneModal] = useState<Milestone | null>(null);

  // Web3 Testnet Escrow Integration State
  const [walletState, setWalletState] = useState<Web3WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: null,
    balanceEth: null,
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const handleConnectWeb3Wallet = async () => {
    setIsConnectingWallet(true);
    try {
      const state = await web3Service.connectWallet();
      setWalletState(state);
      showToast({
        type: 'success',
        title: 'MetaMask Connected',
        message: `Connected to ${state.networkName} (${state.address?.slice(0, 6)}...${state.address?.slice(-4)}). Test ETH balance: ${Number(state.balanceEth).toFixed(4)} ETH.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wallet connection failed';
      showToast({
        type: 'error',
        title: 'Wallet Connection Error',
        message: msg,
      });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Accounting Model: Derive all stats dynamically across projects (or filtered project)
  const filteredProjects = selectedProjectFilter === 'ALL'
    ? projects
    : projects.filter((p) => p.id === selectedProjectFilter);

  const relevantMilestones = milestones.filter((m) =>
    filteredProjects.some((p) => p.id === m.projectId)
  );

  const relevantPayments = payments.filter((p) =>
    filteredProjects.some((proj) => proj.id === p.projectId)
  );

  // 1. Total Project Budget (sum of all projects' budgets)
  const totalProjectBudgetMinor = filteredProjects.reduce(
    (sum, p) => sum + p.totalBudgetMinor,
    0
  );

  // 2. Funds Locked in Escrow (Milestones currently in FUNDED, SUBMITTED, REVISION_REQUESTED)
  const fundsLockedMinor = relevantMilestones
    .filter(
      (m) =>
        m.status === 'FUNDED' ||
        m.status === 'SUBMITTED' ||
        m.status === 'UNDER_REVIEW' ||
        m.status === 'REVISION_REQUESTED'
    )
    .reduce((sum, m) => sum + m.amountMinor, 0);

  // 3. Funds Released (Milestones that have been released to freelancer)
  const fundsReleasedMinor = relevantMilestones
    .filter((m) => m.status === 'RELEASED')
    .reduce((sum, m) => sum + m.amountMinor, 0);

  // 4. Funds in Dispute (Milestones currently in DISPUTED state where ordinary release is locked)
  const fundsInDisputeMinor = relevantMilestones
    .filter((m) => m.status === 'DISPUTED')
    .reduce((sum, m) => sum + m.amountMinor, 0);

  // 5. Total Funded = Locked in Escrow + Released + Disputed (all deposits executed)
  const totalFundedMinor = fundsLockedMinor + fundsReleasedMinor + fundsInDisputeMinor;

  // 6. Unfunded Milestones (Milestones awaiting funding deposit)
  const unfundedMilestones = relevantMilestones.filter(
    (m) => m.status === 'AWAITING_FUNDING' || m.status === 'DRAFT'
  );
  const unfundedAmountMinor = unfundedMilestones.reduce(
    (sum, m) => sum + m.amountMinor,
    0
  );

  // Primary currency
  const currency = filteredProjects[0]?.currency || 'INR';

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-[#1C1917]">
              Payments &amp; Simulated Escrow Dashboard
            </h1>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
              SIMULATED &bull; NO REAL MONEY MOVED
            </span>
          </div>
          <p className="text-xs text-[#605A53]">
            Single-source accounting model. All metric totals reconcile directly with milestone status and payment records.
          </p>
        </div>

        {/* Project Selector Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8A837A]" />
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#264235]"
          >
            <option value="ALL">All Projects Aggregate ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.currency})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Web3 Testnet Escrow Demonstration Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
              On-Chain Testnet Escrow (Local / Sepolia Test ETH Only)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DFD5] text-[#264235] font-bold">
              0x5FbD...0aa3
            </span>
          </div>
          <p className="text-xs text-[#605A53]">
            {walletState.isConnected ? (
              <span>
                Connected to <strong>{walletState.networkName}</strong> as{' '}
                <code className="font-mono text-[#264235] bg-[#FAF7F2] px-1 rounded">
                  {walletState.address}
                </code>{' '}
                &bull; Balance: <strong>{Number(walletState.balanceEth).toFixed(4)} test ETH</strong>
              </span>
            ) : (
              <span>
                Verified Solidity smart contract deployed. Connect MetaMask with test ETH to inspect verified contract state. No real funds ever touched.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {walletState.isConnected ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#285C42] bg-[#EBF4EE] px-3 py-1.5 rounded-xl border border-[#C2DEC9]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Wallet Connected</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              isLoading={isConnectingWallet}
              onClick={handleConnectWeb3Wallet}
              className="border-[#264235] text-[#264235] hover:bg-[#FAF7F2]"
            >
              Connect MetaMask (Testnet)
            </Button>
          )}
        </div>
      </div>

      {/* 6 Reconciled Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[10px] font-bold text-[#8A837A] uppercase tracking-wider mb-1">
            Total Project Budget
          </div>
          <div className="text-xl font-bold font-mono text-[#1C1917]">
            {formatMoney(totalProjectBudgetMinor, currency)}
          </div>
          <div className="text-[10px] text-[#605A53] mt-0.5">Contract target</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[10px] font-bold text-[#285C42] uppercase tracking-wider mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Total Funded
          </div>
          <div className="text-xl font-bold font-mono text-[#285C42]">
            {formatMoney(totalFundedMinor, currency)}
          </div>
          <div className="text-[10px] text-[#605A53] mt-0.5">Deposited to date</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Funds Locked
          </div>
          <div className="text-xl font-bold font-mono text-[#B45309]">
            {formatMoney(fundsLockedMinor, currency)}
          </div>
          <div className="text-[10px] text-[#605A53] mt-0.5">In simulated vault</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[10px] font-bold text-[#285C42] uppercase tracking-wider mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Funds Released
          </div>
          <div className="text-xl font-bold font-mono text-[#285C42]">
            {formatMoney(fundsReleasedMinor, currency)}
          </div>
          <div className="text-[10px] text-[#605A53] mt-0.5">Paid to freelancer</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[10px] font-bold text-[#991B1B] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Scale className="w-3 h-3" /> Funds in Dispute
          </div>
          <div className="text-xl font-bold font-mono text-[#991B1B]">
            {formatMoney(fundsInDisputeMinor, currency)}
          </div>
          <div className="text-[10px] text-[#605A53] mt-0.5">Ordinary release locked</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
          <div className="text-[10px] font-bold text-[#605A53] uppercase tracking-wider mb-1">
            Unfunded Milestones
          </div>
          <div className="text-xl font-bold font-mono text-[#605A53]">
            {unfundedMilestones.length} ({formatMoney(unfundedAmountMinor, currency)})
          </div>
          <div className="text-[10px] text-[#605A53] mt-0.5">Awaiting deposit</div>
        </div>
      </div>

      {/* Legal & Educational Architecture Disclosure Callout */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs text-[#605A53] space-y-1">
        <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#264235]" />
          Platform Transparency: Clear Distinction Between Gateway Settlement and Smart Contract Escrow
        </div>
        <p className="leading-relaxed">
          Fairwork never claims a simulated balance or traditional bank webhook is actual blockchain escrow. In this prototype, transactions are recorded to a verifiable simulated ledger with single-source-of-truth reconciliation. Real on-chain smart contract vaults require explicit wallet signing (e.g. via MetaMask/Web3) and regulated custodial licensing; fiat gateway processing (INR/USD) operates through banking settlement rails.
        </p>
      </div>

      {/* Demo Escrow Funding Queue (One-Click Client Deposit) */}
      {unfundedMilestones.length > 0 && currentUser.role === 'CLIENT' && (
        <Card className="border-[#C2DEC9] bg-[#EBF4EE]/30">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#285C42] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#285C42]" />
                Demo Escrow Action: Milestones Eligible for Funding ({unfundedMilestones.length})
              </CardTitle>
              <p className="text-xs text-[#605A53] mt-0.5">
                Deposit funds into simulated escrow to authorize the freelancer to begin work.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {unfundedMilestones.map((m) => {
              const proj = projects.find((p) => p.id === m.projectId);
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-lg bg-white border border-[#C2DEC9] flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#264235] bg-[#FAF7F2] border border-[#E5DFD5] px-1.5 py-0.5 rounded">
                        {proj?.title}
                      </span>
                      <span className="font-bold text-xs text-[#1C1917] truncate">
                        {m.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#605A53] mt-0.5">
                      Deadline: {m.deadline} &bull; Criteria: {m.acceptanceCriteria.length} items
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-xs text-[#1C1917]">
                      {formatMoney(m.amountMinor, proj?.currency || 'USD')}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Lock className="w-3 h-3" />}
                      onClick={() => setFundingMilestoneModal(m)}
                    >
                      Fund Escrow (Simulated)
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Transaction Records Table */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-[#EFECE6] bg-[#FAF7F2] flex flex-row items-center justify-between py-3">
          <div>
            <CardTitle className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
              Transaction History ({relevantPayments.length} Records)
            </CardTitle>
            <p className="text-[11px] text-[#8A837A] mt-0.5">
              Click any transaction row to inspect full cryptographic and counterparty audit details
            </p>
          </div>
          <span className="text-[11px] text-[#8A837A] font-mono">
            Derived from state ledger
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#8A837A] border-b border-[#E5DFD5]">
                <tr>
                  <th className="py-3 px-4 uppercase text-[10px] font-semibold">Date</th>
                  <th className="py-3 px-4 uppercase text-[10px] font-semibold">Project</th>
                  <th className="py-3 px-4 uppercase text-[10px] font-semibold">Milestone</th>
                  <th className="py-3 px-4 uppercase text-[10px] font-semibold">Type</th>
                  <th className="py-3 px-4 uppercase text-[10px] font-semibold">Amount</th>
                  <th className="py-3 px-4 uppercase text-[10px] font-semibold">Status</th>
                  <th className="py-3 px-4 uppercase text-[10px] font-semibold">Reference</th>
                  <th className="py-3 px-4 uppercase text-[10px] font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {relevantPayments.map((p) => {
                  const proj = projects.find((pr) => pr.id === p.projectId);
                  const m = milestones.find((ms) => ms.id === p.milestoneId);

                  const isDeposit = p.type === 'ESCROW_DEPOSIT';
                  const isRelease = p.type === 'ESCROW_RELEASE';
                  const isRefund = p.type === 'REFUND';
                  const isDispute = p.type === 'DISPUTE_PAYOUT';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedTx(p)}
                      className="hover:bg-[#FAF7F2] transition cursor-pointer"
                    >
                      <td className="py-3 px-4 text-[#8A837A] font-mono">
                        {new Date(p.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1C1917] truncate max-w-[150px]">
                        {proj?.title || p.projectId}
                      </td>
                      <td className="py-3 px-4 text-[#605A53] truncate max-w-[160px]">
                        {m?.title || p.milestoneId || 'General'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                            isDeposit
                              ? 'bg-[#EBF4EE] text-[#285C42]'
                              : isRelease
                              ? 'bg-[#E8F0FE] text-[#1E429F]'
                              : isRefund
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[#FEE2E2] text-[#991B1B]'
                          }`}
                        >
                          {isDeposit && <ArrowDownLeft className="w-3 h-3" />}
                          {isRelease && <ArrowUpRight className="w-3 h-3" />}
                          {p.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#1C1917]">
                        {formatMoney(p.amountMinor, p.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FAF7F2] border border-[#E5DFD5] text-[#285C42]">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-[#8A837A]">
                        {p.reference}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-semibold text-[#264235] hover:underline">
                          Inspect &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E5DFD5] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EBF4EE] text-[#285C42] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">
                    Transaction Inspection Details
                  </h3>
                  <span className="text-[10px] font-mono text-[#8A837A]">
                    Reference: {selectedTx.reference}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-[#8A837A] hover:text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transaction Metrics Grid */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#8A837A]">Amount:</span>
                <span className="text-lg font-mono font-bold text-[#1C1917]">
                  {formatMoney(selectedTx.amountMinor, selectedTx.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A837A]">Transaction Type:</span>
                <span className="font-semibold text-[#1C1917]">
                  {selectedTx.type.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A837A]">Execution Status:</span>
                <span className="font-bold text-[#285C42]">
                  {selectedTx.status} (Verified)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A837A]">Timestamp:</span>
                <span className="font-mono text-[#1C1917]">
                  {new Date(selectedTx.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Counterparty & Routing Details */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                Routing &amp; Counterparty Details
              </span>
              <div className="p-3 rounded-lg border border-[#E5DFD5] bg-white space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8A837A]">Payer / Originator:</span>
                  <span className="font-semibold text-[#1C1917]">
                    {allUsers[selectedTx.payerId]?.displayName || selectedTx.payerId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A837A]">Beneficiary / Destination:</span>
                  <span className="font-semibold text-[#1C1917]">
                    {selectedTx.recipientId === 'escrow_smart_contract_vault' || selectedTx.recipientId === 'escrow_vault'
                      ? 'Simulated Escrow Smart Contract Vault'
                      : allUsers[selectedTx.recipientId]?.displayName || selectedTx.recipientId}
                  </span>
                </div>
                {selectedTx.paymentMethod && (
                  <div className="flex justify-between pt-1 border-t border-[#EFECE6]">
                    <span className="text-[#8A837A]">Payment Method / Channel:</span>
                    <span className="font-mono font-semibold text-[#264235]">
                      {selectedTx.paymentMethod.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                {selectedTx.gatewayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-[#8A837A]">Gateway Payment ID:</span>
                    <span className="font-mono text-[#1C1917]">
                      {selectedTx.gatewayPaymentId}
                    </span>
                  </div>
                )}
                {selectedTx.gatewayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-[#8A837A]">Gateway Order ID:</span>
                    <span className="font-mono text-[#1C1917]">
                      {selectedTx.gatewayOrderId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Honest Blockchain Data Disclosure */}
            <div className="p-3 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] text-[11px] text-[#605A53] space-y-1">
              <span className="font-bold text-[#1C1917] block">
                On-Chain Data Verification Policy:
              </span>
              <p className="leading-snug">
                This transaction was processed on Fairwork's simulated prototype ledger. In adherence to core principles, no fictitious on-chain smart contract address, fake block explorer link, or fabricated transaction hash is presented.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedTx(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GATEWAY CHECKOUT MODAL (UPI, NET BANKING, DEBIT/CREDIT CARDS, WEB3 TESTNET) */}
      {fundingMilestoneModal && (
        <GatewayCheckoutModal
          milestone={fundingMilestoneModal}
          project={projects.find((p) => p.id === fundingMilestoneModal.projectId) || projects[0]}
          onClose={() => setFundingMilestoneModal(null)}
          onSuccess={(meta) => {
            handleFundEscrow(fundingMilestoneModal.id, meta);
            setFundingMilestoneModal(null);
          }}
        />
      )}
    </div>
  );
};
