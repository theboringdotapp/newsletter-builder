"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, Key, Github, Brain, Mail } from "lucide-react";
import Link from "next/link";

interface SettingsState {
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  openaiApiKey: string;
  kitApiKey: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    githubToken: "",
    githubOwner: "",
    githubRepo: "",
    githubBranch: "main",
    openaiApiKey: "",
    kitApiKey: "",
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
    };
    setSettings(savedSettings);
  }, []);

  const updateSetting = (key: keyof SettingsState, value: string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Auto-save to localStorage
    localStorage.setItem(
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
        : "kit_api_key",
      value
    );

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
  }: {
    title: string;
    description: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
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
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Configure your API keys and preferences
          </p>
        </div>
      </div>

      {/* Auto-save notification */}
      {showSaved && (
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800">
            Settings saved automatically at {lastSaved}
          </span>
        </div>
      )}

      {/* GitHub Configuration */}
      <SettingsSection
        title="GitHub Repository"
        description="Configure where your links and newsletters are stored"
        icon={Github}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Personal Access Token"
            value={settings.githubToken}
            onChange={(value) => updateSetting("githubToken", value)}
            placeholder="ghp_..."
            type="password"
            required
          />
          <InputField
            label="Repository Owner"
            value={settings.githubOwner}
            onChange={(value) => updateSetting("githubOwner", value)}
            placeholder="your-username"
            required
          />
          <InputField
            label="Repository Name"
            value={settings.githubRepo}
            onChange={(value) => updateSetting("githubRepo", value)}
            placeholder="newsletter-data"
            required
          />
          <InputField
            label="Branch"
            value={settings.githubBranch}
            onChange={(value) => updateSetting("githubBranch", value)}
            placeholder="main"
          />
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> Create a GitHub repository and generate
            a Personal Access Token with 'repo' permissions.
          </p>
        </div>
      </SettingsSection>

      {/* OpenAI Configuration */}
      <SettingsSection
        title="OpenAI Integration"
        description="Enable AI-powered link summarization and newsletter generation"
        icon={Brain}
      >
        <InputField
          label="API Key"
          value={settings.openaiApiKey}
          onChange={(value) => updateSetting("openaiApiKey", value)}
          placeholder="sk-..."
          type="password"
        />
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Required for:</strong> AI link summarization, newsletter
            generation
          </p>
        </div>
      </SettingsSection>

      {/* Kit.com Configuration */}
      <SettingsSection
        title="Kit.com Integration"
        description="Optional: Direct newsletter publishing to Kit.com"
        icon={Mail}
      >
        <InputField
          label="API Key"
          value={settings.kitApiKey}
          onChange={(value) => updateSetting("kitApiKey", value)}
          placeholder="Your Kit.com API key"
          type="password"
        />
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Optional:</strong> Enables direct publishing to your Kit.com
            account
          </p>
        </div>
      </SettingsSection>

      {/* Connection Status */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Connection Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                settings.githubToken &&
                settings.githubOwner &&
                settings.githubRepo
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
            <span className="text-sm text-gray-700">
              GitHub Repository{" "}
              {settings.githubToken &&
              settings.githubOwner &&
              settings.githubRepo
                ? "Connected"
                : "Not configured"}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                settings.openaiApiKey ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span className="text-sm text-gray-700">
              OpenAI API{" "}
              {settings.openaiApiKey ? "Connected" : "Not configured"}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                settings.kitApiKey ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span className="text-sm text-gray-700">
              Kit.com {settings.kitApiKey ? "Connected" : "Not configured"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
