import { NextResponse } from "next/server";
import { KitService, extractKitToken } from "@/lib/kit";

export async function POST(request: Request) {
  try {
    const { week, content, subject, previewText } = await request.json();

    // Validate that content is provided
    if (!content || !subject || !previewText) {
      return NextResponse.json(
        { error: "Newsletter content, subject, and preview text are required" },
        { status: 400 }
      );
    }

    // Check for Kit.com API key
    let kitApiKey: string;
    try {
      kitApiKey = extractKitToken(request);
    } catch (error) {
      return NextResponse.json(
        { error: "Kit.com API key required for direct publishing" },
        { status: 400 }
      );
    }

    // Send to Kit.com
    const kit = new KitService(kitApiKey);
    try {
      const result = await kit.createBroadcastDraft(
        subject,
        content,
        previewText
      );

      return NextResponse.json({
        success: true,
        result,
        week,
      });
    } catch (kitError: any) {
      // Log the detailed Kit.com error
      console.error("Kit.com API Error:", {
        message: kitError.message,
        response: kitError.response?.data,
        status: kitError.response?.status,
        statusText: kitError.response?.statusText,
      });

      // Return more specific error information
      const errorMessage =
        kitError.response?.data?.errors?.[0] ||
        kitError.response?.data?.error ||
        kitError.message ||
        "Unknown Kit.com API error";

      return NextResponse.json(
        {
          error: `Kit.com API Error: ${errorMessage}`,
          details: kitError.response?.data || kitError.message,
        },
        { status: kitError.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error("Error publishing to Kit.com:", error);
    return NextResponse.json(
      {
        error: "Failed to publish newsletter",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
