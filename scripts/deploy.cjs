const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("--------------------------------------------------");
  console.log("Deploying FairworkEscrow Smart Contract...");
  console.log("Network:", (await ethers.provider.getNetwork()).name, "(ChainID:", (await ethers.provider.getNetwork()).chainId.toString(), ")");

  const [deployer, freelancer, arbitrator] = await ethers.getSigners();
  console.log("Deployer Address:", deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const FairworkEscrow = await ethers.getContractFactory("FairworkEscrow");
  const escrow = await FairworkEscrow.deploy();
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log("FairworkEscrow deployed at:", escrowAddress);

  // Register initial test project
  const projectId = ethers.encodeBytes32String("prj_ecom");
  const milestone1 = ethers.encodeBytes32String("ms_ecom_01");
  const milestone2 = ethers.encodeBytes32String("ms_ecom_02");

  const amount1 = ethers.parseEther("0.1"); // 0.1 test ETH
  const amount2 = ethers.parseEther("0.2"); // 0.2 test ETH
  const agreementHash = ethers.keccak256(ethers.toUtf8Bytes("agreement_v2_sla_90"));

  const targetFreelancer = freelancer ? freelancer.address : "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const targetArbitrator = arbitrator ? arbitrator.address : "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

  const tx = await escrow.registerProject(
    projectId,
    targetFreelancer,
    targetArbitrator,
    agreementHash,
    [milestone1, milestone2],
    [amount1, amount2]
  );
  await tx.wait();

  console.log("Test Project prj_ecom registered with 2 milestones (0.1 ETH & 0.2 ETH).");

  // Output deployment metadata for frontend consumption
  const deploymentInfo = {
    address: escrowAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outputPath = path.join(__dirname, "../src/contracts/deployment.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Saved deployment metadata to src/contracts/deployment.json");
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
