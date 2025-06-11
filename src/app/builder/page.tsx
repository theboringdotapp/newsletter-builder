"use client";

import { useState, useEffect } from "react";
import { SavedLink, Thought } from "@/types";
import { Wand2, Eye, Save } from "lucide-react";

export default function BuilderPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);

  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [thoughtsText, setThoughtsText] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/api/links");
      if (response.ok) {
        const linksData = await response.json();
        setLinks(linksData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
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
    const selectedLinks = links.filter((link) => link.selected);
    const parsedThoughts = parseThoughts();

    if (selectedLinks.length === 0 && parsedThoughts.length === 0) {
      alert(
        "Please select some links or add thoughts to generate a newsletter."
      );
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          links: selectedLinks,
          thoughts: parsedThoughts,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
      } else {
        alert("Failed to generate newsletter. Please try again.");
      }
    } catch (error) {
      console.error("Error generating newsletter:", error);
      alert("Error generating newsletter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveNewsletter = async () => {
    if (!generatedContent) return;

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: generatedContent,
          links: links.filter((link) => link.selected),
          thoughts: parseThoughts(),
        }),
      });

      if (response.ok) {
        alert("Newsletter saved successfully!");
      }
    } catch (error) {
      console.error("Error saving newsletter:", error);
      alert("Failed to save newsletter.");
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  const selectedLinksCount = links.filter((link) => link.selected).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Newsletter Builder</h1>
        <div className="flex space-x-3">
          <button
            onClick={generateNewsletter}
            disabled={isGenerating}
            className="btn-primary flex items-center space-x-2"
          >
            <Wand2 className="h-4 w-4" />
            <span>
              {isGenerating ? "Generating..." : "Generate Newsletter"}
            </span>
          </button>
          {generatedContent && (
            <button
              onClick={saveNewsletter}
              className="btn-secondary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Selection */}
        <div className="space-y-6">
          {/* Links Section */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">
              Select Links ({selectedLinksCount} selected)
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {links.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No links saved yet. Go to the Links page to add some!
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
            <h3 className="text-lg font-semibold mb-4">Add Your Thoughts</h3>
            <textarea
              value={thoughtsText}
              onChange={(e) => setThoughtsText(e.target.value)}
              className="input-field"
              rows={8}
              placeholder="Add your weekly thoughts here. Each paragraph will be treated as a separate insight.

For example:
Building with AI is becoming easier every week. The tools are getting more sophisticated, but the key is knowing which ones to use when.

I discovered that prompt engineering is more art than science. The same prompt can yield completely different results depending on context."
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
            <h3 className="text-lg font-semibold">Newsletter Preview</h3>
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
                Select content and click &ldquo;Generate Newsletter&rdquo; to
                see your newsletter preview here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
