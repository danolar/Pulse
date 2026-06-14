import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pulseRoot = path.resolve(__dirname, "../../..");

async function main() {
  const privateKey = process.env.__RUNTIME_CRE_ADAPTER_PRIVATE_KEY?.trim();
  if (!privateKey) {
    console.error("Missing decrypted CRE adapter key. Run via: yarn cre:report");
    process.exit(1);
  }

  const forwardArgs = process.argv.slice(2);
  if (!forwardArgs.includes("--broadcast")) {
    forwardArgs.push("--broadcast");
  }

  const env = {
    ...process.env,
    CRE_ADAPTER_PRIVATE_KEY: privateKey,
  };

  console.log("Running simulate:onchain-activity with CRE adapter key (already decrypted)\n");

  const child = spawn("yarn", ["simulate:onchain-activity", "--", ...forwardArgs], {
    cwd: pulseRoot,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });

  child.on("exit", code => process.exit(code ?? 0));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
