import { NextResponse } from "next/server";
import { NewsletterGenerator } from "@/lib/openai";
import { SavedLink, Thought } from "@/types";

const generator = new NewsletterGenerator();

export async function POST(request: Request) {
  try {
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
