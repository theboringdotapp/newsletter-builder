import { NextResponse } from "next/server";
import {
  NewsletterGenerator,
  extractOpenAIToken,
  getCustomNewsletterPromptWithSystemRequirements,
} from "@/lib/openai";
import { SavedLink, Thought } from "@/types";

export async function POST(request: Request) {
  try {
    const token = extractOpenAIToken(request);
    const generator = new NewsletterGenerator(token);

    const {
      links,
      thoughts,
      customPrompt,
      additionalInstructions,
    }: {
      links: SavedLink[];
      thoughts: Thought[];
      customPrompt?: string;
      additionalInstructions?: string;
    } = await request.json();

    // Always ensure system requirements are appended to protect core functionality
    const newsletterPrompt = customPrompt
      ? customPrompt + getCustomNewsletterPromptWithSystemRequirements()
      : getCustomNewsletterPromptWithSystemRequirements();

    const content = await generator.generateNewsletter(
      links,
      thoughts,
      newsletterPrompt,
      additionalInstructions
    );

    return NextResponse.json({
      content: content.content,
      title: content.title,
    });
  } catch (error) {
    console.error("Error generating newsletter:", error);
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    );
  }
}
