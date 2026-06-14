import { NextResponse } from "next/server";
import { evaluateChainlinkActivity } from "~~/utils/chainlinkOnchainAdapter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address query param" }, { status: 400 });
  }

  try {
    const thresholdSeconds = Number(searchParams.get("thresholdSeconds") ?? 300);
    const weight = Number(searchParams.get("weight") ?? 10);
    const { config, evaluation } = await evaluateChainlinkActivity(address, {
      thresholdSeconds,
      weight,
    });

    return NextResponse.json({
      rpcUrl: config.rpcUrl,
      pulseOracleAddress: config.oracleAddress,
      profileOwner: config.profileOwner,
      profileConsumer: config.profileConsumer,
      evaluation,
      creWorkflow: "pulse-onchain-activity",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Evaluation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
