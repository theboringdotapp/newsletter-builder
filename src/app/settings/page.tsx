"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Github,
  Brain,
  Mail,
  AlertCircle,
  Check,
} from "lucide-react";
import Link from "next/link";

interface SettingsState {
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  openaiApiKey: string;
  kitApiKey: string;
  autoSummarize: boolean;
  summaryPrompt: string;
  newsletterPrompt: string;
}

// Default prompts (moved outside component to prevent re-renders)
const defaultSummaryPrompt = `You are creating titles and detailed summaries for a "Coding with AI" newsletter.

TITLE REQUIREMENTS:
- Be direct and factual (max 60 characters)
- Don't be creative or clever, just state what it is
- For AI models: use format like "Claude 3.5 Sonnet" or "GPT-4 Turbo"
- For tools: use format like "GitHub Copilot" or "Cursor IDE"
- For articles: be descriptive like "OpenAI's new reasoning model" or "How to fine-tune LLMs"

SUMMARY REQUIREMENTS:
- Start with a brief intro sentence about what it is
- Follow with bullet points (use ◦ symbol) highlighting key features
- Focus on developer-relevant aspects: capabilities, use cases, availability
- Include technical details like model size, pricing, API access when mentioned
- Keep it practical and informative, not marketing-heavy
- Each bullet should be a complete thought

STRUCTURE FORMAT:
Brief intro: What it is and who made it.
◦ Key feature or capability
◦ Technical specifications (if available)
◦ Main use cases for developers
◦ Availability/access information

Example:
Title: "Magistral by Mistral AI"
Summary: "Mistral AI's first reasoning model, designed to excel in domain-specific, transparent, and multilingual reasoning.
◦ Released in two variants: Magistral Small (24B parameter, open-source under Apache 2.0) and Magistral Medium (enterprise version)
◦ Excels in chain-of-thought reasoning across global languages with traceable thought processes
◦ 10x faster token throughput compared to competitors, enabling real-time reasoning
◦ Applications span regulated industries (legal, finance, healthcare) and software development (project planning, architecture)
◦ Magistral Small available via Hugging Face, Medium via Le Chat preview and API"
`;

const defaultNewsletterPrompt = `You are a newsletter writer for theboring.app with a direct, stoic, yet friendly tone.

Structure the newsletter exactly like this:
1. Start with ONE sentence intro - direct and to the point
2. Links section - each link is the title in bold (make it clickable with HTML), then the summary underneath. No extra context.
3. End with ONE sentence asking for feedback

Format requirements:
- Keep intro to max 1 line
- For each link: **<a href="URL">Title</a>** followed by the summary on the next line
- No extra commentary beyond the provided summaries
- Footer must be exactly 1 line asking for feedback
- Tone: Direct, stoic, yet friendly - no fluff

Use clean HTML formatting. Be concise and valuable.`;

// Component for individual settings sections
const SettingsSection = ({
  title,
  description,
  icon: Icon,
  children,
  isRequired = false,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isRequired?: boolean;
}) => (
  <div className="card card-padding">
    <div className="flex items-start gap-4 mb-6">
      <div className="flex-shrink-0 p-2 bg-neutral-100 rounded-lg">
        <Icon className="w-5 h-5 text-neutral-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-heading text-neutral-900">{title}</h3>
          {isRequired && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Required
            </span>
          )}
        </div>
        <p className="text-body">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

// Component for text input fields
const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  helperText?: string;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-neutral-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
      placeholder={placeholder}
    />
    {helperText && (
      <p className="text-caption text-neutral-500">{helperText}</p>
    )}
  </div>
);

