import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { ProductionDelta } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("ProductionDeltaSepolia", function () {
  let signers: Signers;
  let productionDeltaContract: ProductionDelta;
  let productionDeltaContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const ProductionDeltaDeployment = await deployments.get("ProductionDelta");
      productionDeltaContractAddress = ProductionDeltaDeployment.address;
      productionDeltaContract = await ethers.getContractAt("ProductionDelta", ProductionDeltaDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should set production values and calculate delta", async function () {
    steps = 15;

    this.timeout(4 * 40000);

    const clearYesterday = 100;
    const clearToday = 280;
    const expectedDelta = clearToday - clearYesterday; // 180

    progress("Encrypting yesterday production value...");
    const encryptedYesterday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearYesterday)
      .encrypt();

    progress(
      `Call setYesterdayProduction(${clearYesterday}) ProductionDelta=${productionDeltaContractAddress} handle=${ethers.hexlify(encryptedYesterday.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await productionDeltaContract
      .connect(signers.alice)
      .setYesterdayProduction(encryptedYesterday.handles[0], encryptedYesterday.inputProof);
    await tx.wait();

    progress("Encrypting today production value...");
    const encryptedToday = await fhevm
      .createEncryptedInput(productionDeltaContractAddress, signers.alice.address)
      .add32(clearToday)
      .encrypt();

    progress(
      `Call setTodayProduction(${clearToday}) ProductionDelta=${productionDeltaContractAddress} handle=${ethers.hexlify(encryptedToday.handles[0])} signer=${signers.alice.address}...`,
    );
    tx = await productionDeltaContract
      .connect(signers.alice)
      .setTodayProduction(encryptedToday.handles[0], encryptedToday.inputProof);
    await tx.wait();

    progress("Calling calculateDelta()...");
    tx = await productionDeltaContract.connect(signers.alice).calculateDelta();
    await tx.wait();

    progress(`Call ProductionDelta.getDelta()...`);
    const encryptedDelta = await productionDeltaContract.getDelta();
    expect(encryptedDelta).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting ProductionDelta.getDelta()=${encryptedDelta}...`);
    const clearDelta = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDelta,
      productionDeltaContractAddress,
      signers.alice,
    );
    progress(`Clear ProductionDelta.getDelta()=${clearDelta}`);

    expect(clearDelta).to.eq(expectedDelta);
    progress(`Test passed! Delta is ${clearDelta} (Today: ${clearToday} - Yesterday: ${clearYesterday} = ${expectedDelta})`);
  });
});

