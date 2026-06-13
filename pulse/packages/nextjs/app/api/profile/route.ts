import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { isDatabaseConfigured } from "~~/services/database/config/postgresClient";
import {
  getPulseProfileByWallet,
  upsertPulseProfile,
} from "~~/services/database/repositories/pulseProfiles";
import type { PersistedPulseProfile } from "~~/services/store/pulseStore";

export const dynamic = "force-dynamic";

const databaseUnavailable = () =>
  NextResponse.json(
    { error: "Database is not configured. Set POSTGRES_URL in packages/nextjs/.env.local." },
    { status: 503 },
  );

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return databaseUnavailable();
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");

  if (!owner || !isAddress(owner)) {
    return NextResponse.json({ error: "Missing or invalid owner query param." }, { status: 400 });
  }

  try {
    const profile = await getPulseProfileByWallet(owner);

    return NextResponse.json({
      owner: owner.toLowerCase(),
      profile,
      found: Boolean(profile),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type SaveProfileBody = {
  owner?: string;
  profile?: PersistedPulseProfile;
};

export async function PUT(request: Request) {
  if (!isDatabaseConfigured()) {
    return databaseUnavailable();
  }

  let body: SaveProfileBody;

  try {
    body = (await request.json()) as SaveProfileBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { owner, profile } = body;

  if (!owner || !isAddress(owner)) {
    return NextResponse.json({ error: "Missing or invalid owner." }, { status: 400 });
  }

  if (!profile || typeof profile !== "object") {
    return NextResponse.json({ error: "Missing profile payload." }, { status: 400 });
  }

  try {
    const savedProfile = await upsertPulseProfile(owner, profile);

    return NextResponse.json({
      owner: owner.toLowerCase(),
      profile: savedProfile,
      saved: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
