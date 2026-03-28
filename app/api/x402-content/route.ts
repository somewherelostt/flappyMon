import { NextRequest, NextResponse } from "next/server";
import { getAdPlacement } from "@/lib/lighthouse-http-storage";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slotId = url.searchParams.get("slotId");

  if (!slotId) {
    return NextResponse.json(
      { error: "Missing slotId parameter" },
      { status: 400 },
    );
  }

  try {
    const placement = await getAdPlacement(slotId);

    if (!placement) {
      return NextResponse.json(
        { error: "No active ad found for this slot" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      slotId,
      contentUrl: placement.contentUrl,
      contentHash: placement.contentHash,
      advertiserWallet: placement.advertiserWallet,
      price: placement.price,
      expiresAt: placement.expiresAt,
      unlockedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching ad content:", error);
    return NextResponse.json(
      { error: "Failed to retrieve ad content" },
      { status: 500 },
    );
  }
}
