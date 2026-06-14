import { NextResponse } from "next/server";
import { getChainlinkAdapterConfig, reportInactiveSignalOnchain } from "~~/utils/chainlinkOnchainAdapter";

export const dynamic = "force-dynamic";

type ReportRequestBody = {
  address?: string;
  thresholdSeconds?: number;
  weight?: number;
  force?: boolean;
};

export async function POST(request: Request) {
  let body: ReportRequestBody = {};

  try {
    body = (await request.json()) as ReportRequestBody;
  } catch {
    body = {};
  }

  try {
    const config = getChainlinkAdapterConfig();
    const result = await reportInactiveSignalOnchain({
      watchAddress: body.address ?? config.profileOwner,
      thresholdSeconds: body.thresholdSeconds,
      weight: body.weight,
      force: body.force === true,
    });

    if (result.status === "skipped") {
      return NextResponse.json(
        {
          status: result.status,
          evaluation: result.evaluation,
          profileId: result.profileId,
          pulseOracleAddress: config.oracleAddress,
          message: "Profile active within threshold — pass force:true for demo override",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      status: result.status,
      evaluation: result.evaluation,
      profileId: result.profileId,
      pulseOracleAddress: config.oracleAddress,
      txHash: result.txHash,
      walrusBlobId: result.walrusBlobId,
      walrusRef: result.walrusRef,
      chainRef: result.chainRef,
      creWorkflow: "pulse-onchain-activity",
      explorerUrl: result.txHash ? `https://sepolia.etherscan.io/tx/${result.txHash}` : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Onchain report failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
