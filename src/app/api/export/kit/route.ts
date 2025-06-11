import { NextResponse } from "next/server";
import { GitHubStorage, extractGitHubConfig } from "@/lib/github";
import { KitService, extractKitToken } from "@/lib/kit";

export async function POST(request: Request) {
  try {
    const { token, owner, repo, branch } = extractGitHubConfig(request);
    const github = new GitHubStorage(token, owner, repo, branch);

    const { week } = await request.json();

    // Get newsletter data from GitHub
    const newsletterData = await github.getNewsletterData(week);
    if (!newsletterData || !newsletterData.generatedContent) {
      return NextResponse.json(
        { error: "Newsletter not found or has no content" },
        { status: 404 }
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
    const result = await kit.createBroadcastDraft(
      `Weekly AI Newsletter ${week}`,
      newsletterData.generatedContent,
      `Your weekly dose of AI tools, models, and insights - Week ${week}`
    );

    return NextResponse.json({
      success: true,
      result,
      week,
    });
  } catch (error) {
    console.error("Error publishing to Kit.com:", error);
    return NextResponse.json(
      { error: "Failed to publish newsletter" },
      { status: 500 }
    );
  }
}
