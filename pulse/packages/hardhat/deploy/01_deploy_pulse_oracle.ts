import { deployScript, artifacts } from "../rocketh/deploy.js";

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const pulseOracle = await env.deploy("PulseOracle", {
      account: deployer,
      artifact: artifacts.PulseOracle,
      args: [deployer],
    });

    await env.execute(pulseOracle, {
      account: deployer,
      functionName: "setAdapter",
      args: [deployer, true],
    });

    await env.execute(pulseOracle, {
      account: deployer,
      functionName: "devSeedProfile",
      args: [deployer, 100n],
    });

    console.log("PulseOracle deployed:", pulseOracle.address);
    console.log("CRE adapter authorized:", deployer);
  },
  {
    tags: ["PulseOracle"],
  },
);
