#!/usr/bin/env node
/** Reads the running ngrok tunnel URL and updates TWILIO_WEBHOOK_BASE_URL in .env.local */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");

const response = await fetch("http://127.0.0.1:4040/api/tunnels");
if (!response.ok) {
  console.error("Ngrok is not running. Start it with: yarn tunnel:ngrok");
  process.exit(1);
}

const data = await response.json();
const tunnel = data.tunnels?.find(t => t.public_url?.startsWith("https://"));
if (!tunnel?.public_url) {
  console.error("No HTTPS tunnel found. Is ngrok running on port 3000?");
  process.exit(1);
}

const publicUrl = tunnel.public_url.replace(/\/$/, "");
const lines = fs.readFileSync(envPath, "utf8").split("\n");
let found = false;
const next = lines.map(line => {
  if (line.startsWith("TWILIO_WEBHOOK_BASE_URL=")) {
    found = true;
    return `TWILIO_WEBHOOK_BASE_URL=${publicUrl}`;
  }
  return line;
});
if (!found) next.push(`TWILIO_WEBHOOK_BASE_URL=${publicUrl}`);
fs.writeFileSync(envPath, next.join("\n").replace(/\n?$/, "\n"));

console.log(`TWILIO_WEBHOOK_BASE_URL=${publicUrl}`);
console.log("Restart yarn start to apply.");
