import { NextResponse } from "next/server";
import { getWalrusAggregatorUrl, parseWalrusBlobId } from "~~/utils/walrus";

type RouteContext = { params: Promise<{ blobId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { blobId: rawBlobId } = await context.params;
  const blobId = parseWalrusBlobId(decodeURIComponent(rawBlobId));

  if (!blobId) {
    return NextResponse.json({ error: "Invalid Walrus blob ID" }, { status: 400 });
  }

  const aggregatorUrl = `${getWalrusAggregatorUrl()}/v1/blobs/${encodeURIComponent(blobId)}`;

  try {
    const response = await fetch(aggregatorUrl, {
      headers: { Accept: "application/octet-stream, */*" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Walrus aggregator returned ${response.status}`, blobId },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const bytes = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? "application/octet-stream";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60",
        "X-Walrus-Blob-Id": blobId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error";
    return NextResponse.json({ error: message, blobId }, { status: 502 });
  }
}
