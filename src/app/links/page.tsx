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
  AlertTriangle,
  BookmarkPlus,
  Link as LinkIcon,
  Clock,
  Zap,
  Archive,
} from "lucide-react";
import Toast from "@/components/Toast";
import Link from "next/link";

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ArchivedLinkGroup {
  archivedAt: string;
  links: SavedLink[];
}

export default function LinksPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [archivedLinks, setArchivedLinks] = useState<ArchivedLinkGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [showAddForm, setShowAddForm] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
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

    // Trigger entrance animation
    setTimeout(() => setIsLoaded(true), 100);
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

  const loadArchivedLinks = async () => {
    if (!githubToken || !githubOwner || !githubRepo || isLoadingArchived)
      return;

    setIsLoadingArchived(true);
    try {
      const response = await fetch("/api/links?archived=true", {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Owner": githubOwner,
          "X-GitHub-Repo": githubRepo,
          "X-GitHub-Branch": githubBranch,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArchivedLinks(data);
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to load archived links", "error");
      }
    } catch (error) {
      console.error("Error loading archived links:", error);
      addToast("Network error loading archived links", "error");
    } finally {
      setIsLoadingArchived(false);
    }
  };

  const switchToArchivedTab = () => {
    if (archivedLinks.length === 0) {
      loadArchivedLinks();
    }
    setActiveTab("archived");
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

  const isConfigured = githubToken && githubOwner && githubRepo;

  const getCategoryIcon = (category: SavedLink["category"]) => {
    switch (category) {
      case "tool":
        return <Zap className="w-4 h-4" />;
      case "model":
        return <Sparkles className="w-4 h-4" />;
      case "article":
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: SavedLink["category"]) => {
    switch (category) {
      case "tool":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "model":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "article":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container py-8">
        {/* Header with improved hierarchy */}
        <div
          className={`flex items-center justify-between mb-8 transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-title text-neutral-900">Collect Links</h1>
                {links.length > 0 && (
                  <div className="px-2 py-1 bg-neutral-100 rounded-full text-xs font-medium text-neutral-600">
                    {links.length} saved
                  </div>
                )}
              </div>
              <p className="text-body">
                Save AI tools, models, and articles you discover
              </p>
            </div>
          </div>

          {isConfigured && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary group hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Link
            </button>
          )}
        </div>

        {/* Configuration Check - Improved design */}
        {!isConfigured && (
          <div
            className={`mb-8 transition-all duration-700 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="card card-padding bg-amber-50 border-amber-200 border-l-4 border-l-amber-400">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-heading text-amber-900 mb-2">
                    Configuration Required
                  </h3>
                  <p className="text-body text-amber-800 mb-4">
                    Complete your GitHub repository setup to start saving links
                    and building your newsletter collection.
                  </p>
                  <Link
                    href="/settings"
                    className="btn btn-primary btn-sm hover:scale-105 transition-transform duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    Configure Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OpenAI Tip - Enhanced design */}
        {isConfigured && !openaiApiKey && (
          <div
            className={`mb-8 transition-all duration-700 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="card card-padding bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-blue-900">
                      AI Enhancement Available
                    </h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Add your OpenAI API key to enable automatic link
                    summarization and save time
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="btn btn-secondary btn-sm hover:scale-105 transition-transform duration-200"
                >
                  <Settings className="w-4 h-4" />
                  Add API Key
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && isConfigured && (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full mx-auto mb-4"></div>
            <p className="text-body">Loading your links...</p>
          </div>
        )}

        {/* Links Table with Tabs */}
        {!isLoading && isConfigured && (
          <div
            className={`transition-all duration-700 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="card card-padding overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex items-center border-b border-neutral-200 mb-6 -mx-6 px-6">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 cursor-pointer ${
                    activeTab === "active"
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  Active Links
                  {links.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                      {links.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={switchToArchivedTab}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 cursor-pointer ${
                    activeTab === "archived"
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <Archive className="w-4 h-4 inline mr-2" />
                  Archived Links
                  {archivedLinks.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                      {archivedLinks.reduce(
                        (total, group) => total + group.links.length,
                        0
                      )}
                    </span>
                  )}
                </button>
              </div>

              {/* Active Links Table */}
              {activeTab === "active" && (
                <>
                  {links.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <BookmarkPlus className="w-10 h-10 text-neutral-400" />
                      </div>
                      <h3 className="text-heading text-neutral-900 mb-3">
                        Ready to start collecting
                      </h3>
                      <p className="text-body mb-8 max-w-md mx-auto leading-relaxed">
                        Start building your newsletter by saving interesting AI
                        tools, models, and articles you discover throughout the
                        week.
                      </p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="btn btn-primary btn-lg group hover:scale-105 transition-all duration-200 cursor-pointer"
                      >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Add Your First Link
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 w-8"></th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600">
                              Title
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 hidden md:table-cell">
                              Description
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 hidden lg:table-cell">
                              Category
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 hidden lg:table-cell">
                              Added
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-neutral-600 w-24">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {links.map((link, index) => (
                            <tr
                              key={link.id}
                              className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200 ${
                                isLoaded
                                  ? "opacity-100 translate-y-0"
                                  : "opacity-0 translate-y-4"
                              }`}
                              style={{
                                transitionDelay: `${500 + index * 50}ms`,
                              }}
                            >
                              <td className="py-4 px-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${getCategoryColor(
                                    link.category
                                  )}`}
                                >
                                  {getCategoryIcon(link.category)}
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="space-y-1">
                                  <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">
                                    {link.title || "Untitled"}
                                  </h3>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors truncate block cursor-pointer"
                                  >
                                    {new URL(link.url).hostname}
                                  </a>
                                </div>
                              </td>
                              <td className="py-4 px-2 hidden md:table-cell">
                                {link.description && (
                                  <p className="text-sm text-neutral-600 line-clamp-2 max-w-md">
                                    {link.description}
                                  </p>
                                )}
                              </td>
                              <td className="py-4 px-2 hidden lg:table-cell">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                                    link.category
                                  )}`}
                                >
                                  <span className="capitalize">
                                    {link.category}
                                  </span>
                                </span>
                              </td>
                              <td className="py-4 px-2 hidden lg:table-cell">
                                <div className="flex items-center gap-1 text-xs text-neutral-500">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(
                                      link.savedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center justify-end gap-1">
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all duration-200 cursor-pointer"
                                    title="Open link"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                  <button
                                    onClick={() => deleteLink(link.id)}
                                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                                    title="Delete link"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* Archived Links Table */}
              {activeTab === "archived" && (
                <>
                  {isLoadingArchived ? (
                    <div className="text-center py-16">
                      <div className="animate-spin w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full mx-auto mb-4"></div>
                      <p className="text-body">Loading archived links...</p>
                    </div>
                  ) : archivedLinks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Archive className="w-10 h-10 text-neutral-400" />
                      </div>
                      <h3 className="text-heading text-neutral-900 mb-3">
                        No archived links yet
                      </h3>
                      <p className="text-body max-w-md mx-auto leading-relaxed">
                        When you export newsletters and archive used links,
                        they&apos;ll appear here for reference.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {archivedLinks.map((group, groupIndex) => (
                        <div
                          key={groupIndex}
                          className="border border-neutral-200 rounded-lg overflow-hidden"
                        >
                          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-sm text-neutral-600">
                                <Archive className="w-4 h-4" />
                                <span>
                                  Archived{" "}
                                  {new Date(
                                    group.archivedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="px-2 py-1 bg-neutral-200 rounded-full text-xs font-medium text-neutral-600">
                                {group.links.length} links
                              </div>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <tbody>
                                {group.links.map((link) => (
                                  <tr
                                    key={link.id}
                                    className={`border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors duration-200`}
                                  >
                                    <td className="py-3 px-4 w-8">
                                      <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center ${getCategoryColor(
                                          link.category
                                        )}`}
                                      >
                                        {getCategoryIcon(link.category)}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-neutral-900 line-clamp-1">
                                          {link.title || "Untitled"}
                                        </h4>
                                        <a
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors truncate block cursor-pointer"
                                        >
                                          {new URL(link.url).hostname}
                                        </a>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                      {link.description && (
                                        <p className="text-sm text-neutral-600 line-clamp-1 max-w-md">
                                          {link.description}
                                        </p>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 hidden lg:table-cell">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                                          link.category
                                        )}`}
                                      >
                                        <span className="capitalize">
                                          {link.category}
                                        </span>
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 w-16">
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all duration-200 cursor-pointer"
                                        title="Open link"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Add Link Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-title text-neutral-900 mb-6">
                  Add New Link
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={newLink.url}
                      onChange={(e) =>
                        setNewLink({ ...newLink, url: e.target.value })
                      }
                      className="input"
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                      className="input"
                    >
                      <option value="tool">AI Tool</option>
                      <option value="model">AI Model</option>
                      <option value="article">Article</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newLink.title}
                      onChange={(e) =>
                        setNewLink({ ...newLink, title: e.target.value })
                      }
                      className="input"
                      placeholder="Enter title or use AI summarization"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newLink.description}
                      onChange={(e) =>
                        setNewLink({ ...newLink, description: e.target.value })
                      }
                      className="input resize-none"
                      rows={3}
                      placeholder="Enter description or use AI summarization"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="btn btn-ghost cursor-pointer"
                    >
                      Cancel
                    </button>
                    {openaiApiKey && (
                      <button
                        onClick={summarizeLink}
                        disabled={isGeneratingSummary || !newLink.url}
                        className="btn btn-secondary cursor-pointer"
                      >
                        {isGeneratingSummary ? (
                          <div className="animate-spin w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {isGeneratingSummary
                          ? "Summarizing..."
                          : "AI Summarize"}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={saveLink}
                    disabled={isSaving || !newLink.url}
                    className="btn btn-primary cursor-pointer"
                  >
                    {isSaving ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Link"}
                  </button>
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
