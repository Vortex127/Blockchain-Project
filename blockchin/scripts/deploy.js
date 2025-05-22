const hre = require("hardhat");

async function main() {
  // Compile and get the contract factory
  const FlashcardVaultFactory = await hre.ethers.getContractFactory("FlashcardVault");

  // Deploy the contract
  const vault = await FlashcardVaultFactory.deploy();

  // Wait for deployment to finish
  await vault.waitForDeployment(); // Modern Hardhat / Ethers v6
  const address = await vault.getAddress(); // Ethers v6 way of getting deployed address

  console.log(`✅ FlashcardVault deployed to: ${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exit(1);
});
