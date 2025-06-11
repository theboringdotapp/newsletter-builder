import { Octokit } from "@octokit/rest";
import { SavedLink, NewsletterData } from "@/types";

export class GitHubStorage {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(token: string, owner: string, repo: string, branch = "main") {
    this.octokit = new Octokit({
      auth: token,
    });
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
  }

  async saveLink(link: SavedLink): Promise<void> {
    const path = `links/${new Date().getFullYear()}/${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}/links.json`;

    try {
      // Get existing links
      const existingLinks = await this.getLinks();
      const updatedLinks = [...existingLinks, link];

      await this.saveFile(path, JSON.stringify(updatedLinks, null, 2));
    } catch (error) {
      console.error("Error saving link:", error);
      throw error;
    }
  }

  async getLinks(year?: number, month?: number): Promise<SavedLink[]> {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;
    const path = `links/${currentYear}/${String(currentMonth).padStart(
      2,
      "0"
    )}/links.json`;

    try {
      const content = await this.getFile(path);
      return content ? JSON.parse(content) : [];
    } catch {
      console.log("No existing links file found, returning empty array");
      return [];
    }
  }

  async updateLinks(
    links: SavedLink[],
    year?: number,
    month?: number
  ): Promise<void> {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;
    const path = `links/${currentYear}/${String(currentMonth).padStart(
      2,
      "0"
    )}/links.json`;

    await this.saveFile(path, JSON.stringify(links, null, 2));
  }

  async saveNewsletterData(data: NewsletterData): Promise<void> {
    const path = `newsletters/${data.week}/newsletter.json`;
    await this.saveFile(path, JSON.stringify(data, null, 2));
  }

  async getNewsletterData(week: string): Promise<NewsletterData | null> {
    const path = `newsletters/${week}/newsletter.json`;

    try {
      const content = await this.getFile(path);
      return content ? JSON.parse(content) : null;
    } catch {
      return null;
    }
  }

  private async getFile(path: string): Promise<string | null> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch,
      });

      if ("content" in response.data) {
        return Buffer.from(response.data.content, "base64").toString("utf-8");
      }
      return null;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  private async saveFile(path: string, content: string): Promise<void> {
    try {
      // Check if file exists to get SHA
      let sha: string | undefined;
      try {
        const existingFile = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path,
          ref: this.branch,
        });
        if ("sha" in existingFile.data) {
          sha = existingFile.data.sha;
        }
      } catch (error: unknown) {
        // File doesn't exist, that's fine
        if (
          !(
            error &&
            typeof error === "object" &&
            "status" in error &&
            error.status === 404
          )
        ) {
          throw error;
        }
      }

      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: `Update ${path}`,
        content: Buffer.from(content).toString("base64"),
        branch: this.branch,
        sha,
      });
    } catch (error) {
      console.error("Error saving file:", error);
      throw error;
    }
  }
}

// Helper function to extract GitHub configuration from request headers
export function extractGitHubConfig(request: Request): {
  token: string;
  owner: string;
  repo: string;
  branch: string;
} {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid GitHub token");
  }
  const token = authHeader.substring(7); // Remove "Bearer " prefix

  const owner = request.headers.get("X-GitHub-Owner");
  const repo = request.headers.get("X-GitHub-Repo");
  const branch = request.headers.get("X-GitHub-Branch") || "main";

  if (!owner || !repo) {
    throw new Error("Missing GitHub repository configuration");
  }

  return { token, owner, repo, branch };
}
