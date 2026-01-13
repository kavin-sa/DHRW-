const hre = require("hardhat");

async function main() {
    console.log("Deploying HealthRecord contract to Shardeum...");

    const healthRecord = await hre.ethers.deployContract("HealthRecord");

    await healthRecord.waitForDeployment();

    console.log(`HealthRecord deployed to: ${healthRecord.target}`);
    const fs = require('fs');
    fs.writeFileSync('address.txt', healthRecord.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
