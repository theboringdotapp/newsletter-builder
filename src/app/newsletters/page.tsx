"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Calendar,
  Download,
  Send,
  Copy,
  Trash2,
  Eye,
  Settings,
  AlertTriangle,
  RefreshCw,
  Plus,
} from "lucide-react";
import Toast from "@/components/Toast";

interface Newsletter {
  week: string;
  date: string;
  subject: string;
  previewText: string;
  content: string;
}

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] =
    useState<Newsletter | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [kitToken, setKitToken] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Load configuration from localStorage
    const github = localStorage.getItem("github_token") || "";
    const owner = localStorage.getItem("github_owner") || "";
    const repo = localStorage.getItem("github_repo") || "";
    const branch = localStorage.getItem("github_branch") || "main";
    const kit = localStorage.getItem("kit_api_key") || "";

    setGithubToken(github);
    setGithubOwner(owner);
    setGithubRepo(repo);
    setGithubBranch(branch);
    setKitToken(kit);

    if (github && owner && repo) {
      loadNewsletters(github, owner, repo, branch);
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

  const loadNewsletters = async (
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
      const response = await fetch("/api/newsletter", {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-GitHub-Owner": repoOwner,
          "X-GitHub-Repo": repoName,
          "X-GitHub-Branch": repoBranch,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNewsletters(data.newsletters || []);
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to load newsletters", "error");
      }
    } catch (error) {
      console.error("Error loading newsletters:", error);
      addToast("Network error loading newsletters", "error");
    } finally {
      setIsLoading(false);
    }
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

  const exportToJson = (newsletter: Newsletter) => {
    const content = JSON.stringify(
      {
        subject: newsletter.subject,
        preview_text: newsletter.previewText,
        content: newsletter.content,
        description: `theboring.app Newsletter - ${newsletter.subject}`,
        public: false,
        email_template_id: 2,
      },
      null,
      2
    );

    downloadFile(
      content,
      `newsletter-${newsletter.week}.json`,
      "application/json"
    );
    addToast(`Downloaded: newsletter-${newsletter.week}.json 📁`, "success");
  };

  const copyToClipboard = async (newsletter: Newsletter) => {
    try {
      await navigator.clipboard.writeText(newsletter.content);
      addToast("Newsletter content copied to clipboard! 📋", "success");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      addToast("Failed to copy to clipboard", "error");
    }
  };

  const exportToKit = async (newsletter: Newsletter) => {
    if (!githubToken || !githubOwner || !githubRepo) {
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
          week: newsletter.week,
          content: newsletter.content,
          subject: newsletter.subject,
          previewText: newsletter.previewText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addToast(
          `Newsletter published to Kit.com successfully! Week ${data.week} ✨`,
          "success"
        );
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

  const hasRequiredTokens = githubToken && githubOwner && githubRepo;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full mx-auto mb-4"></div>
          <p className="text-body">Loading newsletters...</p>
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
              <h1 className="text-title text-neutral-900">Your Newsletters</h1>
              <p className="text-body">
                {newsletters.length > 0
                  ? `${newsletters.length} newsletter${
                      newsletters.length === 1 ? "" : "s"
                    } created`
                  : "No newsletters created yet"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {hasRequiredTokens && (
              <button
                onClick={() => loadNewsletters()}
                className="btn btn-secondary"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
            <Link href="/builder" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Create Newsletter
            </Link>
          </div>
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
                    You need to configure GitHub repository to view saved
                    newsletters.
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
          <>
            {newsletters.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-6 text-neutral-300" />
                <h3 className="text-heading text-neutral-900 mb-2">
                  No newsletters yet
                </h3>
                <p className="text-body text-neutral-600 mb-6 max-w-md mx-auto">
                  Create your first newsletter to see it here. Start by adding
                  some links and generating content.
                </p>
                <Link href="/links" className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Get Started
                </Link>
              </div>
            ) : (
              /* Newsletter Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsletters.map((newsletter) => (
                  <div key={newsletter.week} className="card card-padding">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-neutral-600" />
                        <span className="text-heading text-neutral-900">
                          Week {newsletter.week}
                        </span>
                      </div>
                      <span className="text-caption text-neutral-500">
                        {new Date(newsletter.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                      {newsletter.subject}
                    </h3>

                    <p className="text-body text-neutral-600 mb-4 line-clamp-3">
                      {newsletter.previewText}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedNewsletter(newsletter)}
                        className="btn btn-secondary btn-sm flex-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>

                      <button
                        onClick={() => exportToJson(newsletter)}
                        className="btn btn-secondary btn-sm"
                        title="Download JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => copyToClipboard(newsletter)}
                        className="btn btn-secondary btn-sm"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {kitToken && (
                        <button
                          onClick={() => exportToKit(newsletter)}
                          disabled={isExporting}
                          className="btn btn-secondary btn-sm"
                          title="Export to Kit.com"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Newsletter Preview Modal */}
        {selectedNewsletter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div>
                  <h3 className="text-heading text-neutral-900">
                    {selectedNewsletter.subject}
                  </h3>
                  <p className="text-body text-neutral-600">
                    Week {selectedNewsletter.week} •{" "}
                    {new Date(selectedNewsletter.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => exportToJson(selectedNewsletter)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </button>

                  <button
                    onClick={() => copyToClipboard(selectedNewsletter)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>

                  {kitToken && (
                    <button
                      onClick={() => exportToKit(selectedNewsletter)}
                      disabled={isExporting}
                      className="btn btn-primary btn-sm"
                    >
                      <Send className="w-4 h-4" />
                      {isExporting ? "Exporting..." : "Kit.com"}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedNewsletter(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="prose prose-sm max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedNewsletter.content,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
