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
      ? customPrompt +
        `\n\nCRITICAL SYSTEM REQUIREMENTS (DO NOT MODIFY):
- For each link: **<a href="URL">Title</a>** followed by the summary on the next line
- Use clean HTML formatting with proper anchor tags
- Make titles clickable using **<a href="URL">Title</a>** format
- Links and content data will be provided in the user message - use exactly as given`
      : getCustomNewsletterPromptWithSystemRequirements();

    const content = await generator.generateNewsletter(
      links,
      thoughts,
      newsletterPrompt,
      additionalInstructions
    );

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating newsletter:", error);
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    );
  }
}
