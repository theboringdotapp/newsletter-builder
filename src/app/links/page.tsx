"use client";

import { useState, useEffect } from "react";
import { SavedLink } from "@/types";
import {
  Plus,
  Trash2,
  ExternalLink,
  Settings,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Toast from "@/components/Toast";
import Link from "next/link";

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function LinksPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [newLink, setNewLink] = useState({
    url: "",
    title: "",
    description: "",
    category: "tool" as SavedLink["category"],
  });

  useEffect(() => {
    // Load configuration from localStorage
    const token = localStorage.getItem("github_token") || "";
    const owner = localStorage.getItem("github_owner") || "";
    const repo = localStorage.getItem("github_repo") || "";
    const branch = localStorage.getItem("github_branch") || "main";
    const openaiKey = localStorage.getItem("openai_api_key") || "";

    setGithubToken(token);
    setGithubOwner(owner);
    setGithubRepo(repo);
    setGithubBranch(branch);
    setOpenaiApiKey(openaiKey);

    if (token && owner && repo) {
      loadLinks(token, owner, repo, branch);
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

  const loadLinks = async (
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
        const data = await response.json();
        setLinks(data);
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to load links", "error");
      }
    } catch (error) {
      console.error("Error loading links:", error);
      addToast("Network error loading links", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeLink = async () => {
    if (!newLink.url || !openaiApiKey) {
      addToast(
        "URL and OpenAI API key are required for summarization",
        "error"
      );
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await fetch("/api/links/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: newLink.url,
          openaiApiKey: openaiApiKey,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setNewLink({
          ...newLink,
          title: result.title || newLink.title,
          description: result.summary || newLink.description,
        });
        addToast("Link summarized successfully! ✨", "success");
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to summarize link", "error");
      }
    } catch (error) {
      console.error("Error summarizing link:", error);
      addToast("Network error summarizing link", "error");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const saveLink = async () => {
    if (!newLink.url || !githubToken || !githubOwner || !githubRepo) return;

    const link: SavedLink = {
      id: Date.now().toString(),
      url: newLink.url,
      title: newLink.title || undefined,
      description: newLink.description || undefined,
      category: newLink.category,
      savedAt: new Date().toISOString(),
      selected: true,
    };

    setIsSaving(true);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Owner": githubOwner,
          "X-GitHub-Repo": githubRepo,
          "X-GitHub-Branch": githubBranch,
        },
        body: JSON.stringify(link),
      });

      if (response.ok) {
        setLinks([...links, link]);
        setNewLink({ url: "", title: "", description: "", category: "tool" });
        setShowAddForm(false);
        addToast("Link saved successfully! ✨", "success");
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to save link", "error");
      }
    } catch (error) {
      console.error("Error saving link:", error);
      addToast("Network error saving link", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!githubToken || !githubOwner || !githubRepo) return;

    const updatedLinks = links.filter((link) => link.id !== linkId);
    setLinks(updatedLinks);

    try {
      const response = await fetch("/api/links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Owner": githubOwner,
          "X-GitHub-Repo": githubRepo,
          "X-GitHub-Branch": githubBranch,
        },
        body: JSON.stringify(updatedLinks),
      });

      if (!response.ok) {
        await loadLinks();
        const error = await response.json();
        addToast(error.error || "Failed to delete link", "error");
      } else {
        addToast("Link removed", "success");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      await loadLinks();
      addToast("Network error deleting link", "error");
    }
  };

  // Check if GitHub is configured
  const isGithubConfigured = githubToken && githubOwner && githubRepo;
  const isOpenAIConfigured = openaiApiKey;

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

      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">save links ✨</h1>
          {isGithubConfigured && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>add link</span>
            </button>
          )}
        </div>
      </div>

      {/* GitHub Configuration Warning */}
      {!isGithubConfigured && (
        <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                GitHub configuration required
              </h3>
              <p className="text-orange-800 mb-4">
                You need to configure your GitHub repository to save and load
                links. This is where your data will be stored.
              </p>
              <Link href="/settings" className="btn-primary">
                <Settings className="h-4 w-4 mr-2" />
                Configure in Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* OpenAI Warning (only show if GitHub is configured but OpenAI is not) */}
      {isGithubConfigured && !isOpenAIConfigured && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-blue-800 text-sm">
                <strong>Tip:</strong> Add your OpenAI API key in settings to
                enable AI-powered link summarization
              </p>
            </div>
            <Link
              href="/settings"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Add API Key
            </Link>
          </div>
        </div>
      )}

      {isGithubConfigured && (
        <>
          {showAddForm && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">add new link</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={newLink.url}
                      onChange={(e) =>
                        setNewLink({ ...newLink, url: e.target.value })
                      }
                      className="input-field flex-1"
                      placeholder="https://..."
                      required
                    />
                    {isOpenAIConfigured && newLink.url && (
                      <button
                        type="button"
                        onClick={summarizeLink}
                        disabled={isGeneratingSummary}
                        className="btn-secondary flex items-center space-x-1 whitespace-nowrap"
                        title="Generate title and summary with AI"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>
                          {isGeneratingSummary ? "AI Summary..." : "AI Summary"}
                        </span>
                      </button>
                    )}
                  </div>
                  {!isOpenAIConfigured && newLink.url && (
                    <p className="text-xs text-gray-500 mt-1">
                      <Link
                        href="/settings"
                        className="text-blue-600 hover:underline"
                      >
                        Add OpenAI API key
                      </Link>{" "}
                      to enable AI summarization
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) =>
                      setNewLink({ ...newLink, title: e.target.value })
                    }
                    className="input-field"
                    placeholder="What caught your attention?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newLink.description}
                    onChange={(e) =>
                      setNewLink({ ...newLink, description: e.target.value })
                    }
                    className="input-field"
                    rows={3}
                    placeholder="Why is this interesting?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newLink.category}
                    onChange={(e) =>
                      setNewLink({
                        ...newLink,
                        category: e.target.value as SavedLink["category"],
                      })
                    }
                    className="input-field"
                  >
                    <option value="tool">AI Tool</option>
                    <option value="model">AI Model</option>
                    <option value="article">Article</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={saveLink}
                    disabled={!newLink.url || isSaving}
                    className="btn-primary"
                  >
                    {isSaving ? "Saving..." : "Save Link"}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading your links...
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No links saved yet. Click "Add Link" to get started!
              </div>
            ) : (
              links.map((link) => (
                <div key={link.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
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
                        <span className="text-xs text-gray-500">
                          {new Date(link.savedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {link.title || "Untitled"}
                      </h3>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 text-sm flex items-center space-x-1 mb-2"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>

                      {link.description && (
                        <p className="text-gray-600 text-sm">
                          {link.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteLink(link.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
