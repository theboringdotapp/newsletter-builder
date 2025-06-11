import { NextResponse } from "next/server";
import { KitService } from "@/lib/kit";

const kitService = new KitService();

export async function POST(request: Request) {
  try {
    const {
      subject,
      content,
      previewText,
    }: {
      subject: string;
      content: string;
      previewText: string;
    } = await request.json();

    const broadcast = await kitService.createBroadcastDraft(
      subject,
      content,
      previewText
    );

    return NextResponse.json({ broadcast });
  } catch (error) {
    console.error("Error creating Kit.com broadcast:", error);
    return NextResponse.json(
      { error: "Failed to create Kit.com broadcast" },
      { status: 500 }
    );
  }
}
