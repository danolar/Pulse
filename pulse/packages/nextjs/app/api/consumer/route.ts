import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { isDatabaseConfigured } from "~~/services/database/config/postgresClient";
import {
  getConsumerConfigByAddress,
  upsertConsumerConfig,
} from "~~/services/database/repositories/consumerConfigs";
import type { ConsumerConfig } from "~~/types/consumer";

export const dynamic = "force-dynamic";

const databaseUnavailable = () =>
  NextResponse.json(
    { error: "Configuration storage is unavailable." },
    { status: 503 },
  );

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return databaseUnavailable();
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Missing or invalid address query param." }, { status: 400 });
  }

  try {
    const config = await getConsumerConfigByAddress(address);

    return NextResponse.json({
      consumerAddress: address.toLowerCase(),
      config,
      found: Boolean(config),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load configuration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type SaveConsumerBody = {
  consumerAddress?: string;
  config?: ConsumerConfig;
};

export async function PUT(request: Request) {
  if (!isDatabaseConfigured()) {
    return databaseUnavailable();
  }

  let body: SaveConsumerBody;

  try {
    body = (await request.json()) as SaveConsumerBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { consumerAddress, config } = body;

  if (!consumerAddress || !isAddress(consumerAddress)) {
    return NextResponse.json({ error: "Missing or invalid consumerAddress." }, { status: 400 });
  }

  if (!config || typeof config !== "object") {
    return NextResponse.json({ error: "Missing config payload." }, { status: 400 });
  }

  if (config.consumerAddress.toLowerCase() !== consumerAddress.toLowerCase()) {
    return NextResponse.json(
      { error: "Config consumerAddress must match the authenticated consumer wallet." },
      { status: 403 },
    );
  }

  try {
    const saved = await upsertConsumerConfig(consumerAddress, config);

    return NextResponse.json({
      consumerAddress: consumerAddress.toLowerCase(),
      config: saved,
      saved: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save configuration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
