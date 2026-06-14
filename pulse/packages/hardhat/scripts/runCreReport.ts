import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { getHackathonCreAdapterWallet } from "./creHackathonAdapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pulseRoot = path.resolve(__dirname, "../../..");

/**
 * Runs Next.js CRE simulate with the hackathon adapter PK injected at runtime (never written to .env.local).
 */
async function main() {
  const wallet = getHackathonCreAdapterWallet();
  const forwardArgs = process.argv.slice(2);
  if (!forwardArgs.includes("--broadcast")) {
    forwardArgs.push("--broadcast");
  }

  const env = {
    ...process.env,
    CRE_ADAPTER_PRIVATE_KEY: wallet.privateKey,
  };

  console.log("CRE adapter:", wallet.address);
  console.log("Running simulate:onchain-activity with ephemeral adapter key (not stored in .env.local)\n");

  const child = spawn("yarn", ["simulate:onchain-activity", "--", ...forwardArgs], {
    cwd: pulseRoot,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });

  child.on("exit", code => process.exit(code ?? 0));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
