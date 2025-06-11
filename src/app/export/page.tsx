"use client";

import { useState, useEffect } from "react";
import { Download, Send, Copy } from "lucide-react";

interface Newsletter {
  week: string;
  content: string;
  subject: string;
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

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    // For now, we'll simulate loading recent newsletters
    // In a real implementation, you'd fetch from your GitHub storage
    setIsLoading(false);

    // Mock data for demonstration
    const mockNewsletters: Newsletter[] = [
      {
        week: "2025-W03",
        content: "<h1>Sample Newsletter</h1><p>This is sample content...</p>",
        subject: "theboring.app Weekly - Week 3, 2025",
      },
    ];
    setNewsletters(mockNewsletters);
  };

  const generateSubject = (week: string) => {
    return `theboring.app Weekly - ${week}`;
  };

  const generatePreviewText = () => {
    return "This week: New AI tools, models, and insights from building with AI";
  };

  const exportToKit = async () => {
    if (!selectedNewsletter) return;

    setIsExporting(true);
    try {
      const response = await fetch("/api/export/kit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject || generateSubject(selectedNewsletter.week),
          content: selectedNewsletter.content,
          previewText: previewText || generatePreviewText(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `Newsletter draft created in Kit.com! Broadcast ID: ${data.broadcast?.id}`
        );
      } else {
        alert(
          "Failed to create Kit.com draft. Please check your API key configuration."
        );
      }
    } catch (error) {
      console.error("Error exporting to Kit:", error);
      alert("Error exporting to Kit.com. Please try again.");
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
  };

  const copyToClipboard = async () => {
    if (!selectedNewsletter) return;

    try {
      await navigator.clipboard.writeText(selectedNewsletter.content);
      alert("Newsletter content copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy to clipboard.");
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Export Newsletter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Newsletter Selection & Configuration */}
        <div className="space-y-6">
          {/* Newsletter Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Select Newsletter</h3>
            {newsletters.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No newsletters found. Generate a newsletter first!
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
                Newsletter Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line
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
                    Preview Text
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
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) =>
                      setExportFormat(e.target.value as "kit" | "json" | "html")
                    }
                    className="input-field"
                  >
                    <option value="kit">Kit.com JSON (Importable)</option>
                    <option value="json">Raw JSON</option>
                    <option value="html">HTML Only</option>
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
                <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                <div className="space-y-3">
                  <button
                    onClick={exportToKit}
                    disabled={isExporting}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      {isExporting
                        ? "Creating Draft..."
                        : "Create Kit.com Draft"}
                    </span>
                  </button>

                  <button
                    onClick={exportToFile}
                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download File</span>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy to Clipboard</span>
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Content Preview</h3>
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

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
        <div className="text-blue-800 space-y-2">
          <p>
            <strong>Kit.com Draft:</strong> Creates a draft directly in your
            Kit.com account. Requires valid API key.
          </p>
          <p>
            <strong>Download File:</strong> Downloads a file you can import
            manually into Kit.com or other email platforms.
          </p>
          <p>
            <strong>Copy to Clipboard:</strong> Copies the HTML content for
            pasting into any email editor.
          </p>
        </div>
      </div>
    </div>
  );
}
