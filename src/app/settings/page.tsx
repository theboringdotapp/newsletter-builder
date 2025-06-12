"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Github,
  Brain,
  Mail,
  AlertCircle,
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

export default function SettingsPage() {
  // Default prompts
  const defaultSummaryPrompt = `You are creating titles and summaries for a "Coding with AI" newsletter. 

TITLE REQUIREMENTS:
- Be direct and factual (max 60 characters)
- Don't be creative or clever, just state what it is
- For AI models: use format like "Claude 3.5 Sonnet" or "GPT-4 Turbo"
- For tools: use format like "GitHub Copilot" or "Cursor IDE"
- For articles: be descriptive like "OpenAI's new reasoning model" or "How to fine-tune LLMs"

SUMMARY REQUIREMENTS:
- Relate to coding/development with AI (max 150 characters)
- Focus on why developers would care
- Mention specific programming use cases when possible
- Be practical, not marketing-heavy

Examples:
- Title: "Claude 3.5 Sonnet" → Summary: "Anthropic's latest model with improved coding abilities and better reasoning for complex programming tasks"
- Title: "GitHub Copilot Chat" → Summary: "AI pair programmer that helps write code, debug, and explain functions directly in your IDE"
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
  const [lastSaved, setLastSaved] = useState<string>("");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
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
  }, [defaultSummaryPrompt, defaultNewsletterPrompt]);

  const updateSetting = (key: keyof SettingsState, value: string | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Auto-save to localStorage
    const storageKey =
      key === "githubToken"
        ? "github_token"
        : key === "githubOwner"
        ? "github_owner"
        : key === "githubRepo"
        ? "github_repo"
        : key === "githubBranch"
        ? "github_branch"
        : key === "openaiApiKey"
        ? "openai_api_key"
        : key === "autoSummarize"
        ? "auto_summarize"
        : key === "summaryPrompt"
        ? "summary_prompt"
        : key === "newsletterPrompt"
        ? "newsletter_prompt"
        : "kit_api_key";

    localStorage.setItem(storageKey, String(value));

    // Show saved notification
    const now = new Date().toLocaleTimeString();
    setLastSaved(now);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

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

  const TextAreaField = ({
    label,
    value,
    onChange,
    placeholder,
    rows = 8,
    helperText,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    rows?: number;
    helperText?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input resize-none"
        rows={rows}
        placeholder={placeholder}
      />
      {helperText && (
        <p className="text-caption text-neutral-500">{helperText}</p>
      )}
    </div>
  );

  const isBasicSetupComplete =
    settings.githubToken && settings.githubOwner && settings.githubRepo;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-sm py-8">
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

        {/* Auto-save notification */}
        {showSaved && (
          <div className="mb-6">
            <div className="status-success flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Settings saved automatically at {lastSaved}</span>
            </div>
          </div>
        )}

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
            description="Where your links and newsletters will be stored"
            icon={Github}
            isRequired
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Personal Access Token"
                  value={settings.githubToken}
                  onChange={(value) => updateSetting("githubToken", value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  type="password"
                  required
                  helperText="Generate a token with 'repo' permissions at github.com/settings/tokens"
                />
              </div>
              <InputField
                label="Repository Owner"
                value={settings.githubOwner}
                onChange={(value) => updateSetting("githubOwner", value)}
                placeholder="your-username"
                required
                helperText="Your GitHub username or organization"
              />
              <InputField
                label="Repository Name"
                value={settings.githubRepo}
                onChange={(value) => updateSetting("githubRepo", value)}
                placeholder="newsletter-data"
                required
                helperText="Repository to store your data"
              />
              <InputField
                label="Branch"
                value={settings.githubBranch}
                onChange={(value) => updateSetting("githubBranch", value)}
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
                value={settings.openaiApiKey}
                onChange={(value) => updateSetting("openaiApiKey", value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                type="password"
                required
                helperText="Get your API key from platform.openai.com/api-keys"
              />

              {settings.openaiApiKey && (
                <>
                  <ToggleField
                    label="Auto-summarization"
                    value={settings.autoSummarize}
                    onChange={(value) => updateSetting("autoSummarize", value)}
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

                    <TextAreaField
                      label="Link Summarization Prompt"
                      value={settings.summaryPrompt}
                      onChange={(value) =>
                        updateSetting("summaryPrompt", value)
                      }
                      placeholder="Enter your custom prompt for link summarization..."
                      rows={10}
                      helperText="This prompt is used when AI generates titles and summaries for your saved links. Note: The JSON response format is automatically protected."
                    />

                    <TextAreaField
                      label="Newsletter Generation Prompt"
                      value={settings.newsletterPrompt}
                      onChange={(value) =>
                        updateSetting("newsletterPrompt", value)
                      }
                      placeholder="Enter your custom prompt for newsletter generation..."
                      rows={8}
                      helperText="This prompt sets the tone and style for your newsletter content. Note: HTML link formatting requirements are automatically protected."
                    />
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
              value={settings.kitApiKey}
              onChange={(value) => updateSetting("kitApiKey", value)}
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
