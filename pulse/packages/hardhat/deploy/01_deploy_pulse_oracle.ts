import { ethers } from "ethers";
import { deployScript, artifacts } from "../rocketh/deploy.js";

// Hardhat account #1 — profile owner for local dev seeding.
const DEV_PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const DEV_THRESHOLD = 100;
const DEV_ADAPTER_WEIGHT = 8;
const CAP_NEGATIVE = 1;
const ONCHAIN_TX_LABEL = ethers.encodeBytes32String("ONCHAIN_TX");

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

    await env.execute(pulseOracle, {
      account: deployer,
      functionName: "authorizeAdapter",
      args: [profileId, deployer, DEV_ADAPTER_WEIGHT, CAP_NEGATIVE, ONCHAIN_TX_LABEL],
    });

    console.log("PulseOracle deployed:", pulseOracle.address);
    console.log("Dev profile owner:", DEV_PROFILE_OWNER);
    console.log("Dev profile consumer:", deployer);
    console.log("Dev profileId:", profileId);
    console.log("CRE adapter authorized:", deployer);
  },
  {
    tags: ["PulseOracle"],
  },
);
