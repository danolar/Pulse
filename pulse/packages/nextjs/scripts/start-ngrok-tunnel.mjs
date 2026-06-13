#!/usr/bin/env node
/**
 * Starts ngrok → localhost:3000 and writes TWILIO_WEBHOOK_BASE_URL to .env.local.
 *
 * Prerequisite: NGROK_AUTHTOKEN in .env.local (free account at https://dashboard.ngrok.com/signup)
 */
import { getAppPort } from "./lib/appUrl.mjs";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env.local");

const loadEnvFile = filePath => {
  if (!fs.existsSync(filePath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
};

const upsertEnvVar = (filePath, key, value) => {
  const lines = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").split("\n") : [];
  let found = false;
  const next = lines.map(line => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) next.push(`${key}=${value}`);
  fs.writeFileSync(filePath, next.join("\n").replace(/\n?$/, "\n"));
};

const waitForTunnelUrl = async (maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4040/api/tunnels");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const tunnel = data.tunnels?.find(t => t.public_url?.startsWith("https://"));
      if (tunnel?.public_url) return tunnel.public_url.replace(/\/$/, "");
    } catch {
      // ngrok web UI not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return null;
};

const envVars = loadEnvFile(envPath);
const port = process.env.NGROK_PORT ?? String(getAppPort({ ...process.env, ...envVars }));
const authtoken = process.env.NGROK_AUTHTOKEN?.trim() || envVars.NGROK_AUTHTOKEN?.trim();

if (!authtoken) {
  console.error(`
Missing NGROK_AUTHTOKEN.

1. Create a free account: https://dashboard.ngrok.com/signup
2. Copy your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. Add to ${envPath}:

   NGROK_AUTHTOKEN=your_token_here

4. Run again: yarn tunnel:ngrok
`);
  process.exit(1);
}

const configureAuthtoken = token => {
  const ngrokConfigPath = path.join(process.env.HOME ?? "", "Library/Application Support/ngrok/ngrok.yml");
  if (fs.existsSync(ngrokConfigPath)) {
    const current = fs.readFileSync(ngrokConfigPath, "utf8");
    if (current.includes(`authtoken: ${token}`)) {
      return;
    }
  }
  console.log("Configuring ngrok authtoken…");
  spawnSync("ngrok", ["config", "add-authtoken", token], { stdio: "inherit" });
};

configureAuthtoken(authtoken);

console.log(`Starting ngrok tunnel → http://localhost:${port}`);
const ngrok = spawn("ngrok", ["http", port, "--log=stdout"], {
  stdio: ["ignore", "pipe", "pipe"],
});

ngrok.stdout.on("data", chunk => process.stdout.write(chunk));
ngrok.stderr.on("data", chunk => process.stderr.write(chunk));

const publicUrl = await waitForTunnelUrl();
if (!publicUrl) {
  console.error("Could not read ngrok public URL from http://127.0.0.1:4040/api/tunnels");
  ngrok.kill();
  process.exit(1);
}

upsertEnvVar(envPath, "TWILIO_WEBHOOK_BASE_URL", publicUrl);
if (!envVars.VOICE_CALLS_ENABLED) {
  upsertEnvVar(envPath, "VOICE_CALLS_ENABLED", "true");
}

console.log(`
Ngrok is running.

  Public URL:  ${publicUrl}
  Local app:   http://localhost:${port}
  Dashboard:   http://127.0.0.1:4040

Updated ${envPath}:
  TWILIO_WEBHOOK_BASE_URL=${publicUrl}

Restart \`yarn start\` in another terminal so Next.js picks up the new env.

Keep this terminal open while testing Twilio voice.
Press Ctrl+C to stop the tunnel.
`);

process.on("SIGINT", () => {
  ngrok.kill("SIGTERM");
  process.exit(0);
});

process.on("SIGTERM", () => {
  ngrok.kill("SIGTERM");
  process.exit(0);
});

await new Promise(() => {});
