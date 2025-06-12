import { OpenAI } from "openai";
import { SavedLink, Thought } from "@/types";

export class NewsletterGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateNewsletter(
    links: SavedLink[],
    thoughts: Thought[],
    customPrompt?: string,
    additionalInstructions?: string
  ): Promise<string> {
    const prompt = this.buildPrompt(links, thoughts, additionalInstructions);

    // Use custom prompt if provided, otherwise use default
    const systemPrompt =
      customPrompt ||
      `You are a newsletter writer for theboring.app with a direct, stoic, yet friendly tone.
            
            Structure the newsletter exactly like this:
            1. Start with ONE sentence intro - direct and to the point
            2. Links section - each link is the title in bold (make it clickable with HTML), then the summary underneath. No extra context.
            3. End with ONE sentence asking for feedback
            
            Format requirements:
            - Keep intro to max 1 line
            - For each link: **<a href="URL">Title</a>** followed by the summary on the next line
            - No extra commentary beyond the provided summaries
            - Footer must be exactly 1 line asking for feedback
            - Tone: Direct, stoic, yet friendly - no fluff
            
            Use clean HTML formatting. Be concise and valuable.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt,
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

  private buildPrompt(
    links: SavedLink[],
    thoughts: Thought[],
    additionalInstructions?: string
  ): string {
    const currentWeek = this.getCurrentWeekString();

    let prompt = `Create a direct, stoic newsletter for ${currentWeek}.

Format requirements:
- Start with exactly 1 sentence intro
- List links with title in bold and clickable, summary underneath
- End with exactly 1 sentence asking for feedback
- No fluff, no extra commentary

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
      prompt += "## AI Tools:\n\n";
      tools.forEach((tool) => {
        prompt += `Title: ${tool.title || "Untitled Tool"}\n`;
        prompt += `URL: ${tool.url}\n`;
        if (tool.description) {
          prompt += `Summary: ${tool.description}\n`;
        }
        prompt += "\n";
      });
    }

    if (models.length > 0) {
      prompt += "## AI Models:\n\n";
      models.forEach((model) => {
        prompt += `Title: ${model.title || "Untitled Model"}\n`;
        prompt += `URL: ${model.url}\n`;
        if (model.description) {
          prompt += `Summary: ${model.description}\n`;
        }
        prompt += "\n";
      });
    }

    if (articles.length > 0) {
      prompt += "## Articles:\n\n";
      articles.forEach((article) => {
        prompt += `Title: ${article.title || "Untitled Article"}\n`;
        prompt += `URL: ${article.url}\n`;
        if (article.description) {
          prompt += `Summary: ${article.description}\n`;
        }
        prompt += "\n";
      });
    }

    // Add thoughts section
    const selectedThoughts = thoughts.filter((thought) => thought.selected);
    if (selectedThoughts.length > 0) {
      prompt += "## Thoughts:\n\n";
      selectedThoughts.forEach((thought) => {
        prompt += `${thought.content}\n\n`;
      });
    }

    prompt += `
Structure this as clean HTML with:
1. ONE sentence intro - direct and value-focused
2. For each link: **<a href="URL">Title</a>** on one line, then summary on next line
3. Include thoughts if provided
4. ONE sentence footer asking for feedback

Keep it direct, stoic, and valuable. No unnecessary words.
Make titles clickable using proper HTML anchor tags.
Don't add extra context - just present the content cleanly.`;

    // Add additional instructions if provided
    if (additionalInstructions?.trim()) {
      prompt += `\n\nAdditional Instructions:\n${additionalInstructions.trim()}`;
    }

    return prompt;
  }

  private getCurrentWeekString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const days = Math.floor(
      (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    );
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, "0")}`;
  }
}

export function extractOpenAIToken(request: Request): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }
  return authHeader.substring(7);
}

// Helper functions for prompt management
export function getCustomSummaryPrompt(): string {
  if (typeof window === "undefined") return getDefaultSummaryPrompt();
  return localStorage.getItem("summary_prompt") || getDefaultSummaryPrompt();
}

export function getCustomNewsletterPrompt(): string {
  if (typeof window === "undefined") return getDefaultNewsletterPrompt();
  return (
    localStorage.getItem("newsletter_prompt") || getDefaultNewsletterPrompt()
  );
}

export function getDefaultSummaryPrompt(): string {
  return `You are creating titles and summaries for a "Coding with AI" newsletter. 

TITLE REQUIREMENTS:
- Be direct and factual (max 60 characters)
- Don't be creative or clever, just state what it is
- For AI models: use format like "Claude 3.5 Sonnet" or "GPT-4 Turbo"
- For tools: use format like "GitHub Copilot" or "Cursor IDE"
- For articles: be descriptive like "OpenAI's new reasoning model" or "How to fine-tune LLMs"

SUMMARY REQUIREMENTS:
- Relate to coding/development with AI (max 150 characters)
- Focus on why developers would care
- Mention specific programming use cases when possible
- Be practical, not marketing-heavy

Examples:
- Title: "Claude 3.5 Sonnet" → Summary: "Anthropic's latest model with improved coding abilities and better reasoning for complex programming tasks"
- Title: "GitHub Copilot Chat" → Summary: "AI pair programmer that helps write code, debug, and explain functions directly in your IDE"`;
}

export function getCustomSummaryPromptWithSystemRequirements(): string {
  const customPart = getCustomSummaryPrompt();

  // Always append the protected system requirements
  const systemRequirements = `

Respond in JSON format:
{
  "title": "Direct factual title",
  "summary": "How this helps with coding/AI development"
}`;

  return customPart + systemRequirements;
}

export function getDefaultNewsletterPrompt(): string {
  return `You are a newsletter writer for theboring.app with a direct, stoic, yet friendly tone.

Structure the newsletter exactly like this:
1. Start with ONE sentence intro - direct and to the point
2. Links section - each link is the title in bold (make it clickable with HTML), then the summary underneath. No extra context.
3. End with ONE sentence asking for feedback

Format requirements:
- Keep intro to max 1 line
- For each link: **<a href="URL">Title</a>** followed by the summary on the next line
- No extra commentary beyond the provided summaries
- Footer must be exactly 1 line asking for feedback
- Tone: Direct, stoic, yet friendly - no fluff

Use clean HTML formatting. Be concise and valuable.`;
}

export function getCustomNewsletterPromptWithSystemRequirements(): string {
  const customPart = getCustomNewsletterPrompt();

  // Always append the protected system requirements that ensure proper HTML format
  const systemRequirements = `

CRITICAL SYSTEM REQUIREMENTS (DO NOT MODIFY):
- For each link: **<a href="URL">Title</a>** followed by the summary on the next line
- Use clean HTML formatting with proper anchor tags
- Make titles clickable using **<a href="URL">Title</a>** format
- Links and content data will be provided in the user message - use exactly as given`;

  return customPart + systemRequirements;
}
