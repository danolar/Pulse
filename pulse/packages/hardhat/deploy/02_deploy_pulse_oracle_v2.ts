import { ethers } from "ethers";
import { deployScript, artifacts } from "../rocketh/deploy.js";
import { HACKATHON_CRE_ADAPTER_ADDRESS } from "../scripts/creHackathonAdapter.js";

const SEPOLIA_WORLD_ID_ROUTER = "0x469449f251692e0779667583026b5a1e99512157" as const;
const DEV_PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const;
const DEV_THRESHOLD = 100;
const CAP_NEGATIVE = 1;
const ONCHAIN_TX_LABEL = ethers.encodeBytes32String("ONCHAIN_TX") as `0x${string}`;
const LIFECYCLE_NONE = 0;

const resolveAddress = (value: string | undefined, fallback: string, label: string): `0x${string}` => {
  const resolved = value ?? fallback;
  if (!ethers.isAddress(resolved)) {
    throw new Error(`Invalid ${label}: ${resolved}`);
  }
  return ethers.getAddress(resolved) as `0x${string}`;
};

const resolveDeployNetwork = (): string => {
  const networkIndex = process.argv.indexOf("--network");
  if (networkIndex !== -1 && process.argv[networkIndex + 1]) {
    return process.argv[networkIndex + 1];
  }
  return "hardhat";
};

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;
    const deployNetwork = resolveDeployNetwork();
    const isSepolia = deployNetwork === "sepolia";

    console.log("Deploy network:", deployNetwork);

    const profileOwner = resolveAddress(process.env.PULSE_PROFILE_OWNER, DEV_PROFILE_OWNER, "PULSE_PROFILE_OWNER");
    const creAdapter = resolveAddress(
      process.env.CRE_ADAPTER_ADDRESS,
      HACKATHON_CRE_ADAPTER_ADDRESS,
      "CRE_ADAPTER_ADDRESS",
    );

    let worldIdRouterAddress: `0x${string}`;
    if (isSepolia) {
      worldIdRouterAddress = SEPOLIA_WORLD_ID_ROUTER;
      console.log("Using Sepolia WorldIDRouter:", worldIdRouterAddress);
    } else {
      const mockWorldId = await env.deploy("MockWorldID", {
        account: deployer,
        artifact: artifacts.MockWorldID,
      });
      worldIdRouterAddress = mockWorldId.address as `0x${string}`;
      console.log("Using MockWorldID:", worldIdRouterAddress);
    }

    const pulseOracleV2 = await env.deploy("PulseOracleV2", {
      account: deployer,
      artifact: artifacts.PulseOracleV2,
      args: [worldIdRouterAddress],
    });

    const wiredWorldId = (await env.read(pulseOracleV2, {
      functionName: "worldId",
    })) as `0x${string}`;

    if (ethers.getAddress(wiredWorldId) !== ethers.getAddress(worldIdRouterAddress)) {
      throw new Error(
        `PulseOracleV2 worldId mismatch: onchain=${wiredWorldId} expected=${worldIdRouterAddress}. ` +
          "Run yarn deploy:pulse-oracle-v2:fresh --network sepolia to redeploy.",
      );
    }

    const profileId = await env.read(pulseOracleV2, {
      functionName: "computeProfileId",
      args: [profileOwner, deployer],
    });

    const profile = await env.read(pulseOracleV2, {
      functionName: "profiles",
      args: [profileId],
    });
    const profileState = Number(profile[2]);

    if (profileState === LIFECYCLE_NONE) {
      await env.execute(pulseOracleV2, {
        account: deployer,
        functionName: "createProfile",
        args: [profileOwner, DEV_THRESHOLD],
      });
      console.log("Created profile:", profileId);
    } else {
      console.log("Profile already exists, skipping createProfile:", profileId);
    }

    const adapterAuth = await env.read(pulseOracleV2, {
      functionName: "adapters",
      args: [profileId, creAdapter],
    });
    const adapterAuthorized = adapterAuth[0];

    if (!adapterAuthorized) {
      await env.execute(pulseOracleV2, {
        account: deployer,
        functionName: "authorizeAdapter",
        args: [profileId, creAdapter, 10, CAP_NEGATIVE, ONCHAIN_TX_LABEL],
      });
      console.log("Authorized CRE adapter:", creAdapter);
    } else {
      console.log("CRE adapter already authorized:", creAdapter);
    }

    console.log("PulseOracleV2 deployed:", pulseOracleV2.address);
    console.log("World ID router:", worldIdRouterAddress);
    console.log("Profile owner:", profileOwner);
    console.log("Profile consumer:", deployer);
    console.log("ProfileId:", profileId);
    console.log("CRE adapter (ONCHAIN_TX):", creAdapter);
    console.log("Legacy v0.1 (unchanged): 0xf954586747b7361f9deac0f943160a2d66ec8e5f");
  },
  {
    tags: ["PulseOracleV2"],
  },
);
