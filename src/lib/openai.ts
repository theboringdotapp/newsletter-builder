import OpenAI from "openai";
import { SavedLink, Thought } from "@/types";

export class NewsletterGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateNewsletter(
    links: SavedLink[],
    thoughts: Thought[]
  ): Promise<string> {
    const prompt = this.buildPrompt(links, thoughts);

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a newsletter writer for theboring.app, using a minimalist, clean, and simple style. 
            Write in a casual, friendly, and conversational tone as if talking to a friend over coffee.
            
            Structure the newsletter like this:
            1. Start with a friendly greeting/intro paragraph
            2. Add a "This Week's Edition" summary with bullet points of what's included
            3. Then dive into individual sections with clear headers and emojis
            4. Keep the tone personal, approachable, and genuinely helpful
            
            Use HTML formatting but keep it clean and simple. Use emojis naturally throughout.
            Make it feel like insights from a friend who's been exploring AI tools all week.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2500,
        temperature: 0.7,
      });

      return (
        response.choices[0]?.message?.content ||
        "Error generating newsletter content"
      );
    } catch (error) {
      console.error("Error generating newsletter:", error);
      throw error;
    }
  }

  private buildPrompt(links: SavedLink[], thoughts: Thought[]): string {
    const currentWeek = this.getCurrentWeekString();

    let prompt = `Create a friendly, casual newsletter for ${currentWeek} inspired by "the news" style.

Start with a warm, personal greeting that acknowledges we're all building with AI together.

Then create a "This Week's Edition" section with bullet points summarizing what's included.

Content to include:

`;

    // Add tools and models section
    const tools = links.filter(
      (link) => link.category === "tool" && link.selected
    );
    const models = links.filter(
      (link) => link.category === "model" && link.selected
    );
    const articles = links.filter(
      (link) => link.category === "article" && link.selected
    );

    if (tools.length > 0) {
      prompt += "## AI Tools I Discovered This Week:\n\n";
      tools.forEach((tool) => {
        prompt += `**${tool.title || "Untitled Tool"}**\n`;
        prompt += `Link: ${tool.url}\n`;
        if (tool.description) {
          prompt += `${tool.description}\n`;
        }
        prompt += "\n";
      });
    }

    if (models.length > 0) {
      prompt += "## New AI Models Worth Checking Out:\n\n";
      models.forEach((model) => {
        prompt += `**${model.title || "Untitled Model"}**\n`;
        prompt += `Link: ${model.url}\n`;
        if (model.description) {
          prompt += `${model.description}\n`;
        }
        prompt += "\n";
      });
    }

    if (articles.length > 0) {
      prompt += "## Interesting Reads This Week:\n\n";
      articles.forEach((article) => {
        prompt += `**${article.title || "Untitled Article"}**\n`;
        prompt += `Link: ${article.url}\n`;
        if (article.description) {
          prompt += `${article.description}\n`;
        }
        prompt += "\n";
      });
    }

    // Add thoughts section
    const selectedThoughts = thoughts.filter((thought) => thought.selected);
    if (selectedThoughts.length > 0) {
      prompt += "## What I Learned Building with AI:\n\n";
      selectedThoughts.forEach((thought) => {
        prompt += `**${thought.title}**\n`;
        prompt += `${thought.content}\n\n`;
      });
    }

    prompt += `
Structure this as an HTML newsletter with:
1. A friendly opening that makes people feel like they're part of a community
2. A "This Week's Edition" summary section with bullet points
3. Each section clearly marked with emojis and headers
4. Personal commentary that adds value beyond just sharing links
5. A warm sign-off

Make it feel personal and valuable - like getting recommendations from a friend who's been exploring AI all week.
Use a conversational tone throughout. Don't just list things - explain why they matter.`;

    return prompt;
  }

  private getCurrentWeekString(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil(
      (pastDaysOfYear + startOfYear.getDay() + 1) / 7
    );

    return `Week ${weekNumber}, ${now.getFullYear()}`;
  }
}

// Helper function to extract OpenAI token from Authorization header
export function extractOpenAIToken(request: Request): string {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid OpenAI token");
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}
