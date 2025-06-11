import { NextResponse } from "next/server";
import { GitHubStorage } from "@/lib/github";
import { SavedLink } from "@/types";

const github = new GitHubStorage();

export async function GET() {
  try {
    const links = await github.getLinks();
    return NextResponse.json(links);
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
