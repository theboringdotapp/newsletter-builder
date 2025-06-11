"use client";

import { useState, useEffect } from "react";
import { Download, Send, Copy, Settings } from "lucide-react";
import Toast from "@/components/Toast";
import Link from "next/link";

interface Newsletter {
  week: string;
  content: string;
  subject: string;
}

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function ExportPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [selectedNewsletter, setSelectedNewsletter] =
    useState<Newsletter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [exportFormat, setExportFormat] = useState<"kit" | "json" | "html">(
    "kit"
  );
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
    const kit = localStorage.getItem("kit_token") || "";

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
      // In a real implementation, you'd fetch from your GitHub storage
      // For now, we'll simulate loading recent newsletters
      setIsLoading(false);

      // Mock data for demonstration - replace with actual API call
      const mockNewsletters: Newsletter[] = [
        {
          week: "2025-W03",
          content: `
            <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #374151;">
              <h1 style="color: #1f2937; margin-bottom: 1rem;">hey there! 👋</h1>
              <p>Hope you're doing well! Another week of building with AI is in the books, and honestly, it feels like we're all just figuring this out together — which is pretty exciting.</p>
              
              <h2 style="color: #1f2937; margin: 2rem 0 1rem;">📋 this week's edition</h2>
              <ul style="margin-bottom: 2rem;">
                <li>🛠️ A few AI tools that caught my attention</li>
                <li>🤖 Some new models worth exploring</li>
                <li>💭 What I learned from building this week</li>
              </ul>
              
              <h2 style="color: #1f2937; margin: 2rem 0 1rem;">🛠️ ai tools i discovered</h2>
              <p>Found a couple of interesting tools while building this week...</p>
              
              <h2 style="color: #1f2937; margin: 2rem 0 1rem;">💭 what i learned</h2>
              <p>Building with AI is getting easier, but choosing the right tool for the job? That's still an art form.</p>
              
              <p style="margin-top: 2rem;">That's it for this week! Hope this was helpful. Talk soon ☕</p>
            </div>
          `,
          subject: "theboring.app weekly ☕ Week 3, 2025",
        },
      ];
      setNewsletters(mockNewsletters);
    } catch (error) {
      console.error("Error loading newsletters:", error);
      addToast("Failed to load newsletters", "error");
    }
  };

  const generateSubject = (week: string) => {
    return `theboring.app weekly ☕ ${week}`;
  };

  const generatePreviewText = () => {
    return "AI tools, new models, and what I learned building this week — grab your coffee ☕";
  };

  const exportToKit = async () => {
    if (!selectedNewsletter || !githubToken || !githubOwner || !githubRepo) {
      addToast("GitHub configuration required to export newsletters", "error");
      return;
    }

    if (!kitToken) {
      addToast("Kit.com token required for direct publishing", "error");
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
          week: selectedNewsletter.week,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addToast(
          `newsletter published to kit.com successfully! week ${data.week} ✨`,
          "success"
        );
      } else {
        const error = await response.json();
        addToast(
          error.error ||
            "failed to publish to kit.com. check your configuration.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error exporting to Kit:", error);
      addToast("network error exporting to kit.com", "error");
    } finally {
      setIsExporting(false);
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

  const exportToFile = async () => {
    if (!selectedNewsletter) return;

    const finalSubject = subject || generateSubject(selectedNewsletter.week);
    const finalPreviewText = previewText || generatePreviewText();

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case "json":
        content = JSON.stringify(
          {
            subject: finalSubject,
            preview_text: finalPreviewText,
            content: selectedNewsletter.content,
            description: `theboring.app Newsletter - ${finalSubject}`,
            public: false,
            email_template_id: 2,
          },
          null,
          2
        );
        filename = `newsletter-${selectedNewsletter.week}.json`;
        mimeType = "application/json";
        break;
      case "html":
        content = selectedNewsletter.content;
        filename = `newsletter-${selectedNewsletter.week}.html`;
        mimeType = "text/html";
        break;
      default:
        // Kit format (JSON)
        content = JSON.stringify(
          {
            subject: finalSubject,
            preview_text: finalPreviewText,
            content: selectedNewsletter.content,
            description: `theboring.app Newsletter - ${finalSubject}`,
            public: false,
            email_template_id: 2,
          },
          null,
          2
        );
        filename = `kit-import-${selectedNewsletter.week}.json`;
        mimeType = "application/json";
    }

    downloadFile(content, filename, mimeType);
    addToast(`file downloaded: ${filename} 📁`, "success");
  };

  const copyToClipboard = async () => {
    if (!selectedNewsletter) return;

    try {
      await navigator.clipboard.writeText(selectedNewsletter.content);
      addToast("newsletter content copied to clipboard! 📋", "success");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      addToast("failed to copy to clipboard", "error");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

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
          export newsletter ✉️
        </h1>
      </div>

      {!githubToken || !githubOwner || !githubRepo ? (
        <div className="card text-center py-12">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            github configuration required
          </h3>
          <p className="text-gray-600 mb-4">
            you need to complete your github repository setup to load saved
            newsletters.
          </p>
          <Link href="/" className="btn-primary">
            complete setup
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Newsletter Selection & Configuration */}
          <div className="space-y-6">
            {/* Newsletter Selection */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">select newsletter</h3>
              {newsletters.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  no newsletters found. generate a newsletter first!
                </p>
              ) : (
                <div className="space-y-2">
                  {newsletters.map((newsletter) => (
                    <div
                      key={newsletter.week}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedNewsletter?.week === newsletter.week
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedNewsletter(newsletter)}
                    >
                      <h4 className="font-medium">{newsletter.week}</h4>
                      <p className="text-sm text-gray-600 truncate">
                        {newsletter.subject}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Configuration */}
            {selectedNewsletter && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                  newsletter settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      subject line
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input-field"
                      placeholder={generateSubject(selectedNewsletter.week)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      preview text
                    </label>
                    <input
                      type="text"
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      className="input-field"
                      placeholder={generatePreviewText()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      export format
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) =>
                        setExportFormat(
                          e.target.value as "kit" | "json" | "html"
                        )
                      }
                      className="input-field"
                    >
                      <option value="kit">kit.com JSON (importable)</option>
                      <option value="json">raw JSON</option>
                      <option value="html">HTML only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export Actions & Preview */}
          <div className="space-y-6">
            {selectedNewsletter && (
              <>
                {/* Export Actions */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">export options</h3>
                  <div className="space-y-3">
                    <button
                      onClick={exportToKit}
                      disabled={isExporting || !kitToken}
                      className={`btn-primary w-full flex items-center justify-center space-x-2 ${
                        !kitToken ? "opacity-50" : ""
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      <span>
                        {isExporting
                          ? "creating draft..."
                          : !kitToken
                          ? "kit.com token required"
                          : "create kit.com draft"}
                      </span>
                    </button>

                    <button
                      onClick={exportToFile}
                      className="btn-secondary w-full flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>download file</span>
                    </button>

                    <button
                      onClick={copyToClipboard}
                      className="btn-secondary w-full flex items-center justify-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>copy to clipboard</span>
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">
                    content preview
                  </h3>
                  <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedNewsletter.content,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">how to use</h3>
        <div className="text-blue-800 space-y-2">
          <p>
            <strong>kit.com draft:</strong> creates a draft directly in your
            kit.com account. requires valid API key.
          </p>
          <p>
            <strong>download file:</strong> downloads a file you can import
            manually into kit.com or other email platforms.
          </p>
          <p>
            <strong>copy to clipboard:</strong> copies the HTML content for
            pasting into any email editor.
          </p>
        </div>
      </div>
    </div>
  );
}
