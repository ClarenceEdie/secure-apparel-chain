import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the ProductionDelta contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the ProductionDelta contract
 *
 *   npx hardhat --network localhost task:set-yesterday --value 100
 *   npx hardhat --network localhost task:set-today --value 280
 *   npx hardhat --network localhost task:calculate-delta
 *   npx hardhat --network localhost task:decrypt-delta
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the ProductionDelta contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the ProductionDelta contract
 *
 *   npx hardhat --network sepolia task:set-yesterday --value 100
 *   npx hardhat --network sepolia task:set-today --value 280
 *   npx hardhat --network sepolia task:calculate-delta
 *   npx hardhat --network sepolia task:decrypt-delta
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the ProductionDelta address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const productionDelta = await deployments.get("ProductionDelta");

  console.log("ProductionDelta address is " + productionDelta.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:set-yesterday --value 100
 *   - npx hardhat --network sepolia task:set-yesterday --value 100
 */
task("task:set-yesterday", "Sets yesterday's production value")
  .addOptionalParam("address", "Optionally specify the ProductionDelta contract address")
  .addParam("value", "The yesterday production value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    if (!Number.isInteger(value)) {
      throw new Error(`Argument --value is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const ProductionDeltaDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("ProductionDelta");
    console.log(`ProductionDelta: ${ProductionDeltaDeployment.address}`);

    const signers = await ethers.getSigners();

    const productionDeltaContract = await ethers.getContractAt("ProductionDelta", ProductionDeltaDeployment.address);

    // Encrypt the value passed as argument
    const encryptedValue = await fhevm
      .createEncryptedInput(ProductionDeltaDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await productionDeltaContract
      .connect(signers[0])
      .setYesterdayProduction(encryptedValue.handles[0], encryptedValue.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`ProductionDelta setYesterdayProduction(${value}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:set-today --value 280
 *   - npx hardhat --network sepolia task:set-today --value 280
 */
task("task:set-today", "Sets today's production value")
  .addOptionalParam("address", "Optionally specify the ProductionDelta contract address")
  .addParam("value", "The today production value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    if (!Number.isInteger(value)) {
      throw new Error(`Argument --value is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const ProductionDeltaDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("ProductionDelta");
    console.log(`ProductionDelta: ${ProductionDeltaDeployment.address}`);

    const signers = await ethers.getSigners();

    const productionDeltaContract = await ethers.getContractAt("ProductionDelta", ProductionDeltaDeployment.address);

    // Encrypt the value passed as argument
    const encryptedValue = await fhevm
      .createEncryptedInput(ProductionDeltaDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await productionDeltaContract
      .connect(signers[0])
      .setTodayProduction(encryptedValue.handles[0], encryptedValue.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`ProductionDelta setTodayProduction(${value}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:calculate-delta
 *   - npx hardhat --network sepolia task:calculate-delta
 */
task("task:calculate-delta", "Calculates the delta (today - yesterday)")
  .addOptionalParam("address", "Optionally specify the ProductionDelta contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const ProductionDeltaDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("ProductionDelta");
    console.log(`ProductionDelta: ${ProductionDeltaDeployment.address}`);

    const signers = await ethers.getSigners();

    const productionDeltaContract = await ethers.getContractAt("ProductionDelta", ProductionDeltaDeployment.address);

    const tx = await productionDeltaContract.connect(signers[0]).calculateDelta();
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`ProductionDelta calculateDelta() succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-delta
 *   - npx hardhat --network sepolia task:decrypt-delta
 */
task("task:decrypt-delta", "Decrypts and displays the delta value")
  .addOptionalParam("address", "Optionally specify the ProductionDelta contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const ProductionDeltaDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("ProductionDelta");
    console.log(`ProductionDelta: ${ProductionDeltaDeployment.address}`);

    const signers = await ethers.getSigners();

    const productionDeltaContract = await ethers.getContractAt("ProductionDelta", ProductionDeltaDeployment.address);

    const encryptedDelta = await productionDeltaContract.getDelta();
    if (encryptedDelta === ethers.ZeroHash) {
      console.log(`Encrypted delta: ${encryptedDelta}`);
      console.log("Clear delta    : 0 (not calculated yet)");
      return;
    }

    const clearDelta = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDelta,
      ProductionDeltaDeployment.address,
      signers[0],
    );
    console.log(`Encrypted delta: ${encryptedDelta}`);
    console.log(`Clear delta    : ${clearDelta}`);

    if (clearDelta > 0n) {
      console.log(`Result: Today's production is ${clearDelta} units more than yesterday.`);
    } else if (clearDelta < 0n) {
      console.log(`Result: Today's production is ${-clearDelta} units less than yesterday.`);
    } else {
      console.log(`Result: Today's production is the same as yesterday.`);
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:set-batch --yesterday 500 --today 750
 *   - npx hardhat --network sepolia task:set-batch --yesterday 500 --today 750
 */
task("task:set-batch", "Sets both yesterday and today production values in batch")
  .addOptionalParam("address", "Optionally specify the ProductionDelta contract address")
  .addParam("yesterday", "The yesterday production value")
  .addParam("today", "The today production value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const yesterdayValue = parseInt(taskArguments.yesterday);
    const todayValue = parseInt(taskArguments.today);

    if (!Number.isInteger(yesterdayValue) || !Number.isInteger(todayValue)) {
      throw new Error(`Arguments --yesterday and --today must be integers`);
    }

    if (yesterdayValue <= 0 || todayValue <= 0 || yesterdayValue > 1000000 || todayValue > 1000000) {
      throw new Error(`Values must be between 1 and 1,000,000`);
    }

    await fhevm.initializeCLIApi();

    const ProductionDeltaDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("ProductionDelta");
    console.log(`ProductionDelta: ${ProductionDeltaDeployment.address}`);

    const signers = await ethers.getSigners();

    const productionDeltaContract = await ethers.getContractAt("ProductionDelta", ProductionDeltaDeployment.address);

    // Encrypt both values
    const encryptedYesterday = await fhevm
      .createEncryptedInput(ProductionDeltaDeployment.address, signers[0].address)
      .add32(yesterdayValue)
      .encrypt();

    const encryptedToday = await fhevm
      .createEncryptedInput(ProductionDeltaDeployment.address, signers[0].address)
      .add32(todayValue)
      .encrypt();

    const tx = await productionDeltaContract
      .connect(signers[0])
      .setBothProductions(
        encryptedYesterday.handles[0],
        encryptedToday.handles[0],
        encryptedYesterday.inputProof,
        encryptedToday.inputProof
      );

    console.log(`Batch submission - Yesterday: ${yesterdayValue}, Today: ${todayValue}`);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const expectedDelta = todayValue - yesterdayValue;
    console.log(`ProductionDelta setBothProductions() succeeded!`);
    console.log(`Expected delta: ${expectedDelta} (${expectedDelta > 0 ? 'increase' : expectedDelta < 0 ? 'decrease' : 'no change'})`);
  });

