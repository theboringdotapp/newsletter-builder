"use client";

import { useState, useEffect } from "react";
import { SavedLink, Thought } from "@/types";
import { Wand2, Eye, Save, Settings } from "lucide-react";
import Toast from "@/components/Toast";
import Link from "next/link";

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function BuilderPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [thoughtsText, setThoughtsText] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [openaiToken, setOpenaiToken] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Load configuration from localStorage
    const github = localStorage.getItem("github_token") || "";
    const owner = localStorage.getItem("github_owner") || "";
    const repo = localStorage.getItem("github_repo") || "";
    const branch = localStorage.getItem("github_branch") || "main";
    const openai = localStorage.getItem("openai_token") || "";

    setGithubToken(github);
    setGithubOwner(owner);
    setGithubRepo(repo);
    setGithubBranch(branch);
    setOpenaiToken(openai);

    if (github && owner && repo) {
      loadData(github, owner, repo, branch);
    } else {
      setIsLoading(false);
    }
  }, []);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async (
    token?: string,
    owner?: string,
    repo?: string,
    branch?: string
  ) => {
    const authToken = token || githubToken;
    const repoOwner = owner || githubOwner;
    const repoName = repo || githubRepo;
    const repoBranch = branch || githubBranch;

    if (!authToken || !repoOwner || !repoName) return;

    try {
      const response = await fetch("/api/links", {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-GitHub-Owner": repoOwner,
          "X-GitHub-Repo": repoName,
          "X-GitHub-Branch": repoBranch,
        },
      });

      if (response.ok) {
        const linksData = await response.json();
        setLinks(linksData);
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to load links", "error");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      addToast("Network error loading links", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLinkSelection = (linkId: string) => {
    setLinks(
      links.map((link) =>
        link.id === linkId ? { ...link, selected: !link.selected } : link
      )
    );
  };

  const parseThoughts = (): Thought[] => {
    if (!thoughtsText.trim()) return [];

    // Simple parsing - each paragraph becomes a thought
    const paragraphs = thoughtsText.split("\n\n").filter((p) => p.trim());
    return paragraphs.map((content, index) => ({
      id: `thought-${index}`,
      title: content.split("\n")[0] || `Thought ${index + 1}`,
      type: "insight",
      date: new Date().toISOString(),
      content,
      selected: true,
    }));
  };

  const generateNewsletter = async () => {
    if (!githubToken || !githubOwner || !githubRepo || !openaiToken) {
      addToast(
        "Please complete your GitHub and OpenAI configuration first",
        "error"
      );
      return;
    }

    const selectedLinks = links.filter((link) => link.selected);
    const parsedThoughts = parseThoughts();

    if (selectedLinks.length === 0 && parsedThoughts.length === 0) {
      addToast(
        "Please select some links or add thoughts to generate a newsletter.",
        "error"
      );
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiToken}`,
        },
        body: JSON.stringify({
          links: selectedLinks,
          thoughts: parsedThoughts,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
        addToast("Newsletter generated successfully! ✨", "success");
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to generate newsletter", "error");
      }
    } catch (error) {
      console.error("Error generating newsletter:", error);
      addToast("Network error generating newsletter", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveNewsletter = async () => {
    if (!generatedContent || !githubToken || !githubOwner || !githubRepo)
      return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Owner": githubOwner,
          "X-GitHub-Repo": githubRepo,
          "X-GitHub-Branch": githubBranch,
        },
        body: JSON.stringify({
          content: generatedContent,
          links: links.filter((link) => link.selected),
          thoughts: parseThoughts(),
        }),
      });

      if (response.ok) {
        addToast("Newsletter saved successfully! 📝", "success");
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to save newsletter", "error");
      }
    } catch (error) {
      console.error("Error saving newsletter:", error);
      addToast("Network error saving newsletter", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  const selectedLinksCount = links.filter((link) => link.selected).length;
  const hasRequiredTokens =
    githubToken && githubOwner && githubRepo && openaiToken;

  return (
    <div className="space-y-6">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          newsletter builder ☕
        </h1>
        {hasRequiredTokens && (
          <div className="flex space-x-3">
            <button
              onClick={generateNewsletter}
              disabled={isGenerating}
              className="btn-primary flex items-center space-x-2"
            >
              <Wand2 className="h-4 w-4" />
              <span>
                {isGenerating ? "working on it..." : "generate newsletter"}
              </span>
            </button>
            {generatedContent && (
              <button
                onClick={saveNewsletter}
                disabled={isSaving}
                className="btn-secondary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "saving..." : "save"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!hasRequiredTokens ? (
        <div className="card text-center py-12">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            configuration required
          </h3>
          <p className="text-gray-600 mb-4">
            you need to complete your github repository setup and add your
            openai token to build newsletters.
            {!githubToken &&
              !githubOwner &&
              !githubRepo &&
              !openaiToken &&
              " nothing is configured yet."}
            {(!githubToken || !githubOwner || !githubRepo) &&
              !openaiToken &&
              " github repository and openai token are missing."}
            {githubToken &&
              githubOwner &&
              githubRepo &&
              !openaiToken &&
              " openai token is missing."}
            {(!githubToken || !githubOwner || !githubRepo) &&
              openaiToken &&
              " github repository configuration is missing."}
          </p>
          <Link href="/" className="btn-primary">
            set up tokens
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Selection */}
          <div className="space-y-6">
            {/* Links Section */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                select links ({selectedLinksCount} selected)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {links.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    no links saved yet. go to the links page to add some!
                  </p>
                ) : (
                  links.map((link) => (
                    <div
                      key={link.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        link.selected
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => toggleLinkSelection(link.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                link.category === "tool"
                                  ? "bg-blue-100 text-blue-800"
                                  : link.category === "model"
                                  ? "bg-green-100 text-green-800"
                                  : link.category === "article"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {link.category}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm">
                            {link.title || "Untitled"}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {link.url}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={link.selected}
                          onChange={() => toggleLinkSelection(link.id)}
                          className="ml-2"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Thoughts Section */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">add your thoughts</h3>
              <p className="text-sm text-gray-600 mb-4">
                optional, but makes it more personal. what did you learn? what
                caught your attention?
              </p>
              <textarea
                value={thoughtsText}
                onChange={(e) => setThoughtsText(e.target.value)}
                className="input-field"
                rows={8}
                placeholder="what did you learn this week? what caught your attention? any insights worth sharing?

each paragraph becomes a separate thought, so feel free to just brain dump here.

for example:
AI tools are getting crazy good, but honestly half the battle is just knowing which one to use when.

spent way too much time this week trying to perfect a prompt when I should have just tried a different model."
              />
              <p className="text-xs text-gray-500 mt-2">
                {parseThoughts().length} thoughts will be included
              </p>
            </div>
          </div>

          {/* Generated Content Preview */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5" />
              <h3 className="text-lg font-semibold">newsletter preview</h3>
            </div>

            {generatedContent ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: generatedContent }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Wand2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  select content and click &ldquo;generate newsletter&rdquo; to
                  see your newsletter preview here.
                </p>
                <p className="text-sm mt-2">
                  newsletters work with just links too — thoughts are optional!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
