const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FairworkEscrow Smart Contract Suite", function () {
  let FairworkEscrow;
  let escrow;
  let client, freelancer, arbitrator, outsider;

  const projectId = ethers.encodeBytes32String("prj_ecom");
  const milestone1 = ethers.encodeBytes32String("ms_ecom_01");
  const milestone2 = ethers.encodeBytes32String("ms_ecom_02");

  const amount1 = ethers.parseEther("0.5"); // 0.5 test ETH
  const amount2 = ethers.parseEther("1.2"); // 1.2 test ETH

  const agreementHash = ethers.keccak256(ethers.toUtf8Bytes("agreement_v2_sla_90"));
  const deliveryHash = ethers.keccak256(ethers.toUtf8Bytes("frontend_deliverable_sha256"));

  beforeEach(async function () {
    [client, freelancer, arbitrator, outsider] = await ethers.getSigners();

    FairworkEscrow = await ethers.getContractFactory("FairworkEscrow");
    escrow = await FairworkEscrow.deploy();
    await escrow.waitForDeployment();

    // Register project with 2 milestones
    await escrow.connect(client).registerProject(
      projectId,
      freelancer.address,
      arbitrator.address,
      agreementHash,
      [milestone1, milestone2],
      [amount1, amount2]
    );
  });

  describe("1. Project Registration & Initial State", function () {
    it("registers project and emits ProjectRegistered event", async function () {
      const prj = await escrow.projects(projectId);
      expect(prj.client).to.equal(client.address);
      expect(prj.freelancer).to.equal(freelancer.address);
      expect(prj.arbitrator).to.equal(arbitrator.address);
      expect(prj.totalBudget).to.equal(amount1 + amount2);
      expect(prj.active).to.be.true;
    });

    it("prevents duplicate registration of the same projectId", async function () {
      await expect(
        escrow.connect(client).registerProject(
          projectId,
          freelancer.address,
          arbitrator.address,
          agreementHash,
          [milestone1],
          [amount1]
        )
      ).to.be.revertedWithCustomError(escrow, "ProjectAlreadyExists");
    });
  });

  describe("2. Funding Flow & Access Controls", function () {
    it("allows client to fund milestone with exact required ETH", async function () {
      await expect(
        escrow.connect(client).fundMilestone(projectId, milestone1, { value: amount1 })
      )
        .to.emit(escrow, "MilestoneFunded")
        .withArgs(projectId, milestone1, amount1, client.address);

      const ms = await escrow.projectMilestones(projectId, milestone1);
      expect(ms.status).to.equal(1); // FUNDED
    });

    it("rejects funding by non-client", async function () {
      await expect(
        escrow.connect(outsider).fundMilestone(projectId, milestone1, { value: amount1 })
      ).to.be.revertedWithCustomError(escrow, "NotProjectClient");
    });

    it("rejects incorrect funding amount (underpayment or overpayment)", async function () {
      await expect(
        escrow.connect(client).fundMilestone(projectId, milestone1, { value: ethers.parseEther("0.2") })
      ).to.be.revertedWithCustomError(escrow, "IncorrectFundingAmount");
    });

    it("prevents double-funding of an already funded milestone", async function () {
      await escrow.connect(client).fundMilestone(projectId, milestone1, { value: amount1 });

      await expect(
        escrow.connect(client).fundMilestone(projectId, milestone1, { value: amount1 })
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneState");
    });
  });

  describe("3. Delivery Submission Flow", function () {
    beforeEach(async function () {
      await escrow.connect(client).fundMilestone(projectId, milestone1, { value: amount1 });
    });

    it("allows freelancer to submit deliverable fingerprint with review window", async function () {
      const reviewWindow = 86400 * 5; // 5 days
      await expect(
        escrow.connect(freelancer).submitDelivery(projectId, milestone1, deliveryHash, reviewWindow)
      )
        .to.emit(escrow, "DeliverySubmitted");

      const ms = await escrow.projectMilestones(projectId, milestone1);
      expect(ms.status).to.equal(2); // SUBMITTED
      expect(ms.deliveryHash).to.equal(deliveryHash);
    });

    it("rejects delivery submission by non-freelancer", async function () {
      await expect(
        escrow.connect(outsider).submitDelivery(projectId, milestone1, deliveryHash, 86400 * 5)
      ).to.be.revertedWithCustomError(escrow, "NotProjectFreelancer");
    });

    it("rejects delivery with empty hash", async function () {
      await expect(
        escrow.connect(freelancer).submitDelivery(projectId, milestone1, ethers.ZeroHash, 86400 * 5)
      ).to.be.revertedWithCustomError(escrow, "DeliveryHashEmpty");
    });
  });

  describe("4. Approval & Payment Release", function () {
    beforeEach(async function () {
      await escrow.connect(client).fundMilestone(projectId, milestone1, { value: amount1 });
      await escrow.connect(freelancer).submitDelivery(projectId, milestone1, deliveryHash, 86400 * 5);
    });

    it("allows client to approve deliverable and releases ETH to freelancer", async function () {
      const balanceBefore = await ethers.provider.getBalance(freelancer.address);

      await expect(escrow.connect(client).approveAndRelease(projectId, milestone1))
        .to.emit(escrow, "PaymentReleased")
        .withArgs(projectId, milestone1, amount1, freelancer.address);

      const balanceAfter = await ethers.provider.getBalance(freelancer.address);
      expect(balanceAfter - balanceBefore).to.equal(amount1);

      const ms = await escrow.projectMilestones(projectId, milestone1);
      expect(ms.status).to.equal(4); // RELEASED
    });

    it("rejects release attempt by non-client", async function () {
      await expect(
        escrow.connect(freelancer).approveAndRelease(projectId, milestone1)
      ).to.be.revertedWithCustomError(escrow, "NotProjectClient");
    });

    it("prevents double release of an already released milestone", async function () {
      await escrow.connect(client).approveAndRelease(projectId, milestone1);

      await expect(
        escrow.connect(client).approveAndRelease(projectId, milestone1)
      ).to.be.revertedWithCustomError(escrow, "InvalidMilestoneState");
    });
  });

  describe("5. Dispute Protocol & Frozen Escrow (Rule 4)", function () {
    beforeEach(async function () {
      await escrow.connect(client).fundMilestone(projectId, milestone1, { value: amount1 });
      await escrow.connect(freelancer).submitDelivery(projectId, milestone1, deliveryHash, 86400 * 5);
    });

    it("allows client or freelancer to raise a dispute", async function () {
      await expect(
        escrow.connect(client).raiseDispute(projectId, milestone1, "Target frame rate breached")
      )
        .to.emit(escrow, "DisputeRaised")
        .withArgs(projectId, milestone1, client.address, "Target frame rate breached");

      const ms = await escrow.projectMilestones(projectId, milestone1);
      expect(ms.status).to.equal(5); // DISPUTED
    });

    it("locks ordinary payment release while dispute is active (Rule 4)", async function () {
      await escrow.connect(client).raiseDispute(projectId, milestone1, "SLA breach");

      await expect(
        escrow.connect(client).approveAndRelease(projectId, milestone1)
      ).to.be.revertedWithCustomError(escrow, "ReleaseBlockedByDispute");
    });

    it("allows mutual settlement proposal and execution", async function () {
      await escrow.connect(client).raiseDispute(projectId, milestone1, "SLA breach");

      const fPayout = ethers.parseEther("0.4");
      const cRefund = ethers.parseEther("0.1"); // Total = 0.5 ETH

      // Client proposes
      await escrow.connect(client).proposeSettlement(projectId, milestone1, fPayout, cRefund);

      // Freelancer accepts and executes
      const fBalBefore = await ethers.provider.getBalance(freelancer.address);
      const cBalBefore = await ethers.provider.getBalance(client.address);

      const tx = await escrow.connect(freelancer).acceptAndExecuteSettlement(projectId, milestone1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const fBalAfter = await ethers.provider.getBalance(freelancer.address);
      const cBalAfter = await ethers.provider.getBalance(client.address);

      expect(fBalAfter + gasUsed - fBalBefore).to.equal(fPayout);
      expect(cBalAfter - cBalBefore).to.equal(cRefund);

      const ms = await escrow.projectMilestones(projectId, milestone1);
      expect(ms.status).to.equal(6); // SETTLED
    });

    it("allows neutral arbitrator ruling if mutual settlement fails", async function () {
      await escrow.connect(client).raiseDispute(projectId, milestone1, "Irreconcilable dispute");

      const fRuling = ethers.parseEther("0.35");
      const cRuling = ethers.parseEther("0.15");

      await expect(
        escrow.connect(arbitrator).arbitratorResolve(projectId, milestone1, fRuling, cRuling)
      )
        .to.emit(escrow, "ArbitratorRuling")
        .withArgs(projectId, milestone1, fRuling, cRuling, arbitrator.address);

      const ms = await escrow.projectMilestones(projectId, milestone1);
      expect(ms.status).to.equal(6); // SETTLED
    });

    it("rejects arbitrator ruling by non-arbitrator", async function () {
      await escrow.connect(client).raiseDispute(projectId, milestone1, "Dispute");

      await expect(
        escrow.connect(outsider).arbitratorResolve(projectId, milestone1, amount1, 0)
      ).to.be.revertedWithCustomError(escrow, "NotProjectArbitrator");
    });
  });
});
