import { NextResponse } from "next/server";

type WorldVerifyErrorBody = {
  success?: boolean;
  code?: string;
  detail?: string;
  results?: Array<{ identifier?: string; success?: boolean; code?: string; detail?: string }>;
};

const getVerifyBaseUrl = () => {
  if (process.env.WORLD_ID_VERIFY_BASE_URL?.trim()) {
    return process.env.WORLD_ID_VERIFY_BASE_URL.trim().replace(/\/$/, "");
  }

  return process.env.NEXT_PUBLIC_WORLD_ID_ENVIRONMENT === "production"
    ? "https://developer.world.org"
    : "https://staging-developer.worldcoin.org";
};

export const formatWorldVerifyError = (body: WorldVerifyErrorBody): string => {
  const parts: string[] = [];

  if (body.code) parts.push(body.code);
  if (body.detail) parts.push(body.detail);

  const failedResults = body.results?.filter(result => result.success === false) ?? [];
  for (const result of failedResults) {
    const line = [result.identifier, result.code, result.detail].filter(Boolean).join(": ");
    if (line) parts.push(line);
  }

  if (parts.length === 0) {
    return "World ID verify API rejected the proof.";
  }

  return parts.join(" — ");
};

export async function POST(request: Request) {
  const rpId = process.env.NEXT_PUBLIC_WORLD_RP_ID?.trim();
  if (!rpId) {
    return NextResponse.json({ error: "NEXT_PUBLIC_WORLD_RP_ID is not configured." }, { status: 500 });
  }

  let idkitResponse: unknown;
  try {
    const body = (await request.json()) as { idkitResponse?: unknown };
    idkitResponse = body.idkitResponse;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!idkitResponse) {
    return NextResponse.json({ error: "idkitResponse is required." }, { status: 400 });
  }

  const verifyBaseUrl = getVerifyBaseUrl();
  const response = await fetch(`${verifyBaseUrl}/api/v4/verify/${rpId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(idkitResponse),
  });

  const raw = await response.text();
  let parsed: WorldVerifyErrorBody = {};
  try {
    parsed = JSON.parse(raw) as WorldVerifyErrorBody;
  } catch {
    parsed = { detail: raw.slice(0, 500) };
  }

  if (!response.ok) {
    const message = formatWorldVerifyError(parsed);
    console.error("[world-id/verify]", verifyBaseUrl, response.status, message);

    return NextResponse.json(
      {
        error: message,
        code: parsed.code,
        detail: parsed.detail,
        results: parsed.results,
        verifyBaseUrl,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, verifyBaseUrl });
}
