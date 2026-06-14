import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const bindings = new Map<string, { catalogId: string; adapterAddress: string; capabilities: string }>();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      catalogId?: string;
      adapterAddress?: string;
      capabilities?: string;
    };

    if (!body.catalogId || !body.adapterAddress) {
      return NextResponse.json({ error: "Missing catalogId or adapterAddress." }, { status: 400 });
    }

    bindings.set(body.catalogId, {
      catalogId: body.catalogId,
      adapterAddress: body.adapterAddress,
      capabilities: body.capabilities ?? "both",
    });

    return NextResponse.json({ ok: true, binding: bindings.get(body.catalogId) });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
