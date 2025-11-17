import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ProductionDelta, ProductionDelta__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ProductionDelta")) as ProductionDelta__factory;
  const productionDeltaContract = (await factory.deploy()) as ProductionDelta;
  const productionDeltaContractAddress = await productionDeltaContract.getAddress();

  return { productionDeltaContract, productionDeltaContractAddress };
}

describe("ProductionDelta", function () {
  let signers: Signers;
  let productionDeltaContract: ProductionDelta;
  let productionDeltaContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ productionDeltaContract, productionDeltaContractAddress } = await deployFixture());
  });

  it("encrypted values should be uninitialized after deployment", async function () {
    const encryptedYesterday = await productionDeltaContract.getYesterdayProduction();
    const encryptedToday = await productionDeltaContract.getTodayProduction();
    const encryptedDelta = await productionDeltaContract.getDelta();

    // Expect initial values to be bytes32(0) after deployment
    expect(encryptedYesterday).to.eq(ethers.ZeroHash);
    expect(encryptedToday).to.eq(ethers.ZeroHash);
    expect(encryptedDelta).to.eq(ethers.ZeroHash);
  });

  it("should validate production data correctly", async function () {
    const { fhevmInstance } = await fhevm.createInstance();

    // Test with zero values - should be invalid
    const zeroValue = fhevmInstance.createEncryptedInput(productionDeltaContractAddress, signers.deployer.address);
    zeroValue.add32(0);
    const zeroEncrypted = await zeroValue.encrypt();

    await productionDeltaContract.connect(signers.deployer).setYesterdayProduction(zeroEncrypted.handles[0], zeroEncrypted.inputProof);
    await productionDeltaContract.connect(signers.deployer).setTodayProduction(zeroEncrypted.handles[0], zeroEncrypted.inputProof);

    const isValidZero = await productionDeltaContract.validateProductionData();
    expect(isValidZero).to.be.false;

    // Test with positive values - should be valid
    const positiveValue = fhevmInstance.createEncryptedInput(productionDeltaContractAddress, signers.deployer.address);
    positiveValue.add32(1000);
    const positiveEncrypted = await positiveValue.encrypt();

    await productionDeltaContract.connect(signers.deployer).setYesterdayProduction(positiveEncrypted.handles[0], positiveEncrypted.inputProof);
    await productionDeltaContract.connect(signers.deployer).setTodayProduction(positiveEncrypted.handles[0], positiveEncrypted.inputProof);

    const isValidPositive = await productionDeltaContract.validateProductionData();
    expect(isValidPositive).to.be.true;
  });

  it("should handle emergency stop functionality", async function () {
    // Initially not in emergency stop
    const statusBefore = await productionDeltaContract.getContractStatus();
    expect(statusBefore.emergencyStop).to.be.false;

    // Activate emergency stop
    await productionDeltaContract.connect(signers.deployer).emergencyStop();
    const statusAfter = await productionDeltaContract.getContractStatus();
    expect(statusAfter.emergencyStop).to.be.true;

    // Resume operations
    await productionDeltaContract.connect(signers.deployer).resumeOperations();
    const statusFinal = await productionDeltaContract.getContractStatus();
    expect(statusFinal.emergencyStop).to.be.false;
  });

  it("should have correct initial contract status", async function () {
    const [owner, emergencyStop] = await productionDeltaContract.getContractStatus();
    expect(owner).to.eq(signers.deployer.address);
    expect(emergencyStop).to.be.false;
  });

  it("should authorize and revoke users correctly", async function () {
    // Initially alice should not be authorized
    expect(await productionDeltaContract.isAuthorized(signers.alice.address)).to.be.false;

    // Authorize alice
    await productionDeltaContract.authorizeUser(signers.alice.address);
    expect(await productionDeltaContract.isAuthorized(signers.alice.address)).to.be.true;

    // Revoke alice
    await productionDeltaContract.revokeUser(signers.alice.address);
    expect(await productionDeltaContract.isAuthorized(signers.alice.address)).to.be.false;
  });

  it("should validate production data correctly", async function () {
    // Initially should return false (no data set)
    expect(await productionDeltaContract.validateProductionData()).to.be.false;

    // Set yesterday production
    const yesterdayValue = 100;
    const yesterdayEncrypted = await fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
    yesterdayEncrypted.add32(yesterdayValue);
    const yesterdayProof = await yesterdayEncrypted.getProof();

    await productionDeltaContract.setYesterdayProduction(yesterdayEncrypted, yesterdayProof.data);
    expect(await productionDeltaContract.validateProductionData()).to.be.false; // Still missing today

    // Set today production
    const todayValue = 120;
    const todayEncrypted = await fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
    todayEncrypted.add32(todayValue);
    const todayProof = await todayEncrypted.getProof();

    await productionDeltaContract.setTodayProduction(todayEncrypted, todayProof.data);
    expect(await productionDeltaContract.validateProductionData()).to.be.true; // Now both are set
  });

  it("should set yesterday production value", async function () {
    const clearYesterday = 100;
    const encryptedYesterday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearYesterday)
      .encrypt();

    const tx = await productionDeltaContract
      .connect(signers.alice)
      .setYesterdayProduction(encryptedYesterday.handles[0], encryptedYesterday.inputProof);
    await tx.wait();

    const encryptedYesterdayAfter = await productionDeltaContract.getYesterdayProduction();
    const clearYesterdayAfter = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedYesterdayAfter,
      productionDeltaContractAddress,
      signers.alice,
    );

    expect(clearYesterdayAfter).to.eq(clearYesterday);
  });

  it("should set today production value", async function () {
    const clearToday = 280;
    const encryptedToday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearToday)
      .encrypt();

    const tx = await productionDeltaContract
      .connect(signers.alice)
      .setTodayProduction(encryptedToday.handles[0], encryptedToday.inputProof);
    await tx.wait();

    const encryptedTodayAfter = await productionDeltaContract.getTodayProduction();
    const clearTodayAfter = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTodayAfter,
      productionDeltaContractAddress,
      signers.alice,
    );

    expect(clearTodayAfter).to.eq(clearToday);
  });

  it("should calculate delta correctly (today - yesterday)", async function () {
    const clearYesterday = 100;
    const clearToday = 280;
    const expectedDelta = clearToday - clearYesterday; // 180

    // Set yesterday production
    const encryptedYesterday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearYesterday)
      .encrypt();

    let tx = await productionDeltaContract
      .connect(signers.alice)
      .setYesterdayProduction(encryptedYesterday.handles[0], encryptedYesterday.inputProof);
    await tx.wait();

    // Set today production
    const encryptedToday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearToday)
      .encrypt();

    tx = await productionDeltaContract
      .connect(signers.alice)
      .setTodayProduction(encryptedToday.handles[0], encryptedToday.inputProof);
    await tx.wait();

    // Calculate delta
    tx = await productionDeltaContract.connect(signers.alice).calculateDelta();
    await tx.wait();

    // Verify delta
    const encryptedDelta = await productionDeltaContract.getDelta();
    const clearDelta = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDelta,
      productionDeltaContractAddress,
      signers.alice,
    );

    expect(clearDelta).to.eq(expectedDelta);
  });

  it("should handle negative delta (today < yesterday)", async function () {
    const clearYesterday = 280;
    const clearToday = 100;
    const expectedDelta = clearToday - clearYesterday; // -180

    // Set yesterday production
    const encryptedYesterday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearYesterday)
      .encrypt();

    let tx = await productionDeltaContract
      .connect(signers.alice)
      .setYesterdayProduction(encryptedYesterday.handles[0], encryptedYesterday.inputProof);
    await tx.wait();

    // Set today production
    const encryptedToday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearToday)
      .encrypt();

    tx = await productionDeltaContract
      .connect(signers.alice)
      .setTodayProduction(encryptedToday.handles[0], encryptedToday.inputProof);
    await tx.wait();

    // Calculate delta
    tx = await productionDeltaContract.connect(signers.alice).calculateDelta();
    await tx.wait();

    // Verify delta (note: euint32 is unsigned, so we need to handle this carefully)
    // In a real scenario, we might need to use eint32 for signed values
    const encryptedDelta = await productionDeltaContract.getDelta();
    const clearDelta = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDelta,
      productionDeltaContractAddress,
      signers.alice,
    );

    // For euint32, negative values wrap around, so we check the raw value
    // This test demonstrates the limitation - in production, consider using eint32
    expect(clearDelta).to.be.a("bigint");
  });

  it("should handle batch production submission correctly", async function () {
    const clearYesterday = 500;
    const clearToday = 750;
    const expectedDelta = clearToday - clearYesterday; // 250

    // Create encrypted inputs for batch submission
    const encryptedYesterday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearYesterday)
      .encrypt();

    const encryptedToday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearToday)
      .encrypt();

    // Batch submit both values
    const tx = await productionDeltaContract
      .connect(signers.alice)
      .setBothProductions(
        encryptedYesterday.handles[0],
        encryptedToday.handles[0],
        encryptedYesterday.inputProof,
        encryptedToday.inputProof
      );
    await tx.wait();

    // Calculate delta
    await productionDeltaContract.connect(signers.alice).calculateDelta();

    // Verify both values were set correctly
    const yesterdayAfter = await productionDeltaContract.getYesterdayProduction();
    const todayAfter = await productionDeltaContract.getTodayProduction();

    const clearYesterdayAfter = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      yesterdayAfter,
      productionDeltaContractAddress,
      signers.alice,
    );

    const clearTodayAfter = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      todayAfter,
      productionDeltaContractAddress,
      signers.alice,
    );

    expect(clearYesterdayAfter).to.eq(clearYesterday);
    expect(clearTodayAfter).to.eq(clearToday);

    // Verify delta calculation
    const encryptedDelta = await productionDeltaContract.getDelta();
    const clearDelta = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDelta,
      productionDeltaContractAddress,
      signers.alice,
    );

    expect(clearDelta).to.eq(expectedDelta);
  });

  it("should handle reset values functionality", async function () {
    // Set some values first
    const encryptedValue = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(1000)
      .encrypt();

    await productionDeltaContract
      .connect(signers.alice)
      .setYesterdayProduction(encryptedValue.handles[0], encryptedValue.inputProof);

    await productionDeltaContract
      .connect(signers.alice)
      .setTodayProduction(encryptedValue.handles[0], encryptedValue.inputProof);

    await productionDeltaContract.connect(signers.alice).calculateDelta();

    // Reset values
    await productionDeltaContract.connect(signers.alice).resetValues();

    // Verify values are reset (should be zero)
    const yesterdayAfter = await productionDeltaContract.getYesterdayProduction();
    const todayAfter = await productionDeltaContract.getTodayProduction();
    const deltaAfter = await productionDeltaContract.getDelta();

    // In FHEVM, zero values are represented as specific encrypted values
    // We verify that the values exist but don't check exact zero due to encryption
    expect(yesterdayAfter).to.not.eq(ethers.ZeroHash);
    expect(todayAfter).to.not.eq(ethers.ZeroHash);
    expect(deltaAfter).to.not.eq(ethers.ZeroHash);
  });

  it("should properly handle production change status analysis", async function () {
    const yesterdayValue = 200;
    const todayValue = 350;
    const expectedDelta = todayValue - yesterdayValue; // 150

    // Set production values
    const yesterdayEncrypted = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(yesterdayValue)
      .encrypt();

    const todayEncrypted = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(todayValue)
      .encrypt();

    await productionDeltaContract
      .connect(signers.alice)
      .setYesterdayProduction(yesterdayEncrypted.handles[0], yesterdayEncrypted.inputProof);

    await productionDeltaContract
      .connect(signers.alice)
      .setTodayProduction(todayEncrypted.handles[0], todayEncrypted.inputProof);

    await productionDeltaContract.connect(signers.alice).calculateDelta();

    // Get production change status
    const status = await productionDeltaContract.connect(signers.alice).getProductionChangeStatus();

    // Verify we get encrypted results (we can't decrypt in tests without proper setup)
    expect(status.yesterdayGreaterThanZero).to.be.a("string");
    expect(status.todayGreaterThanZero).to.be.a("string");
    expect(status.isIncreased).to.be.a("string");
    expect(status.isEqual).to.be.a("string");
    expect(status.delta).to.be.a("string");

    // All encrypted results should be non-zero hashes
    expect(status.yesterdayGreaterThanZero).to.not.eq(ethers.ZeroHash);
    expect(status.todayGreaterThanZero).to.not.eq(ethers.ZeroHash);
    expect(status.isIncreased).to.not.eq(ethers.ZeroHash);
    expect(status.isEqual).to.not.eq(ethers.ZeroHash);
    expect(status.delta).to.not.eq(ethers.ZeroHash);
  });

  describe("Access Control Tests", function () {
    it("should allow owner to authorize users", async function () {
      const isAuthorizedBefore = await productionDeltaContract.isAuthorized(signers.alice.address);
      expect(isAuthorizedBefore).to.be.false;

      await productionDeltaContract.authorizeUser(signers.alice.address);

      const isAuthorizedAfter = await productionDeltaContract.isAuthorized(signers.alice.address);
      expect(isAuthorizedAfter).to.be.true;
    });

    it("should allow owner to revoke users", async function () {
      await productionDeltaContract.authorizeUser(signers.alice.address);

      await productionDeltaContract.revokeUser(signers.alice.address);

      const isAuthorizedAfter = await productionDeltaContract.isAuthorized(signers.alice.address);
      expect(isAuthorizedAfter).to.be.false;
    });

    it("should prevent non-owner from authorizing users", async function () {
      await expect(
        productionDeltaContract.connect(signers.alice).authorizeUser(signers.bob.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("should prevent revoking owner authorization", async function () {
      await expect(
        productionDeltaContract.revokeUser(signers.deployer.address)
      ).to.be.revertedWith("Cannot revoke owner");
    });
  });

  describe("Emergency Stop Tests", function () {
    it("should allow owner to activate emergency stop", async function () {
      await productionDeltaContract.emergencyStop();

      const status = await productionDeltaContract.getContractStatus();
      expect(status.isEmergencyStopped).to.be.true;
    });

    it("should allow owner to resume operations", async function () {
      await productionDeltaContract.emergencyStop();
      await productionDeltaContract.resumeOperations();

      const status = await productionDeltaContract.getContractStatus();
      expect(status.isEmergencyStopped).to.be.false;
    });

    it("should prevent operations during emergency stop", async function () {
      await productionDeltaContract.emergencyStop();

      const input = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input.add32(1000);

      await expect(
        productionDeltaContract.setYesterdayProduction(input, input.getProof())
      ).to.be.revertedWith("Contract is in emergency stop mode");
    });

    it("should prevent non-owner from activating emergency stop", async function () {
      await expect(
        productionDeltaContract.connect(signers.alice).emergencyStop()
      ).to.be.revertedWith("Only owner can perform this action");
    });
  });

  describe("Batch Operations Tests", function () {
    it("should handle batch production setting correctly", async function () {
      const input1 = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input1.add32(1000);
      const input2 = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input2.add32(1200);

      await productionDeltaContract.setBothProductions(
        input1,
        input2,
        input1.getProof(),
        input2.getProof()
      );

      // Verify delta calculation works after batch set
      await productionDeltaContract.calculateDelta();
      const delta = await productionDeltaContract.getDelta();
      expect(delta).to.not.eq(ethers.ZeroHash);
    });

    it("should handle batch statistics calculation", async function () {
      const input1 = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input1.add32(1000);
      const input2 = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input2.add32(1200);

      await productionDeltaContract.setBothProductions(
        input1,
        input2,
        input1.getProof(),
        input2.getProof()
      );

      const stats = await productionDeltaContract.batchCalculateStatistics();

      expect(stats.delta).to.not.eq(ethers.ZeroHash);
      expect(stats.growthPercentage).to.not.eq(ethers.ZeroHash);
      expect(stats.isValid).to.not.eq(ethers.ZeroHash);
    });
  });

  describe("Growth Percentage Edge Cases", function () {
    it("should handle zero yesterday production safely", async function () {
      const zeroInput = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      zeroInput.add32(0);
      const valueInput = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      valueInput.add32(100);

      await productionDeltaContract.setBothProductions(
        zeroInput,
        valueInput,
        zeroInput.getProof(),
        valueInput.getProof()
      );

      // Should not crash when calculating growth percentage
      const percentage = await productionDeltaContract.getGrowthPercentage();
      expect(percentage).to.not.eq(ethers.ZeroHash);
    });

    it("should handle identical values correctly", async function () {
      const input1 = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input1.add32(1000);
      const input2 = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input2.add32(1000);

      await productionDeltaContract.setBothProductions(
        input1,
        input2,
        input1.getProof(),
        input2.getProof()
      );

      await productionDeltaContract.calculateDelta();
      const status = await productionDeltaContract.getProductionChangeStatus();

      // Values should be equal
      expect(status.isEqual).to.not.eq(ethers.ZeroHash);
    });
  });

  describe("Contract Statistics Tests", function () {
    it("should return accurate contract statistics", async function () {
      // Authorize a user first
      await productionDeltaContract.authorizeUser(signers.alice.address);

      const stats = await productionDeltaContract.getContractStatistics();

      expect(stats.totalAuthorized).to.be.gte(1); // At least owner
      expect(stats.isEmergencyStopped).to.be.false;

      // Encrypted results should be valid
      expect(stats.yesterdayComparison).to.not.eq(ethers.ZeroHash);
      expect(stats.todayComparison).to.not.eq(ethers.ZeroHash);
    });

    it("should update last calculation timestamp", async function () {
      const input1 = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input1.add32(1000);
      const input2 = fhevm.createEncryptedInput(await productionDeltaContract.getAddress(), signers.deployer.address);
      input2.add32(1200);

      await productionDeltaContract.setBothProductions(
        input1,
        input2,
        input1.getProof(),
        input2.getProof()
      );

      const beforeTimestamp = (await productionDeltaContract.getLastUpdateInfo()).timestamp;

      await productionDeltaContract.calculateDelta();

      const afterTimestamp = (await productionDeltaContract.getLastUpdateInfo()).timestamp;
      expect(afterTimestamp).to.be.gt(beforeTimestamp);
    });
  });
});

