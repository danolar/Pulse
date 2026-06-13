import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { evaluateOnchainInactivity, type ProfileActivityTarget } from "~~/utils/onchainActivity";

export const dynamic = "force-dynamic";

const rpcUrl = process.env.HARDHAT_RPC_URL ?? "http://127.0.0.1:8545";

const getLastOutgoingActivity = async (profileAddress: string): Promise<number | null> => {
  const client = createPublicClient({ chain: hardhat, transport: http(rpcUrl) });
  const latestBlock = await client.getBlockNumber();
  const searchWindow = 500n;
  const fromBlock = latestBlock > searchWindow ? latestBlock - searchWindow : 0n;

  for (let blockNumber = latestBlock; blockNumber >= fromBlock; blockNumber--) {
    const block = await client.getBlock({ blockNumber, includeTransactions: true });
    for (const tx of block.transactions) {
      if (typeof tx === "string") continue;
      if (tx.from?.toLowerCase() === profileAddress.toLowerCase()) {
        return Number(block.timestamp);
      }
    }
  }

  return null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address query param" }, { status: 400 });
  }

  const profile: ProfileActivityTarget = {
    address,
    inactivityThresholdSeconds: Number(searchParams.get("thresholdSeconds") ?? 300),
    inactiveSignalWeight: Number(searchParams.get("weight") ?? 8),
  };

  try {
    const lastActivity = await getLastOutgoingActivity(address);
    const evaluation = evaluateOnchainInactivity(profile, lastActivity, Math.floor(Date.now() / 1000));

    return NextResponse.json({
      rpcUrl,
      pulseOracleAddress: process.env.NEXT_PUBLIC_PULSE_ORACLE_ADDRESS ?? null,
      evaluation,
      creWorkflow: "pulse-onchain-activity",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Evaluation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
