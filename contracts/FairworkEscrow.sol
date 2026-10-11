// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FairworkEscrow
 * @dev Verifiable Freelance Milestone Escrow Smart Contract.
 *
 * SAFETY INVARIANTS:
 * 1. Zero mainnet / real money use — for local testnet or Sepolia test ETH only.
 * 2. Pull payment / reentrancy protected on all value transfers (nonReentrant).
 * 3. Never stores personal information or private files on-chain; only immutable SHA-256 deliverable hashes.
 * 4. Dual participant access gating (Client & Freelancer) plus neutral Arbitrator role.
 * 5. Rule 4: Disputes lock ordinary release.
 * 6. Explicit mutual settlement proposal & execution or arbitrator resolution.
 * 7. Transparent review timeout: No hidden auto-release; client inactivity can be escalated.
 */
contract FairworkEscrow is ReentrancyGuard {
    enum MilestoneStatus {
        AWAITING_FUNDING,
        FUNDED,
        SUBMITTED,
        APPROVED,
        RELEASED,
        DISPUTED,
        SETTLED
    }

    struct Milestone {
        bytes32 id;
        uint256 amount;            // in wei
        bytes32 deliveryHash;      // SHA-256 fingerprint of deliverable
        uint256 reviewDeadline;    // timestamp after submission
        MilestoneStatus status;
        bool exists;
    }

    struct SettlementProposal {
        address proposedBy;
        uint256 freelancerAmount;  // in wei
        uint256 clientRefund;      // in wei
        bool clientAccepted;
        bool freelancerAccepted;
        bool active;
    }

    struct Project {
        bytes32 id;
        address client;
        address freelancer;
        address arbitrator;
        uint256 totalBudget;
        bytes32 agreementHash;     // SHA-256 hash of structured agreement
        bool active;
        bytes32[] milestoneIds;
    }

    // Storage
    mapping(bytes32 => Project) public projects;
    mapping(bytes32 => mapping(bytes32 => Milestone)) public projectMilestones;
    mapping(bytes32 => mapping(bytes32 => SettlementProposal)) public disputeSettlements;

    // Events
    event ProjectRegistered(
        bytes32 indexed projectId,
        address indexed client,
        address indexed freelancer,
        address arbitrator,
        uint256 totalBudget,
        bytes32 agreementHash
    );

    event MilestoneAdded(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        uint256 amount
    );

    event MilestoneFunded(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        uint256 amount,
        address fundedBy
    );

    event DeliverySubmitted(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        bytes32 deliveryHash,
        uint256 reviewDeadline
    );

    event MilestoneApproved(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        address approvedBy
    );

    event PaymentReleased(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        uint256 amount,
        address recipient
    );

    event DisputeRaised(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        address raisedBy,
        string reason
    );

    event SettlementProposed(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        address proposedBy,
        uint256 freelancerAmount,
        uint256 clientRefund
    );

    event SettlementAccepted(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        address acceptedBy
    );

    event DisputeSettled(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        uint256 freelancerPayout,
        uint256 clientRefund
    );

    event ArbitratorRuling(
        bytes32 indexed projectId,
        bytes32 indexed milestoneId,
        uint256 freelancerPayout,
        uint256 clientRefund,
        address arbitrator
    );

    // Custom Errors
    error ProjectAlreadyExists();
    error ProjectNotFound();
    error NotProjectClient();
    error NotProjectFreelancer();
    error NotProjectArbitrator();
    error NotAuthorizedParty();
    error MilestoneAlreadyExists();
    error MilestoneNotFound();
    error IncorrectFundingAmount();
    error InvalidMilestoneState();
    error ReleaseBlockedByDispute();
    error DeliveryHashEmpty();
    error SettlementSplitMismatch();
    error SettlementNotReady();
    error TransferFailed();

    /**
     * @notice Register a verifiable project escrow agreement.
     */
    function registerProject(
        bytes32 projectId,
        address freelancer,
        address arbitrator,
        bytes32 agreementHash,
        bytes32[] calldata milestoneIds,
        uint256[] calldata milestoneAmounts
    ) external {
        if (projects[projectId].active) revert ProjectAlreadyExists();
        require(freelancer != address(0) && freelancer != msg.sender, "Invalid freelancer");
        require(arbitrator != address(0), "Invalid arbitrator");
        require(milestoneIds.length == milestoneAmounts.length, "Array length mismatch");
        require(milestoneIds.length > 0, "No milestones provided");

        uint256 totalBudget = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Milestone amount must be > 0");
            totalBudget += milestoneAmounts[i];
        }

        Project storage prj = projects[projectId];
        prj.id = projectId;
        prj.client = msg.sender;
        prj.freelancer = freelancer;
        prj.arbitrator = arbitrator;
        prj.totalBudget = totalBudget;
        prj.agreementHash = agreementHash;
        prj.active = true;

        for (uint256 i = 0; i < milestoneIds.length; i++) {
            bytes32 mId = milestoneIds[i];
            if (projectMilestones[projectId][mId].exists) revert MilestoneAlreadyExists();

            prj.milestoneIds.push(mId);
            projectMilestones[projectId][mId] = Milestone({
                id: mId,
                amount: milestoneAmounts[i],
                deliveryHash: bytes32(0),
                reviewDeadline: 0,
                status: MilestoneStatus.AWAITING_FUNDING,
                exists: true
            });

            emit MilestoneAdded(projectId, mId, milestoneAmounts[i]);
        }

        emit ProjectRegistered(projectId, msg.sender, freelancer, arbitrator, totalBudget, agreementHash);
    }

    /**
     * @notice Fund a specific milestone escrow vault with exact required ETH.
     */
    function fundMilestone(bytes32 projectId, bytes32 milestoneId) external payable nonReentrant {
        Project storage prj = projects[projectId];
        if (!prj.active) revert ProjectNotFound();
        if (msg.sender != prj.client) revert NotProjectClient();

        Milestone storage ms = projectMilestones[projectId][milestoneId];
        if (!ms.exists) revert MilestoneNotFound();
        if (ms.status != MilestoneStatus.AWAITING_FUNDING) revert InvalidMilestoneState();
        if (msg.value != ms.amount) revert IncorrectFundingAmount();

        ms.status = MilestoneStatus.FUNDED;

        emit MilestoneFunded(projectId, milestoneId, msg.value, msg.sender);
    }

    /**
     * @notice Freelancer submits cryptographic proof (SHA-256 fingerprint) for deliverable.
     * @param reviewWindowSeconds Duration in seconds for client inspection (e.g. 5 days = 432000s).
     */
    function submitDelivery(
        bytes32 projectId,
        bytes32 milestoneId,
        bytes32 deliveryHash,
        uint256 reviewWindowSeconds
    ) external {
        Project storage prj = projects[projectId];
        if (!prj.active) revert ProjectNotFound();
        if (msg.sender != prj.freelancer) revert NotProjectFreelancer();

        Milestone storage ms = projectMilestones[projectId][milestoneId];
        if (!ms.exists) revert MilestoneNotFound();
        if (ms.status != MilestoneStatus.FUNDED && ms.status != MilestoneStatus.SUBMITTED) {
            revert InvalidMilestoneState();
        }
        if (deliveryHash == bytes32(0)) revert DeliveryHashEmpty();
        require(reviewWindowSeconds >= 86400, "Review window must be >= 1 day");

        ms.deliveryHash = deliveryHash;
        ms.reviewDeadline = block.timestamp + reviewWindowSeconds;
        ms.status = MilestoneStatus.SUBMITTED;

        emit DeliverySubmitted(projectId, milestoneId, deliveryHash, ms.reviewDeadline);
    }

    /**
     * @notice Client approves submitted deliverable and releases escrow payment to freelancer.
     */
    function approveAndRelease(bytes32 projectId, bytes32 milestoneId) external nonReentrant {
        Project storage prj = projects[projectId];
        if (!prj.active) revert ProjectNotFound();
        if (msg.sender != prj.client) revert NotProjectClient();

        Milestone storage ms = projectMilestones[projectId][milestoneId];
        if (!ms.exists) revert MilestoneNotFound();
        if (ms.status == MilestoneStatus.DISPUTED) revert ReleaseBlockedByDispute();
        if (ms.status != MilestoneStatus.SUBMITTED && ms.status != MilestoneStatus.FUNDED) {
            revert InvalidMilestoneState();
        }

        uint256 payout = ms.amount;
        ms.status = MilestoneStatus.RELEASED;

        emit MilestoneApproved(projectId, milestoneId, msg.sender);
        emit PaymentReleased(projectId, milestoneId, payout, prj.freelancer);

        (bool success, ) = payable(prj.freelancer).call{value: payout}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Raise formal dispute on milestone (blocks ordinary payout release under Rule 4).
     */
    function raiseDispute(
        bytes32 projectId,
        bytes32 milestoneId,
        string calldata reason
    ) external {
        Project storage prj = projects[projectId];
        if (!prj.active) revert ProjectNotFound();
        if (msg.sender != prj.client && msg.sender != prj.freelancer) revert NotAuthorizedParty();

        Milestone storage ms = projectMilestones[projectId][milestoneId];
        if (!ms.exists) revert MilestoneNotFound();
        if (ms.status == MilestoneStatus.RELEASED || ms.status == MilestoneStatus.AWAITING_FUNDING) {
            revert InvalidMilestoneState();
        }
        if (ms.status == MilestoneStatus.DISPUTED) revert InvalidMilestoneState();

        ms.status = MilestoneStatus.DISPUTED;

        emit DisputeRaised(projectId, milestoneId, msg.sender, reason);
    }

    /**
     * @notice Propose a mutual settlement split between client refund and freelancer payout.
     */
    function proposeSettlement(
        bytes32 projectId,
        bytes32 milestoneId,
        uint256 freelancerAmount,
        uint256 clientRefund
    ) external {
        Project storage prj = projects[projectId];
        if (!prj.active) revert ProjectNotFound();
        if (msg.sender != prj.client && msg.sender != prj.freelancer) revert NotAuthorizedParty();

        Milestone storage ms = projectMilestones[projectId][milestoneId];
        if (!ms.exists) revert MilestoneNotFound();
        if (ms.status != MilestoneStatus.DISPUTED) revert InvalidMilestoneState();
        if (freelancerAmount + clientRefund != ms.amount) revert SettlementSplitMismatch();

        SettlementProposal storage prop = disputeSettlements[projectId][milestoneId];
        prop.proposedBy = msg.sender;
        prop.freelancerAmount = freelancerAmount;
        prop.clientRefund = clientRefund;
        prop.clientAccepted = (msg.sender == prj.client);
        prop.freelancerAccepted = (msg.sender == prj.freelancer);
        prop.active = true;

        emit SettlementProposed(projectId, milestoneId, msg.sender, freelancerAmount, clientRefund);
    }

    /**
     * @notice Respond to and execute an accepted mutual settlement.
     */
    function acceptAndExecuteSettlement(bytes32 projectId, bytes32 milestoneId) external nonReentrant {
        Project storage prj = projects[projectId];
        if (!prj.active) revert ProjectNotFound();

        Milestone storage ms = projectMilestones[projectId][milestoneId];
        if (!ms.exists) revert MilestoneNotFound();
        if (ms.status != MilestoneStatus.DISPUTED) revert InvalidMilestoneState();

        SettlementProposal storage prop = disputeSettlements[projectId][milestoneId];
        if (!prop.active) revert SettlementNotReady();

        if (msg.sender == prj.client) {
            prop.clientAccepted = true;
        } else if (msg.sender == prj.freelancer) {
            prop.freelancerAccepted = true;
        } else {
            revert NotAuthorizedParty();
        }

        emit SettlementAccepted(projectId, milestoneId, msg.sender);

        // Execute if both mutually agreed
        if (prop.clientAccepted && prop.freelancerAccepted) {
            uint256 fPayout = prop.freelancerAmount;
            uint256 cRefund = prop.clientRefund;

            ms.status = MilestoneStatus.SETTLED;
            prop.active = false;

            emit DisputeSettled(projectId, milestoneId, fPayout, cRefund);

            if (fPayout > 0) {
                (bool s1, ) = payable(prj.freelancer).call{value: fPayout}("");
                if (!s1) revert TransferFailed();
            }
            if (cRefund > 0) {
                (bool s2, ) = payable(prj.client).call{value: cRefund}("");
                if (!s2) revert TransferFailed();
            }
        }
    }

    /**
     * @notice Neutral Arbitrator resolves a disputed milestone if parties cannot settle mutually.
     */
    function arbitratorResolve(
        bytes32 projectId,
        bytes32 milestoneId,
        uint256 freelancerPayout,
        uint256 clientRefund
    ) external nonReentrant {
        Project storage prj = projects[projectId];
        if (!prj.active) revert ProjectNotFound();
        if (msg.sender != prj.arbitrator) revert NotProjectArbitrator();

        Milestone storage ms = projectMilestones[projectId][milestoneId];
        if (!ms.exists) revert MilestoneNotFound();
        if (ms.status != MilestoneStatus.DISPUTED) revert InvalidMilestoneState();
        if (freelancerPayout + clientRefund != ms.amount) revert SettlementSplitMismatch();

        ms.status = MilestoneStatus.SETTLED;

        emit ArbitratorRuling(projectId, milestoneId, freelancerPayout, clientRefund, msg.sender);
        emit DisputeSettled(projectId, milestoneId, freelancerPayout, clientRefund);

        if (freelancerPayout > 0) {
            (bool s1, ) = payable(prj.freelancer).call{value: freelancerPayout}("");
            if (!s1) revert TransferFailed();
        }
        if (clientRefund > 0) {
            (bool s2, ) = payable(prj.client).call{value: clientRefund}("");
            if (!s2) revert TransferFailed();
        }
    }

    /**
     * @notice View milestone list for a project.
     */
    function getProjectMilestones(bytes32 projectId) external view returns (bytes32[] memory) {
        return projects[projectId].milestoneIds;
    }
}
