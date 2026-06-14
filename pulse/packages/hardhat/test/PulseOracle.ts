import { expect } from "chai";
import { ethers } from "ethers";
import { network } from "hardhat";
import type { Abi_PulseOracle } from "../generated/abis/PulseOracle.js";

const { ethers: hreEthers, networkHelpers } = await network.create();

const CAP_NEGATIVE = 1;
const CAP_POSITIVE = 2;
const CAP_BOTH = 3;
const ONCHAIN_TX_LABEL = ethers.encodeBytes32String("ONCHAIN_TX");

const LifecycleState = {
  NONE: 0,
  ACTIVE: 1,
  THRESHOLD_REACHED: 2,
  FINAL: 3,
} as const;

const SignalDirection = {
  NEGATIVE: 0,
  POSITIVE: 1,
} as const;

async function deployPulseOracle() {
  const [consumer, owner, adapter, stranger] = await hreEthers.getSigners();
  const factory = await hreEthers.getContractFactory("PulseOracle");
  const pulseOracle = (await factory.deploy()) as unknown as Abi_PulseOracle & {
    getAddress: () => Promise<string>;
    connect: (signer: ethers.Signer) => Abi_PulseOracle;
  };

  const threshold = 10;
  const profileId = await pulseOracle.computeProfileId(owner.address, consumer.address);

  await pulseOracle.connect(consumer).createProfile(owner.address, threshold);
  await pulseOracle
    .connect(consumer)
    .authorizeAdapter(profileId, adapter.address, 4, CAP_BOTH, ONCHAIN_TX_LABEL);

  return { pulseOracle, consumer, owner, adapter, stranger, profileId, threshold };
}

describe("PulseOracle", function () {
  describe("createProfile", function () {
    it("creates a profile with ACTIVE state", async function () {
      const { pulseOracle, consumer, owner, profileId } = await networkHelpers.loadFixture(deployPulseOracle);
      const profile = await pulseOracle.profiles(profileId);

      expect(profile.owner).to.equal(owner.address);
      expect(profile.consumer).to.equal(consumer.address);
      expect(profile.state).to.equal(LifecycleState.ACTIVE);
      expect(profile.accumulatedWeight).to.equal(0);
      expect(profile.config.threshold).to.equal(10);
    });

    it("rejects duplicate profiles", async function () {
      const { pulseOracle, consumer, owner } = await networkHelpers.loadFixture(deployPulseOracle);

      await expect(pulseOracle.connect(consumer).createProfile(owner.address, 10)).to.be.revertedWithCustomError(
        pulseOracle,
        "ProfileExists",
      );
    });
  });

  describe("authorizeAdapter", function () {
    it("rejects zero weight", async function () {
      const { pulseOracle, consumer, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracle);

      await expect(
        pulseOracle.connect(consumer).authorizeAdapter(profileId, adapter.address, 0, CAP_NEGATIVE, ONCHAIN_TX_LABEL),
      ).to.be.revertedWithCustomError(pulseOracle, "ZeroWeight");
    });

    it("rejects weight above threshold", async function () {
      const { pulseOracle, consumer, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracle);

      await expect(
        pulseOracle.connect(consumer).authorizeAdapter(profileId, adapter.address, 11, CAP_NEGATIVE, ONCHAIN_TX_LABEL),
      ).to.be.revertedWithCustomError(pulseOracle, "WeightExceedsThreshold");
    });
  });

  describe("reportSignal", function () {
    it("accumulates negative signals until threshold", async function () {
      const { pulseOracle, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracle);
      const blobId = ethers.encodeBytes32String("evidence-1");

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);
      let profile = await pulseOracle.profiles(profileId);
      expect(profile.accumulatedWeight).to.equal(4);

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);
      profile = await pulseOracle.profiles(profileId);
      expect(profile.accumulatedWeight).to.equal(8);

      await expect(pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId))
        .to.emit(pulseOracle, "ThresholdReached");

      profile = await pulseOracle.profiles(profileId);
      expect(profile.state).to.equal(LifecycleState.THRESHOLD_REACHED);
    });

    it("resets weight on positive signals", async function () {
      const { pulseOracle, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracle);
      const blobId = ethers.encodeBytes32String("evidence-2");

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);
      await expect(pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.POSITIVE, blobId))
        .to.emit(pulseOracle, "WeightReset")
        .withArgs(profileId, 1);

      const profile = await pulseOracle.profiles(profileId);
      expect(profile.accumulatedWeight).to.equal(0);
      expect(profile.state).to.equal(LifecycleState.ACTIVE);
    });

    it("rejects unauthorized adapters", async function () {
      const { pulseOracle, stranger, profileId } = await networkHelpers.loadFixture(deployPulseOracle);

      await expect(
        pulseOracle.connect(stranger).reportSignal(profileId, SignalDirection.NEGATIVE, ethers.ZeroHash),
      ).to.be.revertedWithCustomError(pulseOracle, "NotAuthorizedAdapter");
    });
  });

  describe("setConfig", function () {
    it("triggers threshold when lowered below accumulated weight", async function () {
      const { pulseOracle, consumer, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracle);
      const blobId = ethers.encodeBytes32String("evidence-3");

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);
      let profile = await pulseOracle.profiles(profileId);
      expect(profile.accumulatedWeight).to.equal(4);

      await expect(pulseOracle.connect(consumer).setConfig(profileId, 4)).to.emit(
        pulseOracle,
        "ThresholdReached",
      );

      profile = await pulseOracle.profiles(profileId);
      expect(profile.state).to.equal(LifecycleState.THRESHOLD_REACHED);
    });
  });

  describe("checkin", function () {
    it("lets the owner reset accumulated weight", async function () {
      const { pulseOracle, owner, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracle);

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, ethers.ZeroHash);
      await pulseOracle.connect(owner).checkin(profileId);

      const profile = await pulseOracle.profiles(profileId);
      expect(profile.accumulatedWeight).to.equal(0);
    });
  });

  describe("revokeAdapter", function () {
    it("removes revoked adapters from getAdapters", async function () {
      const { pulseOracle, consumer, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracle);

      let adapters = await pulseOracle.getAdapters(profileId);
      expect(adapters).to.deep.equal([adapter.address]);

      await pulseOracle.connect(consumer).revokeAdapter(profileId, adapter.address);
      adapters = await pulseOracle.getAdapters(profileId);
      expect(adapters).to.deep.equal([]);
    });
  });

  describe("finalize", function () {
    it("moves THRESHOLD_REACHED profiles to FINAL", async function () {
      const { pulseOracle, adapter, profileId } = await networkHelpers.loadFixture(deployPulseOracle);
      const blobId = ethers.encodeBytes32String("evidence-4");

      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);
      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);
      await pulseOracle.connect(adapter).reportSignal(profileId, SignalDirection.NEGATIVE, blobId);

      await pulseOracle.finalize(profileId);
      const profile = await pulseOracle.profiles(profileId);
      expect(profile.state).to.equal(LifecycleState.FINAL);
    });
  });
});
