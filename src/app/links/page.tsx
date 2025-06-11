"use client";

import { useState, useEffect } from "react";
import { SavedLink } from "@/types";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export default function LinksPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({
    url: "",
    title: "",
    description: "",
    category: "tool" as SavedLink["category"],
  });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const response = await fetch("/api/links");
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Error loading links:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLink = async () => {
    if (!newLink.url) return;

    const link: SavedLink = {
      id: Date.now().toString(),
      url: newLink.url,
      title: newLink.title || undefined,
      description: newLink.description || undefined,
      category: newLink.category,
      savedAt: new Date().toISOString(),
      selected: true,
    };

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(link),
      });

      if (response.ok) {
        setLinks([...links, link]);
        setNewLink({ url: "", title: "", description: "", category: "tool" });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error saving link:", error);
    }
  };

  const deleteLink = async (linkId: string) => {
    const updatedLinks = links.filter((link) => link.id !== linkId);
    setLinks(updatedLinks);

    try {
      await fetch("/api/links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLinks),
      });
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Saved Links</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Link</span>
        </button>
      </div>

      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Add New Link</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
                className="input-field"
                placeholder="https://..."
                required
              />
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
                placeholder="Optional title"
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
                placeholder="Optional description"
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
              <button onClick={saveLink} className="btn-primary">
                Save Link
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
        {links.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No links saved yet. Click &ldquo;Add Link&rdquo; to get started!
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
                    <p className="text-gray-600 text-sm">{link.description}</p>
                  )}
                </div>

                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
