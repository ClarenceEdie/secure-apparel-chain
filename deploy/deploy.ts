import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(`Deploying ProductionDelta contract from: ${deployer}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${hre.network.config.chainId}`);

  const deployedProductionDelta = await deploy("ProductionDelta", {
    from: deployer,
    log: true,
    args: [], // Constructor arguments (none needed)
  });

  console.log(`✅ ProductionDelta contract deployed successfully!`);
  console.log(`📍 Contract address: ${deployedProductionDelta.address}`);
  console.log(`🔗 Block explorer: ${getBlockExplorerUrl(hre.network.name, deployedProductionDelta.address)}`);

  // Verify deployment on supported networks
  if (hre.network.name === "sepolia" || hre.network.name === "mainnet") {
    console.log(`⏳ Waiting for block confirmations...`);
    await hre.ethers.provider.waitForTransaction(deployedProductionDelta.transactionHash!, 5);
    console.log(`✅ Deployment confirmed with 5 block confirmations`);
  }
};

// Helper function to get block explorer URL
function getBlockExplorerUrl(networkName: string, contractAddress: string): string {
  const explorers: { [key: string]: string } = {
    sepolia: `https://sepolia.etherscan.io/address/${contractAddress}`,
    mainnet: `https://etherscan.io/address/${contractAddress}`,
    polygon: `https://polygonscan.com/address/${contractAddress}`,
    polygonMumbai: `https://mumbai.polygonscan.com/address/${contractAddress}`,
  };

  return explorers[networkName] || `Contract deployed on ${networkName}: ${contractAddress}`;
}
export default func;
func.id = "deploy_productionDelta"; // id required to prevent reexecution
func.tags = ["ProductionDelta"];

