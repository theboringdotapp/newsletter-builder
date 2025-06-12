"use client";

import { useState, useEffect } from "react";
import { SavedLink, Thought } from "@/types";
import {
  Eye,
  Settings,
  ArrowLeft,
  AlertTriangle,
  BookmarkPlus,
  Download,
  Send,
  Copy,
  GripVertical,
  Edit3,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Toast from "@/components/Toast";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ContentEditable from "react-contenteditable";

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

// Sortable Link Item Component - Redesigned
function SortableLinkItem({
  link,
  isSelected,
  onToggle,
}: {
  link: SavedLink;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  const categoryColors = {
    tool: "bg-blue-50 text-blue-700 border-blue-200",
    model: "bg-emerald-50 text-emerald-700 border-emerald-200",
    article: "bg-purple-50 text-purple-700 border-purple-200",
    other: "bg-neutral-50 text-neutral-700 border-neutral-200",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-neutral-900 bg-neutral-50 shadow-sm"
          : "border-neutral-200 hover:border-neutral-300 bg-white"
      } ${isDragging ? "shadow-xl scale-[1.02]" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 transition-colors mt-1 opacity-0 group-hover:opacity-100"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Link Content */}
        <div className="flex-1 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 text-xs rounded-md font-medium border transition-colors ${
                categoryColors[link.category as keyof typeof categoryColors] ||
                categoryColors.other
              }`}
            >
              {link.category}
            </span>
          </div>
          <h4 className="font-medium text-neutral-900 mb-1 line-clamp-2">
            {link.title || "Untitled"}
          </h4>
          <p className="text-sm text-neutral-500 truncate">{link.url}</p>
        </div>

        {/* Selection Indicator */}
        <div className="flex items-center">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? "border-neutral-900 bg-neutral-900"
                : "border-neutral-300 group-hover:border-neutral-400"
            }`}
          >
            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // New states for editable preview
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  // UI state
  const [showAdvancedPrompt, setShowAdvancedPrompt] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Update editable content when generated content changes
  useEffect(() => {
    if (generatedContent && !isEditingPreview) {
      setEditableContent(generatedContent);
    }
  }, [generatedContent, isEditingPreview]);

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
    try {
      setIsLoading(true);
      const response = await fetch("/api/links", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-GitHub-Owner": owner || "",
          "X-GitHub-Repo": repo || "",
          "X-GitHub-Branch": branch || "main",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLinks(data.map((link: SavedLink) => ({ ...link, selected: true })));
      } else {
        addToast("Failed to load links", "error");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      addToast("Error loading data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLinkSelection = (linkId: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, selected: !link.selected } : link
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const togglePreviewEdit = () => {
    if (isEditingPreview) {
      // Save changes
      setGeneratedContent(editableContent);
      addToast("Changes saved", "success");
    }
    setIsEditingPreview(!isEditingPreview);
  };

  const handleContentChange = (evt: React.FormEvent<HTMLDivElement>) => {
    setEditableContent(evt.currentTarget.innerHTML);
  };

  const parseThoughts = (): Thought[] => {
    if (!thoughtsText.trim()) return [];

    return thoughtsText
      .split("\n\n")
      .filter((thought) => thought.trim())
      .map((thought, index) => ({
        id: `thought-${index}`,
        title: `Thought ${index + 1}`,
        type: "insight",
        date: new Date().toISOString(),
        content: thought.trim(),
        selected: true,
      }));
  };

  const generateNewsletter = async () => {
    setIsGenerating(true);
    try {
      const selectedLinks = links.filter((link) => link.selected);
      const thoughts = parseThoughts();

      if (selectedLinks.length === 0 && thoughts.length === 0) {
        addToast("Please select some links or add thoughts first", "error");
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiToken}`,
        },
        body: JSON.stringify({
          links: selectedLinks,
          thoughts,
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate newsletter");
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      addToast("Newsletter generated successfully!", "success");
    } catch (error) {
      console.error("Error generating newsletter:", error);
      addToast(
        error instanceof Error
          ? error.message
          : "Failed to generate newsletter",
        "error"
      );
    } finally {
      setIsGenerating(false);
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
    const contentToExport = isEditingPreview
      ? editableContent
      : generatedContent;
    if (!contentToExport) return;

    const currentWeek = getCurrentWeekString();
    const subject = generateSubject();
    const previewText = generatePreviewText();

    const content = JSON.stringify(
      {
        subject,
        preview_text: previewText,
        content: contentToExport,
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
    const contentToExport = isEditingPreview
      ? editableContent
      : generatedContent;
    if (!contentToExport || !githubToken || !githubOwner || !githubRepo) {
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
          content: contentToExport,
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
    const contentToCopy = isEditingPreview ? editableContent : generatedContent;
    if (!contentToCopy) return;

    try {
      await navigator.clipboard.writeText(contentToCopy);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  const selectedLinksCount = links.filter((link) => link.selected).length;
  const thoughtsCount = parseThoughts().length;
  const hasRequiredTokens =
    githubToken && githubOwner && githubRepo && openaiToken;

  // Step completion logic
  const step1Complete = selectedLinksCount > 0;
  const step2Complete = thoughtsCount > 0 || step1Complete; // Thoughts are optional
  const step3Complete = generatedContent.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 -ml-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-neutral-900">
                  Build Newsletter
                </h1>
                <p className="text-sm text-neutral-600 hidden sm:block">
                  Create your weekly newsletter in minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Check */}
        {!hasRequiredTokens && (
          <div className="mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div className="flex-1 text-center">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">
                    Almost ready!
                  </h3>
                  <p className="text-amber-800 mb-4">
                    Let&apos;s get your GitHub and OpenAI API keys configured so
                    you can start building newsletters.
                  </p>
                  <Link href="/settings" className="btn btn-primary">
                    <Settings className="w-4 h-4" />
                    Complete Setup
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasRequiredTokens && (
          <div className="max-w-7xl mx-auto">
            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column - Input */}
              <div className="lg:col-span-3 space-y-6">
                {/* Step 1: Select Links */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="p-6 border-b border-neutral-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            step1Complete
                              ? "bg-emerald-500 text-white"
                              : "bg-neutral-900 text-white"
                          }`}
                        >
                          {step1Complete ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            "1"
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">
                            Select Links
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {selectedLinksCount} of {links.length} selected
                          </p>
                        </div>
                      </div>
                      {links.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
                          <GripVertical className="w-4 h-4" />
                          Drag to reorder
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      {links.length === 0 ? (
                        <div className="text-center py-12">
                          <BookmarkPlus className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                          <h4 className="text-lg font-medium text-neutral-900 mb-2">
                            No links saved yet
                          </h4>
                          <p className="text-neutral-600 mb-6">
                            Add some links first to start building your
                            newsletter.
                          </p>
                          <Link href="/links" className="btn btn-primary">
                            <BookmarkPlus className="w-4 h-4" />
                            Add Your First Link
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          <SortableContext
                            items={links}
                            strategy={verticalListSortingStrategy}
                          >
                            {links.map((link) => (
                              <SortableLinkItem
                                key={link.id}
                                link={link}
                                isSelected={link.selected}
                                onToggle={() => toggleLinkSelection(link.id)}
                              />
                            ))}
                          </SortableContext>
                        </div>
                      )}
                    </DndContext>
                  </div>
                </div>

                {/* Step 2: Add Thoughts */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="p-6 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          step2Complete && step1Complete
                            ? "bg-emerald-500 text-white"
                            : step1Complete
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-300 text-neutral-500"
                        }`}
                      >
                        {step2Complete && step1Complete ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          "2"
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">
                          Add Your Thoughts
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Optional • {thoughtsCount} thoughts added
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-neutral-600 mb-4">
                      Share your insights, learnings, or observations from this
                      week. Each paragraph becomes a separate thought.
                    </p>

                    <textarea
                      value={thoughtsText}
                      onChange={(e) => setThoughtsText(e.target.value)}
                      className="w-full p-4 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                      rows={6}
                      placeholder="What did you learn this week? Any insights worth sharing?

For example:
AI tools are getting crazy good, but honestly half the battle is just knowing which one to use when.

Spent way too much time this week trying to perfect a prompt when I should have just tried a different model."
                    />
                  </div>
                </div>

                {/* Step 2.5: Advanced AI Instructions (Collapsible) */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  <button
                    onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
                    className="w-full p-6 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-neutral-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">
                            AI Instructions
                          </h3>
                          <p className="text-sm text-neutral-600">
                            Optional • Customize this newsletter&apos;s
                            generation
                          </p>
                        </div>
                      </div>
                      {showAdvancedPrompt ? (
                        <ChevronUp className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {showAdvancedPrompt && (
                    <div className="px-6 pb-6 border-t border-neutral-100">
                      <p className="text-neutral-600 mb-4 mt-4">
                        Give specific instructions for this newsletter&apos;s
                        tone, organization, or focus.
                      </p>
                      <textarea
                        value={additionalInstructions}
                        onChange={(e) =>
                          setAdditionalInstructions(e.target.value)
                        }
                        className="w-full p-4 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                        rows={3}
                        placeholder="e.g., 'Put tools first, then models' or 'Use a more casual tone' or 'Focus on practical benefits for startups'"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Preview & Export */}
              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-6">
                  {/* Step 3: Preview */}
                  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="p-6 border-b border-neutral-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              step3Complete
                                ? "bg-emerald-500 text-white"
                                : step1Complete
                                ? "bg-neutral-900 text-white"
                                : "bg-neutral-300 text-neutral-500"
                            }`}
                          >
                            {step3Complete ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              "3"
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-900">
                              Preview
                            </h3>
                            <p className="text-sm text-neutral-600">
                              Review and edit
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {generatedContent && (
                            <>
                              <button
                                onClick={generateNewsletter}
                                disabled={
                                  isGenerating || selectedLinksCount === 0
                                }
                                className="btn btn-ghost btn-sm"
                              >
                                {isGenerating ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-neutral-600"></div>
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                {isGenerating
                                  ? "Regenerating..."
                                  : "Regenerate"}
                              </button>
                              <button
                                onClick={togglePreviewEdit}
                                className="btn btn-ghost btn-sm"
                              >
                                <Edit3 className="w-4 h-4" />
                                {isEditingPreview ? "Save" : "Edit"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {generatedContent ? (
                        <div className="border border-neutral-200 rounded-lg overflow-hidden">
                          {isEditingPreview ? (
                            <ContentEditable
                              html={editableContent}
                              disabled={false}
                              onChange={handleContentChange}
                              className="p-4 outline-none min-h-[200px] prose prose-sm max-w-none"
                            />
                          ) : (
                            <div
                              className="p-4 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: generatedContent,
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Eye className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
                          <p className="text-neutral-500 text-sm">
                            Your newsletter preview will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Export */}
                  {generatedContent && (
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                      <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                            4
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-900">
                              Export
                            </h3>
                            <p className="text-sm text-neutral-600">
                              Share your newsletter
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <button
                          onClick={exportToKit}
                          disabled={isExporting || !kitToken}
                          className={`btn w-full ${
                            !kitToken
                              ? "btn-secondary opacity-50"
                              : "btn-primary"
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          {isExporting
                            ? "Creating draft..."
                            : !kitToken
                            ? "Kit.com (Setup required)"
                            : "Create Kit.com Draft"}
                        </button>

                        <button
                          onClick={copyToClipboard}
                          className="btn btn-secondary w-full"
                        >
                          <Copy className="w-4 h-4" />
                          Copy to Clipboard
                        </button>

                        <button
                          onClick={exportToJson}
                          className="btn btn-ghost w-full"
                        >
                          <Download className="w-4 h-4" />
                          Download JSON
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Initial Generate Button - only show when no content */}
                  {!generatedContent && (
                    <div className="mt-6">
                      <button
                        onClick={generateNewsletter}
                        disabled={isGenerating || selectedLinksCount === 0}
                        className={`btn w-full py-4 text-lg ${
                          selectedLinksCount === 0
                            ? "btn-secondary opacity-50 cursor-not-allowed"
                            : "btn-primary"
                        }`}
                      >
                        {!isGenerating && <Sparkles className="w-5 h-5" />}
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating newsletter...
                          </>
                        ) : selectedLinksCount === 0 ? (
                          "Select links to generate"
                        ) : (
                          "Generate Newsletter"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Success State */}
            {generatedContent && (
              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800 font-medium">
                    Newsletter ready!
                  </span>
                  <Link
                    href="/newsletters"
                    className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                  >
                    View all newsletters
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Archive Links Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Archive Used Links?
              </h3>
              <p className="text-neutral-600 mb-6">
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

              <p className="text-sm text-neutral-500 mt-4">
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
