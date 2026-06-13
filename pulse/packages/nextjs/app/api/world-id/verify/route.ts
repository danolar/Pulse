import { NextResponse } from "next/server";

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

  const response = await fetch(`https://developer.world.org/api/v4/verify/${rpId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(idkitResponse),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "World ID proof rejected by verify API.", detail: detail.slice(0, 500) },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
