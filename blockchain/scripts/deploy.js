const hre = require("hardhat");

async function main() {
  const HealthRecord = await hre.ethers.getContractFactory("HealthRecord");
  const healthRecord = await HealthRecord.deploy();
  await healthRecord.waitForDeployment();

  console.log("🚀 Deployed at:", await healthRecord.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
