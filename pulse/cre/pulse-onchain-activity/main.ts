import { CronCapability, handler, Runner, type Runtime } from "@chainlink/cre-sdk";

type ProfileTarget = {
  address: string;
  inactivityThresholdSeconds: number;
  inactiveSignalWeight: number;
};

type Config = {
  schedule: string;
  rpcUrl: string;
  pulseOracleAddress: string;
  profiles: ProfileTarget[];
};

const onCronTrigger = (runtime: Runtime<Config>): string => {
  runtime.log(`ONCHAIN_TX adapter — rpc ${runtime.config.rpcUrl}`);
  runtime.log(`Target oracle ${runtime.config.pulseOracleAddress || "(unset)"}`);

  if (runtime.config.profiles.length === 0) {
    runtime.log("No profiles configured");
    return "skipped:no-profiles";
  }

  for (const profile of runtime.config.profiles) {
    runtime.log(
      `Evaluate ${profile.address}: threshold=${profile.inactivityThresholdSeconds}s weight=${profile.inactiveSignalWeight}`,
    );
    runtime.log(
      "Offchain step: scan recent txs via JSON-RPC (eth_getBlockByNumber) then reportSignal if inactive",
    );
  }

  runtime.log("Local dry-run: yarn simulate:onchain-activity from repo root");
  return `onchain-activity:${runtime.config.profiles.length}`;
};

const initWorkflow = (config: Config) => {
  const cron = new CronCapability();
  return [handler(cron.trigger({ schedule: config.schedule }), onCronTrigger)];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
