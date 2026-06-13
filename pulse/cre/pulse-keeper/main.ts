import { CronCapability, handler, Runner, type Runtime } from "@chainlink/cre-sdk";

type Config = {
  schedule: string;
  pulseOracleAddress: string;
  profileOwners: string[];
  keeperActions: string[];
};

const onCronTrigger = (runtime: Runtime<Config>): string => {
  const { pulseOracleAddress, profileOwners, keeperActions } = runtime.config;

  runtime.log(`Pulse keeper — oracle ${pulseOracleAddress || "(unset)"}`);

  if (profileOwners.length === 0) {
    runtime.log("No profileOwners in config — add addresses after deploy");
    return "skipped:no-profiles";
  }

  for (const owner of profileOwners) {
    for (const action of keeperActions) {
      runtime.log(`keeperTick profile=${owner} action=${action}`);
    }
  }

  return `keeper-tick:${profileOwners.length}`;
};

const initWorkflow = (config: Config) => {
  const cron = new CronCapability();
  return [handler(cron.trigger({ schedule: config.schedule }), onCronTrigger)];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
