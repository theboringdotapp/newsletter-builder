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

    // Generate title and summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that creates concise titles and summaries for web links. 
          Given a URL and its content (if available), create:
          1. A clear, descriptive title (max 100 characters)
          2. A brief summary explaining what the link is about and why it might be interesting (max 200 characters)
          
          Focus on being accurate and helpful. If the content seems to be about AI tools, models, or articles, highlight the key value proposition.
          
          Respond in the following JSON format:
          {
            "title": "Your title here",
            "summary": "Your summary here"
          }`,
        },
        {
          role: "user",
          content: `URL: ${url}\n\nContent: ${pageContent}`,
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

      // Fallback: use the raw response and try to extract useful info
      const title =
        result.split("\n")[0]?.replace(/['"]/g, "").substring(0, 100) ||
        "Untitled";
      const summary =
        result.substring(0, 200) || "AI-generated content summary";

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
