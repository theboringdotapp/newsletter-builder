import { NextResponse } from "next/server";
import { GitHubStorage, extractGitHubConfig } from "@/lib/github";
import { SavedLink } from "@/types";

export async function GET(request: Request) {
  try {
    const { token, owner, repo, branch } = extractGitHubConfig(request);
    const github = new GitHubStorage(token, owner, repo, branch);

    // Check if this is a request for archived links
    const url = new URL(request.url);
    const archived = url.searchParams.get("archived");

    if (archived === "true") {
      const archivedLinks = await github.getArchivedLinks();
      return NextResponse.json(archivedLinks);
    } else {
      const links = await github.getLinks();
      return NextResponse.json(links);
    }
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { token, owner, repo, branch } = extractGitHubConfig(request);
    const github = new GitHubStorage(token, owner, repo, branch);
    const link: SavedLink = await request.json();
    await github.saveLink(link);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving link:", error);
    return NextResponse.json({ error: "Failed to save link" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { token, owner, repo, branch } = extractGitHubConfig(request);
    const github = new GitHubStorage(token, owner, repo, branch);
    const links: SavedLink[] = await request.json();
    await github.updateLinks(links);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating links:", error);
    return NextResponse.json(
      { error: "Failed to update links" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { token, owner, repo, branch } = extractGitHubConfig(request);
    const github = new GitHubStorage(token, owner, repo, branch);
    const { usedLinkIds }: { usedLinkIds: string[] } = await request.json();
    await github.archiveLinks(usedLinkIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error archiving links:", error);
    return NextResponse.json(
      { error: "Failed to archive links" },
      { status: 500 }
    );
  }
}
