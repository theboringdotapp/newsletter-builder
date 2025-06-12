"use client";

import { useState, useEffect } from "react";
import { SavedLink, Thought } from "@/types";
import {
  Wand2,
  Eye,
  Save,
  Settings,
  ArrowLeft,
  AlertTriangle,
  BookmarkPlus,
  FileText,
  Download,
  Send,
  Copy,
} from "lucide-react";
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
  const [isExporting, setIsExporting] = useState(false);
  const [thoughtsText, setThoughtsText] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [openaiToken, setOpenaiToken] = useState("");
  const [kitToken, setKitToken] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    // Load configuration from localStorage
    const github = localStorage.getItem("github_token") || "";
    const owner = localStorage.getItem("github_owner") || "";
    const repo = localStorage.getItem("github_repo") || "";
    const branch = localStorage.getItem("github_branch") || "main";
    const openai = localStorage.getItem("openai_api_key") || "";
    const kit = localStorage.getItem("kit_api_key") || "";

    setGithubToken(github);
    setGithubOwner(owner);
    setGithubRepo(repo);
    setGithubBranch(branch);
    setOpenaiToken(openai);
    setKitToken(kit);

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

  const getCurrentWeekString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const days = Math.floor(
      (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    );
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, "0")}`;
  };

  const generateSubject = () => {
    return `theboring.app weekly ☕ ${getCurrentWeekString()}`;
  };

  const generatePreviewText = () => {
    return "AI tools, new models, and what I learned building this week — grab your coffee ☕";
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJson = () => {
    if (!generatedContent) return;

    const currentWeek = getCurrentWeekString();
    const subject = generateSubject();
    const previewText = generatePreviewText();

    const content = JSON.stringify(
      {
        subject,
        preview_text: previewText,
        content: generatedContent,
        description: `theboring.app Newsletter - ${subject}`,
        public: false,
        email_template_id: 2,
      },
      null,
      2
    );

    downloadFile(content, `newsletter-${currentWeek}.json`, "application/json");
    addToast(`Downloaded: newsletter-${currentWeek}.json 📁`, "success");

    // Show archive modal if there are selected links
    const selectedLinkIds = links.filter((link) => link.selected);
    if (selectedLinkIds.length > 0) {
      setShowArchiveModal(true);
    }
  };

  const exportToKit = async () => {
    if (!generatedContent || !githubToken || !githubOwner || !githubRepo) {
      addToast("GitHub configuration required to export newsletters", "error");
      return;
    }

    if (!kitToken) {
      addToast("Kit.com API key required for direct publishing", "error");
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch("/api/export/kit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Owner": githubOwner,
          "X-GitHub-Repo": githubRepo,
          "X-GitHub-Branch": githubBranch,
          "X-Kit-Token": kitToken,
        },
        body: JSON.stringify({
          week: getCurrentWeekString(),
          content: generatedContent,
          subject: generateSubject(),
          previewText: generatePreviewText(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addToast(
          `Newsletter published to Kit.com successfully! Week ${data.week} ✨`,
          "success"
        );
        // Show archive modal if there are selected links
        const selectedLinkIds = links.filter((link) => link.selected);
        if (selectedLinkIds.length > 0) {
          setShowArchiveModal(true);
        }
      } else {
        const error = await response.json();
        addToast(
          error.error ||
            "Failed to publish to Kit.com. Check your configuration.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error exporting to Kit:", error);
      addToast("Network error exporting to Kit.com", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedContent) return;

    try {
      await navigator.clipboard.writeText(generatedContent);
      addToast("Newsletter content copied to clipboard! 📋", "success");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      addToast("Failed to copy to clipboard", "error");
    }
  };

  const archiveUsedLinks = async () => {
    if (!githubToken || !githubOwner || !githubRepo) return;

    const selectedLinkIds = links
      .filter((link) => link.selected)
      .map((link) => link.id);
    if (selectedLinkIds.length === 0) return;

    setIsArchiving(true);
    try {
      const response = await fetch("/api/links", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Owner": githubOwner,
          "X-GitHub-Repo": githubRepo,
          "X-GitHub-Branch": githubBranch,
        },
        body: JSON.stringify({
          usedLinkIds: selectedLinkIds,
        }),
      });

      if (response.ok) {
        // Remove archived links from local state
        setLinks(links.filter((link) => !selectedLinkIds.includes(link.id)));
        addToast(
          `${selectedLinkIds.length} links archived successfully! 🗃️`,
          "success"
        );
        setShowArchiveModal(false);
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to archive links", "error");
      }
    } catch (error) {
      console.error("Error archiving links:", error);
      addToast("Network error archiving links", "error");
    } finally {
      setIsArchiving(false);
    }
  };

  const selectedLinksCount = links.filter((link) => link.selected).length;
  const hasRequiredTokens =
    githubToken && githubOwner && githubRepo && openaiToken;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full mx-auto mb-4"></div>
          <p className="text-body">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-title text-neutral-900">Create Newsletter</h1>
              <p className="text-body">
                Select content and let AI craft your newsletter
              </p>
            </div>
          </div>

          {hasRequiredTokens && (
            <div className="flex gap-3">
              <button
                onClick={generateNewsletter}
                disabled={isGenerating}
                className="btn btn-primary"
              >
                <Wand2 className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Generate Newsletter"}
              </button>
              {generatedContent && (
                <button
                  onClick={saveNewsletter}
                  disabled={isSaving}
                  className="btn btn-secondary"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Configuration Check */}
        {!hasRequiredTokens && (
          <div className="mb-8">
            <div className="card card-padding bg-amber-50 border-amber-200">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div className="flex-1 text-center">
                  <h3 className="text-heading text-amber-900 mb-2">
                    Configuration Required
                  </h3>
                  <p className="text-body text-amber-800 mb-4">
                    You need to configure GitHub repository and OpenAI API key
                    to build newsletters.
                    {!githubToken &&
                      !githubOwner &&
                      !githubRepo &&
                      !openaiToken &&
                      " Nothing is configured yet."}
                    {(!githubToken || !githubOwner || !githubRepo) &&
                      !openaiToken &&
                      " GitHub repository and OpenAI API key are missing."}
                    {githubToken &&
                      githubOwner &&
                      githubRepo &&
                      !openaiToken &&
                      " OpenAI API key is missing."}
                    {(!githubToken || !githubOwner || !githubRepo) &&
                      openaiToken &&
                      " GitHub repository configuration is missing."}
                  </p>
                  <Link href="/settings" className="btn btn-primary">
                    <Settings className="w-4 h-4" />
                    Configure Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasRequiredTokens && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Selection */}
            <div className="space-y-6">
              {/* Links Section */}
              <div className="card card-padding">
                <div className="flex items-center gap-2 mb-4">
                  <BookmarkPlus className="w-5 h-5 text-neutral-600" />
                  <h3 className="text-heading text-neutral-900">
                    Select Links ({selectedLinksCount} selected)
                  </h3>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {links.length === 0 ? (
                    <div className="text-center py-8">
                      <BookmarkPlus className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                      <p className="text-body text-neutral-500 mb-4">
                        No links saved yet. Add some links first!
                      </p>
                      <Link href="/links" className="btn btn-primary btn-sm">
                        Add Links
                      </Link>
                    </div>
                  ) : (
                    links.map((link) => (
                      <div
                        key={link.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          link.selected
                            ? "border-primary-500 bg-primary-50"
                            : "border-neutral-300 hover:border-neutral-400"
                        }`}
                        onClick={() => toggleLinkSelection(link.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  link.category === "tool"
                                    ? "bg-blue-100 text-blue-800"
                                    : link.category === "model"
                                    ? "bg-green-100 text-green-800"
                                    : link.category === "article"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-neutral-100 text-neutral-800"
                                }`}
                              >
                                {link.category}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm text-neutral-900 mb-1">
                              {link.title || "Untitled"}
                            </h4>
                            <p className="text-xs text-neutral-600 truncate">
                              {link.url}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={link.selected}
                            onChange={() => toggleLinkSelection(link.id)}
                            className="ml-2 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Thoughts Section */}
              <div className="card card-padding">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-neutral-600" />
                  <h3 className="text-heading text-neutral-900">
                    Add Your Thoughts
                  </h3>
                </div>

                <p className="text-body mb-4">
                  Optional, but makes it more personal. What did you learn? What
                  caught your attention?
                </p>

                <textarea
                  value={thoughtsText}
                  onChange={(e) => setThoughtsText(e.target.value)}
                  className="input resize-none"
                  rows={8}
                  placeholder="What did you learn this week? What caught your attention? Any insights worth sharing?

Each paragraph becomes a separate thought, so feel free to just brain dump here.

For example:
AI tools are getting crazy good, but honestly half the battle is just knowing which one to use when.

Spent way too much time this week trying to perfect a prompt when I should have just tried a different model."
                />

                <p className="text-caption text-neutral-500 mt-2">
                  {parseThoughts().length} thoughts will be included
                </p>
              </div>
            </div>

            {/* Generated Content Preview & Export */}
            <div className="space-y-6">
              <div className="card card-padding">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-neutral-600" />
                  <h3 className="text-heading text-neutral-900">
                    Newsletter Preview
                  </h3>
                </div>

                {generatedContent ? (
                  <div className="prose prose-sm max-w-none border border-neutral-200 rounded-lg p-4 bg-neutral-50 max-h-96 overflow-y-auto">
                    <div
                      dangerouslySetInnerHTML={{ __html: generatedContent }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p className="text-body mb-2">
                      Select content and click "Generate Newsletter" to see your
                      newsletter preview here.
                    </p>
                    <p className="text-caption">
                      Newsletters work with just links too — thoughts are
                      optional!
                    </p>
                  </div>
                )}
              </div>

              {/* Export Options */}
              {generatedContent && (
                <div className="card card-padding">
                  <h3 className="text-heading text-neutral-900 mb-4">
                    Export Options
                  </h3>

                  <div className="space-y-3">
                    <button
                      onClick={exportToKit}
                      disabled={isExporting || !kitToken}
                      className={`btn w-full ${
                        !kitToken ? "btn-secondary opacity-50" : "btn-primary"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      {isExporting
                        ? "Creating draft..."
                        : !kitToken
                        ? "Kit.com token required"
                        : "Create Kit.com Draft"}
                    </button>

                    <button
                      onClick={exportToJson}
                      className="btn btn-secondary w-full"
                    >
                      <Download className="w-4 h-4" />
                      Download JSON
                    </button>

                    <button
                      onClick={copyToClipboard}
                      className="btn btn-secondary w-full"
                    >
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Step */}
        {generatedContent && (
          <div className="mt-12 text-center">
            <div className="card card-padding bg-emerald-50 border-emerald-200 inline-block">
              <p className="text-body text-emerald-800 mb-4">
                Newsletter created! View all your newsletters or create another
                one.
              </p>
              <Link href="/newsletters" className="btn btn-primary">
                View All Newsletters
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Archive Links Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-title text-neutral-900 mb-4">
                Archive Used Links?
              </h3>
              <p className="text-body text-neutral-600 mb-6">
                Your newsletter has been exported successfully! Would you like
                to archive the {links.filter((link) => link.selected).length}{" "}
                links you used? This will help you start fresh for your next
                newsletter.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={archiveUsedLinks}
                  disabled={isArchiving}
                  className="btn btn-primary flex-1"
                >
                  {isArchiving ? "Archiving..." : "Yes, Archive Links"}
                </button>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  disabled={isArchiving}
                  className="btn btn-secondary flex-1"
                >
                  Keep Links
                </button>
              </div>

              <p className="text-caption text-neutral-500 mt-4">
                Archived links will be saved to your repository and removed from
                your active collection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
