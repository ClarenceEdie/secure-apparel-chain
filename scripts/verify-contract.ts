import { ethers } from "hardhat";

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get the contract address from deployments or use default
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  console.log(`Checking contract at: ${contractAddress}`);

  // Check if contract exists
  const code = await ethers.provider.getCode(contractAddress);
  if (!code || code === "0x") {
    console.error(`❌ No contract found at address ${contractAddress}`);
    console.log(`\nPlease deploy the contract first:`);
    console.log(`  npm run deploy:localhost`);
    process.exit(1);
  }

  console.log(`✅ Contract exists (code length: ${code.length})`);

  // Try to interact with the contract
  try {
    const [signer] = await ethers.getSigners();
    console.log(`\nUsing signer: ${signer.address}`);

    // Get contract instance
    const ProductionDelta = await ethers.getContractFactory("ProductionDelta");
    const contract = ProductionDelta.attach(contractAddress);

    // Check owner
    try {
      const owner = await contract.owner();
      console.log(`📋 Contract owner: ${owner}`);
      console.log(`   You are ${owner.toLowerCase() === signer.address.toLowerCase() ? "✅" : "❌"} the owner`);
    } catch (e) {
      console.warn("⚠️  Could not get owner (contract might not have owner function)");
    }

    // Check authorization
    try {
      const isAuthorized = await contract.isAuthorized(signer.address);
      console.log(`🔐 You are ${isAuthorized ? "✅ authorized" : "❌ NOT authorized"}`);
      
      if (!isAuthorized) {
        try {
          const owner = await contract.owner();
          if (owner.toLowerCase() === signer.address.toLowerCase()) {
            console.log(`\n💡 You are the owner. Authorizing yourself...`);
            const tx = await contract.authorizeUser(signer.address);
            await tx.wait();
            console.log(`✅ Successfully authorized ${signer.address}`);
          } else {
            console.log(`\n⚠️  You need to be authorized. Ask the owner (${owner}) to run:`);
            console.log(`   contract.authorizeUser("${signer.address}")`);
          }
        } catch (authError: any) {
          console.error(`❌ Authorization failed: ${authError.message}`);
        }
      }
    } catch (e) {
      console.warn("⚠️  Could not check authorization (contract might not have isAuthorized function)");
    }

    // Check emergency stop
    try {
      const emergencyStop = await contract.emergencyStop();
      console.log(`🚨 Emergency stop: ${emergencyStop ? "⚠️ ACTIVE" : "✅ Inactive"}`);
    } catch (e) {
      console.warn("⚠️  Could not check emergency stop status");
    }

    console.log(`\n✅ Contract verification complete!`);
  } catch (error: any) {
    console.error(`❌ Error interacting with contract: ${error.message}`);
    console.error(`   This might indicate the contract ABI doesn't match or the contract is not fully deployed.`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

