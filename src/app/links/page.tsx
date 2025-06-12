"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function LinksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [autoSummarizeEnabled, setAutoSummarizeEnabled] = useState(false);
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
  const [shouldAutoSummarize, setShouldAutoSummarize] = useState(false);

  useEffect(() => {
    // Load configuration from localStorage
    const token = localStorage.getItem("github_token") || "";
    const owner = localStorage.getItem("github_owner") || "";
    const repo = localStorage.getItem("github_repo") || "";
    const branch = localStorage.getItem("github_branch") || "main";
    const openaiKey = localStorage.getItem("openai_api_key") || "";
    const autoSummarize = localStorage.getItem("auto_summarize") === "true";

    setGithubToken(token);
    setGithubOwner(owner);
    setGithubRepo(repo);
    setGithubBranch(branch);
    setOpenaiApiKey(openaiKey);
    setAutoSummarizeEnabled(autoSummarize);

    if (token && owner && repo) {
      loadLinks(token, owner, repo, branch);
    } else {
      setIsLoading(false);
    }

    // Check if modal should be open based on URL parameter
    const addParam = searchParams.get("add");
    if (addParam === "true") {
      setShowAddForm(true);
    } else {
      setShowAddForm(false);
    }

    // Trigger entrance animation
    setTimeout(() => setIsLoaded(true), 100);
  }, [searchParams]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // URL-based modal management
  const openAddForm = () => {
    setShowAddForm(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("add", "true");
    router.push(`/links?${params.toString()}`);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setNewLink({ url: "", title: "", description: "", category: "tool" });
    setShouldAutoSummarize(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("add");
    const newUrl = params.toString() ? `/links?${params.toString()}` : "/links";
    router.push(newUrl);
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

  // Auto-detect category based on URL
  const detectCategory = (url: string): SavedLink["category"] => {
    const urlLower = url.toLowerCase();
    if (
      urlLower.includes("github.com") ||
      urlLower.includes("huggingface.co")
    ) {
      return "model";
    }
    if (
      urlLower.includes("blog") ||
      urlLower.includes("article") ||
      urlLower.includes("medium.com")
    ) {
      return "article";
    }
    if (
      urlLower.includes("tool") ||
      urlLower.includes("app") ||
      urlLower.includes(".ai") ||
      urlLower.includes("openai.com")
    ) {
      return "tool";
    }
    return "tool"; // default
  };

  const handleUrlChange = (url: string) => {
    setNewLink((prev) => ({
      ...prev,
      url,
      category: url ? detectCategory(url) : prev.category,
    }));

    // Auto-trigger summarization if URL is valid, AI key exists, and auto-summarization is enabled
    if (
      url &&
      openaiApiKey &&
      autoSummarizeEnabled &&
      !newLink.title &&
      !newLink.description
    ) {
      setShouldAutoSummarize(true);
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
      // Get custom prompt from localStorage
      const customPrompt = localStorage.getItem("summary_prompt");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add custom prompt header if it exists (encode to handle special characters)
      if (customPrompt) {
        headers["X-Custom-Prompt"] = btoa(
          unescape(encodeURIComponent(customPrompt))
        );
      }

      const response = await fetch("/api/links/summarize", {
        method: "POST",
        headers,
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
      setShouldAutoSummarize(false);
    }
  };

  // Auto-trigger summarization when conditions are met
  useEffect(() => {
    if (
      shouldAutoSummarize &&
      newLink.url &&
      openaiApiKey &&
      autoSummarizeEnabled &&
      !isGeneratingSummary
    ) {
      const timer = setTimeout(() => {
        summarizeLink();
      }, 1000); // Wait 1 second after URL is entered
      return () => clearTimeout(timer);
    }
  }, [
    shouldAutoSummarize,
    newLink.url,
    openaiApiKey,
    autoSummarizeEnabled,
    isGeneratingSummary,
  ]);

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
        closeAddForm();
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
          className={`mb-8 transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <Link
                href="/"
                className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-title text-neutral-900">Collect Links</h1>
                  {links.length > 0 && (
                    <div className="px-2 py-1 bg-neutral-100 rounded-full text-xs font-medium text-neutral-600 flex-shrink-0">
                      {links.length} saved
                    </div>
                  )}
                </div>
                <p className="text-body text-neutral-600">
                  Save AI tools, models, and articles you discover
                </p>
              </div>
            </div>

            {/* Desktop: Show button, Mobile: Hidden (use FAB instead) */}
            {isConfigured && (
              <button
                onClick={openAddForm}
                className="hidden sm:flex btn btn-primary group hover:scale-105 transition-all duration-200 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                Add Link
              </button>
            )}
          </div>
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
                        onClick={openAddForm}
                        className="btn btn-primary btn-lg group hover:scale-105 transition-all duration-200 cursor-pointer"
                      >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Add Your First Link
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 w-8"></th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 min-w-[200px]">
                              Title
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 hidden md:table-cell min-w-[200px]">
                              Description
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 hidden lg:table-cell min-w-[100px]">
                              Category
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 hidden lg:table-cell min-w-[100px]">
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
                        When you archive used links, they&apos;ll appear here
                        for reference.
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
                            <table className="w-full min-w-[600px]">
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

        {/* Add Link Modal - Mobile-Optimized */}
        {showAddForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeAddForm();
              }
            }}
          >
            {/* Mobile: Full-screen bottom sheet, Desktop: Centered modal */}
            <div
              className="bg-white w-full sm:max-w-lg sm:w-full sm:rounded-xl shadow-lg h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed height for mobile */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 bg-white flex-shrink-0">
                <h2 className="text-lg sm:text-title font-semibold text-neutral-900">
                  Add Link
                </h2>
                <button
                  onClick={closeAddForm}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Close"
                >
                  <ArrowLeft className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6 space-y-6">
                  {/* URL Input - Primary focus */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Paste your link here
                    </label>
                    <input
                      type="url"
                      value={newLink.url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newLink.url && !isSaving) {
                          e.preventDefault();
                          saveLink();
                        }
                      }}
                      className="w-full px-4 py-4 text-base border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                      placeholder="https://..."
                      autoFocus
                      required
                    />
                  </div>

                  {/* Quick Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      What type of link is this?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "tool", label: "🛠️ AI Tool", icon: Zap },
                        {
                          value: "model",
                          label: "🤖 AI Model",
                          icon: Sparkles,
                        },
                        {
                          value: "article",
                          label: "📚 Article",
                          icon: LinkIcon,
                        },
                        { value: "other", label: "💡 Other", icon: Plus },
                      ].map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() =>
                            setNewLink({
                              ...newLink,
                              category: category.value as SavedLink["category"],
                            })
                          }
                          className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer touch-manipulation ${
                            newLink.category === category.value
                              ? "border-neutral-900 bg-neutral-50 text-neutral-900"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                          }`}
                        >
                          <div className="text-sm font-medium">
                            {category.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Fields - Better mobile spacing */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Title (optional)
                      </label>
                      <input
                        type="text"
                        value={newLink.title}
                        onChange={(e) =>
                          setNewLink({ ...newLink, title: e.target.value })
                        }
                        className="w-full px-4 py-4 text-base border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                        placeholder="AI will suggest a title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Description (optional)
                      </label>
                      <textarea
                        value={newLink.description}
                        onChange={(e) =>
                          setNewLink({
                            ...newLink,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-4 text-base border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="AI will create a summary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions - Fixed bottom with safe area */}
              <div className="p-4 sm:p-6 border-t border-neutral-200 bg-white flex-shrink-0 pb-safe">
                <div className="space-y-3">
                  {/* AI Summarize button - Full width on mobile */}
                  {openaiApiKey && newLink.url && (
                    <button
                      onClick={summarizeLink}
                      disabled={isGeneratingSummary}
                      className="w-full py-4 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors text-base font-medium cursor-pointer disabled:opacity-50 touch-manipulation"
                    >
                      {isGeneratingSummary ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full inline mr-2" />
                          Getting title & summary...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 inline mr-2" />✨
                          Auto-fill with AI
                        </>
                      )}
                    </button>
                  )}

                  {/* Primary action - Larger on mobile */}
                  <button
                    onClick={saveLink}
                    disabled={isSaving || !newLink.url}
                    className="w-full py-4 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors text-base font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-5 h-5 inline mr-2" />
                        Save Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile Only - Enhanced */}
      {isConfigured && (
        <button
          onClick={openAddForm}
          className="fixed bottom-6 right-6 sm:hidden w-16 h-16 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 cursor-pointer touch-manipulation"
          aria-label="Add new link"
        >
          <Plus className="w-7 h-7" />
        </button>
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

export default function LinksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LinksPageContent />
    </Suspense>
  );
}
