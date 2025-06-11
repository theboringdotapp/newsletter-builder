import { NextResponse } from "next/server";
import { GitHubStorage, extractGitHubConfig } from "@/lib/github";
import { SavedLink, Thought, NewsletterData } from "@/types";

export async function POST(request: Request) {
  try {
    const { token, owner, repo, branch } = extractGitHubConfig(request);
    const github = new GitHubStorage(token, owner, repo, branch);

    const {
      content,
      links,
      thoughts,
    }: {
      content: string;
      links: SavedLink[];
      thoughts: Thought[];
    } = await request.json();

    const week = getCurrentWeekString();

    const newsletterData: NewsletterData = {
      week,
      links,
      thoughts,
      generatedContent: content,
    };

    await github.saveNewsletterData(newsletterData);

    return NextResponse.json({ success: true, week });
  } catch (error) {
    console.error("Error saving newsletter:", error);
    return NextResponse.json(
      { error: "Failed to save newsletter" },
      { status: 500 }
    );
  }
}

function getCurrentWeekString(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}