// Component for toggle switches
const ToggleField = ({
  label,
  value,
  onChange,
  helperText,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  helperText?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
          value ? "bg-neutral-900" : "bg-neutral-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
    {helperText && (
      <p className="text-caption text-neutral-500">{helperText}</p>
    )}
  </div>
);

export default function SettingsPage() {
  // "Saved" state, loaded once on mount
  const [settings, setSettings] = useState<SettingsState>({
    githubToken: "",
    githubOwner: "",
    githubRepo: "",
    githubBranch: "main",
    openaiApiKey: "",
    kitApiKey: "",
    autoSummarize: false,
    summaryPrompt: defaultSummaryPrompt,
    newsletterPrompt: defaultNewsletterPrompt,
  });

  // "Draft" state for all inputs to provide instant UI feedback
  const [localSettings, setLocalSettings] = useState<SettingsState>({
    githubToken: "",
    githubOwner: "",
    githubRepo: "",
    githubBranch: "main",
    openaiApiKey: "",
    kitApiKey: "",
    autoSummarize: false,
    summaryPrompt: defaultSummaryPrompt,
    newsletterPrompt: defaultNewsletterPrompt,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = {
      githubToken: localStorage.getItem("github_token") || "",
      githubOwner: localStorage.getItem("github_owner") || "",
      githubRepo: localStorage.getItem("github_repo") || "",
      githubBranch: localStorage.getItem("github_branch") || "main",
      openaiApiKey: localStorage.getItem("openai_api_key") || "",
      kitApiKey: localStorage.getItem("kit_api_key") || "",
      autoSummarize: localStorage.getItem("auto_summarize") === "true",
      summaryPrompt:
        localStorage.getItem("summary_prompt") || defaultSummaryPrompt,
      newsletterPrompt:
        localStorage.getItem("newsletter_prompt") || defaultNewsletterPrompt,
    };
    setSettings(savedSettings);
    setLocalSettings(savedSettings);
  }, []);

  // Check for changes between local and saved state
  useEffect(() => {
    const changes = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changes);
  }, [localSettings, settings]);

  const handleSaveAll = () => {
    // Save all local changes to localStorage
    localStorage.setItem("github_token", localSettings.githubToken);
    localStorage.setItem("github_owner", localSettings.githubOwner);
    localStorage.setItem("github_repo", localSettings.githubRepo);
    localStorage.setItem("github_branch", localSettings.githubBranch);
    localStorage.setItem("openai_api_key", localSettings.openaiApiKey);
    localStorage.setItem("kit_api_key", localSettings.kitApiKey);
    localStorage.setItem("auto_summarize", String(localSettings.autoSummarize));
    localStorage.setItem("summary_prompt", localSettings.summaryPrompt);
    localStorage.setItem("newsletter_prompt", localSettings.newsletterPrompt);

    // Update the main 'saved' state
    setSettings(localSettings);
    setHasChanges(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const saveSummaryPrompt = () => {
    const newSettings = {
      ...localSettings,
      summaryPrompt: localSettings.summaryPrompt,
    };
    setLocalSettings(newSettings);
    setSettings(newSettings);
    localStorage.setItem("summary_prompt", localSettings.summaryPrompt);
  };

  const saveNewsletterPrompt = () => {
    const newSettings = {
      ...localSettings,
      newsletterPrompt: localSettings.newsletterPrompt,
    };
    setLocalSettings(newSettings);
    setSettings(newSettings);
    localStorage.setItem("newsletter_prompt", localSettings.newsletterPrompt);
  };

  const resetSummaryPrompt = () => {
    setLocalSettings((prev) => ({
      ...prev,
      summaryPrompt: defaultSummaryPrompt,
    }));
  };

  const resetNewsletterPrompt = () => {
    setLocalSettings((prev) => ({
      ...prev,
      newsletterPrompt: defaultNewsletterPrompt,
    }));
  };

  const isBasicSetupComplete =
    settings.githubToken && settings.githubOwner && settings.githubRepo;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-sm py-8">
        {/* Save bar */}
        {(hasChanges || showSaved) && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 z-50">
            <div
              className={`transition-all duration-300 transform ${
                hasChanges || showSaved
                  ? "translate-y-0 opacity-100"
                  : "translate-y-16 opacity-0"
              }`}
            >
              <div className="p-3 bg-neutral-900 rounded-xl shadow-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {showSaved
                      ? "Settings saved successfully!"
                      : "You have unsaved changes."}
                  </p>
                </div>
                <button
                  onClick={handleSaveAll}
                  disabled={!hasChanges}
                  className="btn btn-primary"
                >
                  {showSaved ? <Check className="w-5 h-5" /> : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-title text-neutral-900">Settings</h1>
            <p className="text-body">Configure your API keys and preferences</p>
          </div>
        </div>

        {/* Setup status */}
        {!isBasicSetupComplete && (
          <div className="mb-8">
            <div className="card card-padding bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-heading text-amber-900 mb-1">
                    Complete your setup
                  </h3>
                  <p className="text-sm text-amber-800">
                    GitHub configuration is required to start using the
                    newsletter builder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* GitHub Configuration */}
          <SettingsSection
            title="GitHub Repository"
            description="Where your links will be stored"
            icon={Github}
            isRequired
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Personal Access Token"
                  value={localSettings.githubToken}
                  onChange={(value) =>
                    setLocalSettings({ ...localSettings, githubToken: value })
                  }
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  type="password"
                  required
                  helperText="Generate a token with 'repo' permissions at github.com/settings/tokens"
                />
              </div>
              <InputField
                label="Repository Owner"
                value={localSettings.githubOwner}
                onChange={(value) =>
                  setLocalSettings({ ...localSettings, githubOwner: value })
                }
                placeholder="your-username"
                required
                helperText="Your GitHub username or organization"
              />
              <InputField
                label="Repository Name"
                value={localSettings.githubRepo}
                onChange={(value) =>
                  setLocalSettings({ ...localSettings, githubRepo: value })
                }
                placeholder="newsletter-data"
                required
                helperText="Repository to store your data"
              />
              <InputField
                label="Branch"
                value={localSettings.githubBranch}
                onChange={(value) =>
                  setLocalSettings({ ...localSettings, githubBranch: value })
                }
                placeholder="main"
                helperText="Usually 'main' or 'master'"
              />
            </div>
          </SettingsSection>

          {/* OpenAI Configuration */}
          <SettingsSection
            title="OpenAI API"
            description="For AI-powered summarization and newsletter generation"
            icon={Brain}
            isRequired
          >
            <div className="space-y-6">
              <InputField
                label="API Key"
                value={localSettings.openaiApiKey}
                onChange={(value) =>
                  setLocalSettings({ ...localSettings, openaiApiKey: value })
                }
                placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                type="password"
                required
                helperText="Get your API key from platform.openai.com/api-keys"
              />

              {localSettings.openaiApiKey && (
                <>
                  <ToggleField
                    label="Auto-summarization"
                    value={localSettings.autoSummarize}
                    onChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        autoSummarize: value,
                      })
                    }
                    helperText="Automatically generate titles and descriptions when adding links (disabled by default)"
                  />

                  <div className="space-y-6 pt-4 border-t border-neutral-200">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-4">
                        AI Prompt Customization
                      </h4>
                      <p className="text-caption text-neutral-500 mb-6">
                        Customize how AI generates summaries and newsletters.
                        Critical system requirements (JSON format, HTML
                        structure) are automatically protected to prevent
                        breaking the system.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700">
                        Link Summarization Prompt
                      </label>
                      <textarea
                        value={localSettings.summaryPrompt}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            summaryPrompt: e.target.value,
                          })
                        }
                        className="input resize-none"
                        rows={10}
                        placeholder="Enter your custom prompt for link summarization..."
                      />
                      <p className="text-caption text-neutral-500 mb-3">
                        This prompt is used when AI generates titles and
                        summaries for your saved links. Note: The JSON response
                        format is automatically protected.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveSummaryPrompt}
                          className="btn btn-primary btn-sm"
                          disabled={
                            localSettings.summaryPrompt ===
                            settings.summaryPrompt
                          }
                        >
                          Save
                        </button>
                        <button
                          onClick={resetSummaryPrompt}
                          className="btn btn-secondary btn-sm"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700">
                        Newsletter Generation Prompt
                      </label>
                      <textarea
                        value={localSettings.newsletterPrompt}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            newsletterPrompt: e.target.value,
                          })
                        }
                        className="input resize-none"
                        rows={8}
                        placeholder="Enter your custom prompt for newsletter generation..."
                      />
                      <p className="text-caption text-neutral-500 mb-3">
                        This prompt sets the tone and style for your newsletter
                        content. Note: HTML link formatting requirements are
                        automatically protected.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveNewsletterPrompt}
                          className="btn btn-primary btn-sm"
                          disabled={
                            localSettings.newsletterPrompt ===
                            settings.newsletterPrompt
                          }
                        >
                          Save
                        </button>
                        <button
                          onClick={resetNewsletterPrompt}
                          className="btn btn-secondary btn-sm"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SettingsSection>

          {/* Kit.com Configuration */}
          <SettingsSection
            title="Kit.com Integration"
            description="Optional: Direct publishing to your Kit.com audience"
            icon={Mail}
          >
            <InputField
              label="API Key"
              value={localSettings.kitApiKey}
              onChange={(value) =>
                setLocalSettings({ ...localSettings, kitApiKey: value })
              }
              placeholder="your-kit-api-key"
              type="password"
              helperText="Find your API key in Kit.com account settings"
            />
          </SettingsSection>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="text-center">
            <p className="text-caption text-neutral-500">
              All settings are stored locally in your browser. Your API keys
              never leave your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
