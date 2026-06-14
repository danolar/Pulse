import { ethers } from "ethers";
import { deployScript, artifacts } from "../rocketh/deploy.js";

// Hardhat account #1 — profile owner for local dev seeding.
const DEV_PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const DEV_THRESHOLD = 100;
const CAP_NEGATIVE = 1;
const CAP_BOTH = 3;

/** Match packages/nextjs/constants/internalAdapters.ts dev defaults. */
const DEV_INTERNAL_ADAPTERS = [
  {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const,
    weight: 10,
    capabilities: CAP_NEGATIVE,
    typeLabel: ethers.encodeBytes32String("ONCHAIN_TX") as `0x${string}`,
    name: "onchain-activity",
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const,
    weight: 8,
    capabilities: CAP_NEGATIVE,
    typeLabel: ethers.encodeBytes32String("GOOGLE_ACTIVITY") as `0x${string}`,
    name: "google-activity",
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as const,
    weight: 12,
    capabilities: CAP_BOTH,
    typeLabel: ethers.encodeBytes32String("VOICE_AGENT") as `0x${string}`,
    name: "twilio-voice",
  },
] as const;

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const pulseOracle = await env.deploy("PulseOracle", {
      account: deployer,
      artifact: artifacts.PulseOracle,
    });

    await env.execute(pulseOracle, {
      account: deployer,
      functionName: "createProfile",
      args: [DEV_PROFILE_OWNER, DEV_THRESHOLD],
    });

    const profileId = await env.read(pulseOracle, {
      functionName: "computeProfileId",
      args: [DEV_PROFILE_OWNER, deployer],
    });

    for (const adapter of DEV_INTERNAL_ADAPTERS) {
      await env.execute(pulseOracle, {
        account: deployer,
        functionName: "authorizeAdapter",
        args: [profileId, adapter.address, adapter.weight, adapter.capabilities, adapter.typeLabel],
      });
    }

    console.log("PulseOracle deployed:", pulseOracle.address);
    console.log("Dev profile owner:", DEV_PROFILE_OWNER);
    console.log("Dev profile consumer:", deployer);
    console.log("Dev profileId:", profileId);
    console.log("Internal adapters authorized:", DEV_INTERNAL_ADAPTERS.map(a => `${a.name}@${a.address}`).join(", "));
  },
  {
    tags: ["PulseOracle"],
  },
);
