import { NextResponse } from "next/server";
import { NewsletterGenerator, extractOpenAIToken } from "@/lib/openai";
import { SavedLink, Thought } from "@/types";

export async function POST(request: Request) {
  try {
    const token = extractOpenAIToken(request);
    const generator = new NewsletterGenerator(token);

    const { links, thoughts }: { links: SavedLink[]; thoughts: Thought[] } =
      await request.json();

    const content = await generator.generateNewsletter(links, thoughts);

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating newsletter:", error);
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    );
  }
}
