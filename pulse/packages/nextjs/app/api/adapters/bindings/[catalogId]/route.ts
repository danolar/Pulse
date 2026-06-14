import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ catalogId: string }> },
) {
  const { catalogId } = await context.params;
  return NextResponse.json({ ok: true, catalogId, revoked: true });
}
