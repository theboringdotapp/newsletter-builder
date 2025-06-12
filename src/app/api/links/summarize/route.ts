import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { url, openaiApiKey } = await request.json();

    if (!url || !openaiApiKey) {
      return NextResponse.json(
        { error: "URL and OpenAI API key are required" },
        { status: 400 }
      );
    }

    // Initialize OpenAI with the provided API key
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Fetch the webpage content
    let pageContent = "";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }

      const html = await response.text();

      // Extract text content from HTML (basic extraction)
      pageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove styles
        .replace(/<[^>]*>/g, " ") // Remove HTML tags
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim()
        .substring(0, 4000); // Limit to first 4000 characters
    } catch (fetchError) {
      console.error("Error fetching URL:", fetchError);
      // If we can't fetch the content, we'll still try to analyze just the URL
      pageContent = `URL: ${url}`;
    }

    // Get custom summary prompt from client or use default
    const customPrompt = await request.headers.get("X-Custom-Prompt");

    // Import the function at the top if it wasn't already imported
    const { getCustomSummaryPrompt } = await import("@/lib/openai");

    // Always ensure JSON format requirements are protected
    const summaryPrompt = customPrompt
      ? customPrompt +
        `\n\nRespond in JSON format:\n{\n  "title": "Direct factual title",\n  "summary": "How this helps with coding/AI development"\n}`
      : getCustomSummaryPrompt() +
        `\n\nRespond in JSON format:\n{\n  "title": "Direct factual title",\n  "summary": "How this helps with coding/AI development"\n}`;

    // Generate title and summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: summaryPrompt,
        },
        {
          role: "user",
          content: `URL: ${url}

Content: ${pageContent}

Context: This is for a "Coding with AI" newsletter. The link should be categorized as one of:
- AI Tool: Development tools that use AI (IDEs, coding assistants, etc.)
- AI Model: Language models, APIs, or AI services for developers
- Article: Technical articles, tutorials, or news about AI in development
- Other: AI-related resources that don't fit the above

Focus on the programming/development angle and why developers building with AI would find this useful.`,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      throw new Error("No response from OpenAI");
    }

    try {
      const parsed = JSON.parse(result);
      return NextResponse.json({
        title: parsed.title || "Untitled",
        summary: parsed.summary || "No summary available",
        url: url,
      });
    } catch (parseError) {
      // If JSON parsing fails, try to extract title and summary manually
      console.error(
        "JSON parsing failed, attempting manual extraction:",
        parseError
      );

      // Try to extract structured data from the response
      let title = "AI Tool or Resource";
      let summary = "AI-related content for developers";

      // Look for title patterns
      const titleMatch =
        result.match(/"title":\s*"([^"]+)"/i) ||
        result.match(/title:\s*([^\n]+)/i) ||
        result.match(/^([^\n]+)/);
      if (titleMatch) {
        title = titleMatch[1].replace(/['"]/g, "").trim().substring(0, 60);
      }

      // Look for summary patterns
      const summaryMatch =
        result.match(/"summary":\s*"([^"]+)"/i) ||
        result.match(/summary:\s*([^\n]+)/i);
      if (summaryMatch) {
        summary = summaryMatch[1].replace(/['"]/g, "").trim().substring(0, 150);
      }

      return NextResponse.json({
        title,
        summary,
        url: url,
      });
    }
  } catch (error) {
    console.error("Error summarizing link:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to summarize link" },
      { status: 500 }
    );
  }
}
