import { expect } from "chai";
import { ethers } from "ethers";
import { network } from "hardhat";
import type { Abi_PulseOracleV2 } from "../generated/abis/PulseOracleV2.js";
import type { Abi_MockWorldID } from "../generated/abis/MockWorldID.js";

const { ethers: hreEthers, networkHelpers } = await network.create();

const CAP_BOTH = 3;
const ONCHAIN_TX_LABEL = ethers.encodeBytes32String("ONCHAIN_TX");

const LifecycleState = {
  THRESHOLD_REACHED: 2,
} as const;

const SignalDirection = {
  NEGATIVE: 0,
} as const;

const hashToField = (value: string): bigint => {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(value));
  return BigInt(hash) >> 8n;
};

const addressToLowerHex = (address: string): string => ethers.getAddress(address).toLowerCase();

const getCheckinWorldIdParams = (ownerAddress: string) => {
  const profileKey = addressToLowerHex(ownerAddress);
  return {
    signalHash: hashToField(profileKey),
    externalNullifierHash: hashToField(`checkin-${profileKey}`),
  };
};

const dummyProof = Array.from({ length: 8 }, () => 0n) as [
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
];

async function deployPulseOracleV2() {
  const [consumer, owner, adapter, stranger] = await hreEthers.getSigners();

  const mockWorldIdFactory = await hreEthers.getContractFactory("MockWorldID");
  const mockWorldId = (await mockWorldIdFactory.deploy()) as unknown as Abi_MockWorldID & {
    getAddress: () => Promise<string>;
  };

  const factory = await hreEthers.getContractFactory("PulseOracleV2");
  const pulseOracle = (await factory.deploy(await mockWorldId.getAddress())) as unknown as Abi_PulseOracleV2 & {
    connect: (signer: ethers.Signer) => Abi_PulseOracleV2;
  };

  const threshold = 10;
  const profileId = await pulseOracle.computeProfileId(owner.address, consumer.address);

  await pulseOracle.connect(consumer).createProfile(owner.address, threshold);
  await pulseOracle
    .connect(consumer)
    .authorizeAdapter(profileId, adapter.address, 4, CAP_BOTH, ONCHAIN_TX_LABEL);

  return { pulseOracle, consumer, owner, adapter, stranger, profileId };
}

describe("PulseOracleV2", function () {
  describe("reportSignal", function () {
    it("rejects negative signals without Walrus ref", async function () {
      const { pulseOracle, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracleV2);

      await expect(
        pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, ethers.ZeroHash),
      ).to.be.revertedWithCustomError(pulseOracle, "EmptyWalrusBlobId");
    });

    it("accumulates negative signals until threshold", async function () {
      const { pulseOracle, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracleV2);
      const blobId = ethers.encodeBytes32String("evidence-1");

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);
      let profile = await pulseOracle.profiles(profileId);
      expect(profile.accumulatedWeight).to.equal(4);

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);
      profile = await pulseOracle.profiles(profileId);
      expect(profile.accumulatedWeight).to.equal(8);

      await expect(pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId)).to.emit(
        pulseOracle,
        "ThresholdReached",
      );

      profile = await pulseOracle.profiles(profileId);
      expect(profile.state).to.equal(LifecycleState.THRESHOLD_REACHED);
    });
  });

  describe("checkin", function () {
    it("resets weight with valid World ID params", async function () {
      const { pulseOracle, owner, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracleV2);
      const blobId = ethers.encodeBytes32String("evidence-checkin");
      const { signalHash, externalNullifierHash } = getCheckinWorldIdParams(owner.address);

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);

      await pulseOracle.connect(owner).checkin(
        profileId,
        1n,
        42n,
        externalNullifierHash,
        signalHash,
        dummyProof,
      );

      const profile = await pulseOracle.profiles(profileId);
      expect(profile.accumulatedWeight).to.equal(0);
      expect(await pulseOracle.nullifierUsed(42n)).to.equal(true);
    });

    it("rejects reused nullifiers", async function () {
      const { pulseOracle, owner, profileId } = await networkHelpers.loadFixture(deployPulseOracleV2);
      const { signalHash, externalNullifierHash } = getCheckinWorldIdParams(owner.address);

      await pulseOracle.connect(owner).checkin(
        profileId,
        1n,
        99n,
        externalNullifierHash,
        signalHash,
        dummyProof,
      );

      await expect(
        pulseOracle.connect(owner).checkin(profileId, 2n, 99n, externalNullifierHash, signalHash, dummyProof),
      ).to.be.revertedWithCustomError(pulseOracle, "NullifierAlreadyUsed");
    });

    it("rejects invalid external nullifier", async function () {
      const { pulseOracle, owner, profileId } = await networkHelpers.loadFixture(deployPulseOracleV2);
      const { signalHash } = getCheckinWorldIdParams(owner.address);

      await expect(
        pulseOracle.connect(owner).checkin(profileId, 1n, 7n, 123n, signalHash, dummyProof),
      ).to.be.revertedWithCustomError(pulseOracle, "InvalidExternalNullifier");
    });

    it("exposes expected World ID params for the frontend", async function () {
      const { pulseOracle, owner, profileId } = await networkHelpers.loadFixture(deployPulseOracleV2);
      const expected = getCheckinWorldIdParams(owner.address);

      const onchain = await pulseOracle.getCheckinWorldIdParams(profileId);
      expect(onchain.signalHash).to.equal(expected.signalHash);
      expect(onchain.externalNullifierHash).to.equal(expected.externalNullifierHash);
    });
  });
});
