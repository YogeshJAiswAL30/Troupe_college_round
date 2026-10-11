import { ethers, BrowserProvider, Contract } from 'ethers';

// Contract ABI (essential subset for client interaction)
export const FAIRWORK_ESCROW_ABI = [
  "function registerProject(bytes32 projectId, address freelancer, address arbitrator, bytes32 agreementHash, bytes32[] milestoneIds, uint256[] milestoneAmounts) external",
  "function fundMilestone(bytes32 projectId, bytes32 milestoneId) external payable",
  "function submitDelivery(bytes32 projectId, bytes32 milestoneId, bytes32 deliveryHash, uint256 reviewWindowSeconds) external",
  "function approveAndRelease(bytes32 projectId, bytes32 milestoneId) external",
  "function raiseDispute(bytes32 projectId, bytes32 milestoneId, string reason) external",
  "function proposeSettlement(bytes32 projectId, bytes32 milestoneId, uint256 freelancerAmount, uint256 clientRefund) external",
  "function acceptAndExecuteSettlement(bytes32 projectId, bytes32 milestoneId) external",
  "function arbitratorResolve(bytes32 projectId, bytes32 milestoneId, uint256 freelancerPayout, uint256 clientRefund) external",
  "function projects(bytes32 projectId) external view returns (bytes32 id, address client, address freelancer, address arbitrator, uint256 totalBudget, bytes32 agreementHash, bool active)",
  "function projectMilestones(bytes32 projectId, bytes32 milestoneId) external view returns (bytes32 id, uint256 amount, bytes32 deliveryHash, uint256 reviewDeadline, uint8 status, bool exists)",
  "event MilestoneFunded(bytes32 indexed projectId, bytes32 indexed milestoneId, uint256 amount, address fundedBy)",
  "event DeliverySubmitted(bytes32 indexed projectId, bytes32 indexed milestoneId, bytes32 deliveryHash, uint256 reviewDeadline)",
  "event PaymentReleased(bytes32 indexed projectId, bytes32 indexed milestoneId, uint256 amount, address recipient)",
  "event DisputeRaised(bytes32 indexed projectId, bytes32 indexed milestoneId, address raisedBy, string reason)",
  "event DisputeSettled(bytes32 indexed projectId, bytes32 indexed milestoneId, uint256 freelancerPayout, uint256 clientRefund)"
];

export interface Web3WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  balanceEth: string | null;
}

export const web3Service = {
  /**
   * Check if window.ethereum (MetaMask or equivalent EIP-1193 provider) is available
   */
  hasInjectedProvider(): boolean {
    return typeof window !== 'undefined' && Boolean((window as unknown as { ethereum?: unknown }).ethereum);
  },

  /**
   * Connect MetaMask / injected Web3 wallet without storing any private keys
   */
  async connectWallet(): Promise<Web3WalletState> {
    const eth = (window as unknown as { ethereum?: any }).ethereum;
    if (!eth) {
      throw new Error("No Web3 wallet extension found. Please install MetaMask to interact with testnet escrow.");
    }

    const provider = new BrowserProvider(eth);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);

    return {
      isConnected: true,
      address,
      chainId: Number(network.chainId),
      networkName: network.name === 'unknown' ? `Chain ${network.chainId}` : network.name,
      balanceEth: ethers.formatEther(balance),
    };
  },

  /**
   * Get an instance of the FairworkEscrow contract attached to active signer
   */
  async getContractInstance(contractAddress: string) {
    const eth = (window as unknown as { ethereum?: any }).ethereum;
    if (!eth) throw new Error("MetaMask is not available");

    const provider = new BrowserProvider(eth);
    const signer = await provider.getSigner();
    return new Contract(contractAddress, FAIRWORK_ESCROW_ABI, signer);
  },
};
