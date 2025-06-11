import OpenAI from "openai";
import { SavedLink, Thought } from "@/types";

export class NewsletterGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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
            content: `You are a newsletter writer for theboring.app, a brand focused on AI development tools and insights. 
            Your tone is professional but approachable, technical but accessible. 
            You write weekly newsletters that include:
            1. New AI tools worth checking out
            2. New AI models that are interesting
            3. Condensed weekly learnings from the creator's thoughts
            
            Format the output as clean HTML that can be used in email templates.
            Use proper headings, bullet points, and structure for readability.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
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

    let prompt = `Generate a weekly newsletter for the week of ${currentWeek}.\n\n`;

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
      prompt += "## 🛠️ AI Tools Worth Checking Out\n\n";
      tools.forEach((tool) => {
        prompt += `**${tool.title || tool.url}**\n`;
        prompt += `${tool.url}\n`;
        if (tool.description) {
          prompt += `${tool.description}\n`;
        }
        prompt += "\n";
      });
    }

    if (models.length > 0) {
      prompt += "## 🤖 New AI Models to Explore\n\n";
      models.forEach((model) => {
        prompt += `**${model.title || model.url}**\n`;
        prompt += `${model.url}\n`;
        if (model.description) {
          prompt += `${model.description}\n`;
        }
        prompt += "\n";
      });
    }

    if (articles.length > 0) {
      prompt += "## 📚 Interesting Reads\n\n";
      articles.forEach((article) => {
        prompt += `**${article.title || article.url}**\n`;
        prompt += `${article.url}\n`;
        if (article.description) {
          prompt += `${article.description}\n`;
        }
        prompt += "\n";
      });
    }

    // Add thoughts section
    const selectedThoughts = thoughts.filter((thought) => thought.selected);
    if (selectedThoughts.length > 0) {
      prompt += "## 💭 Weekly Learnings & Insights\n\n";
      prompt +=
        "Here are some condensed insights from my week of building with AI:\n\n";
      selectedThoughts.forEach((thought) => {
        prompt += `**${thought.title}**\n`;
        prompt += `${thought.content}\n\n`;
      });
    }

    prompt +=
      "\nPlease write this as a cohesive newsletter with proper HTML formatting. ";
    prompt +=
      "Add engaging introductions to each section and make it feel personal and valuable to readers interested in AI development.";

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
