"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";

interface TokenManagerProps {
  onTokensChange: (tokens: {
    github: string;
    openai: string;
    kit: string;
    githubOwner: string;
    githubRepo: string;
    githubBranch: string;
  }) => void;
}

export default function TokenManager({ onTokensChange }: TokenManagerProps) {
  const [tokens, setTokens] = useState({
    github: "",
    openai: "",
    kit: "",
    githubOwner: "",
    githubRepo: "",
    githubBranch: "main",
  });
  const [showTokens, setShowTokens] = useState({
    github: false,
    openai: false,
    kit: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load tokens from localStorage on component mount
    const savedTokens = {
      github: localStorage.getItem("github_token") || "",
      openai: localStorage.getItem("openai_token") || "",
      kit: localStorage.getItem("kit_token") || "",
      githubOwner: localStorage.getItem("github_owner") || "",
      githubRepo: localStorage.getItem("github_repo") || "",
      githubBranch: localStorage.getItem("github_branch") || "main",
    };
    setTokens(savedTokens);
    setIsLoaded(true);
    onTokensChange(savedTokens);
  }, []); // Empty dependency array - only run on mount

  // Separate effect to handle token changes after initial load
  useEffect(() => {
    if (isLoaded) {
      onTokensChange(tokens);
    }
  }, [tokens, isLoaded, onTokensChange]);

  const updateToken = (type: keyof typeof tokens, value: string) => {
    const newTokens = { ...tokens, [type]: value };
    setTokens(newTokens);

    // Map token types to consistent localStorage keys
    const keyMap: Record<string, string> = {
      github: "github_token",
      openai: "openai_token",
      kit: "kit_token",
      githubOwner: "github_owner",
      githubRepo: "github_repo",
      githubBranch: "github_branch",
    };

    localStorage.setItem(keyMap[type], value);
    onTokensChange(newTokens);
  };

  const clearToken = (type: keyof typeof tokens) => {
    const newTokens = {
      ...tokens,
      [type]: type === "githubBranch" ? "main" : "",
    };
    setTokens(newTokens);

    // Map token types to consistent localStorage keys
    const keyMap: Record<string, string> = {
      github: "github_token",
      openai: "openai_token",
      kit: "kit_token",
      githubOwner: "github_owner",
      githubRepo: "github_repo",
      githubBranch: "github_branch",
    };

    if (type === "githubBranch") {
      localStorage.setItem(keyMap[type], "main");
    } else {
      localStorage.removeItem(keyMap[type]);
    }
    onTokensChange(newTokens);
  };

  const toggleShowToken = (type: "github" | "openai" | "kit") => {
    setShowTokens((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!isLoaded) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;
  }

  const hasRequiredTokens =
    tokens.github && tokens.openai && tokens.githubOwner && tokens.githubRepo;
  const hasAnySetup =
    tokens.github ||
    tokens.openai ||
    tokens.kit ||
    tokens.githubOwner ||
    tokens.githubRepo;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          welcome to theboring.app newsletter builder ☕
        </h2>
        <p className="text-gray-600">
          to get started, you'll need to configure your github repository and
          add your API tokens. everything is stored locally and never sent to
          our servers.
        </p>
      </div>

      {hasRequiredTokens && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              all set! 🎉 you can now use all features of the newsletter
              builder.
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {/* GitHub Repository Configuration */}
        <div className="card">
          <h3 className="font-semibold mb-3">
            GitHub Repository Configuration
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            configure where your links and newsletters will be stored. this will
            create a repository structure for organizing your data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Username *
              </label>
              <input
                type="text"
                value={tokens.githubOwner}
                onChange={(e) => updateToken("githubOwner", e.target.value)}
                placeholder="your-username"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository Name *
              </label>
              <input
                type="text"
                value={tokens.githubRepo}
                onChange={(e) => updateToken("githubRepo", e.target.value)}
                placeholder="newsletter-data"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={tokens.githubBranch}
                onChange={(e) => updateToken("githubBranch", e.target.value)}
                placeholder="main"
                className="input-field"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            repository will be created at: github.com/
            {tokens.githubOwner || "your-username"}/
            {tokens.githubRepo || "newsletter-data"}
          </p>
        </div>

        {/* GitHub Token */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  tokens.github ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <h3 className="font-semibold">GitHub Personal Access Token</h3>
            </div>
            {tokens.github && (
              <button
                onClick={() => clearToken("github")}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                clear
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            for storing your links and newsletters. create a personal access
            token with repo permissions.
          </p>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type={showTokens.github ? "text" : "password"}
                value={tokens.github}
                onChange={(e) => updateToken("github", e.target.value)}
                placeholder="ghp_..."
                className="input-field pr-10"
              />
              <button
                onClick={() => toggleShowToken("github")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showTokens.github ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=theboring.app%20newsletter%20builder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-800 mt-1 inline-block"
          >
            create github token →
          </a>
        </div>

        {/* OpenAI Token */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  tokens.openai ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <h3 className="font-semibold">OpenAI API Key</h3>
            </div>
            {tokens.openai && (
              <button
                onClick={() => clearToken("openai")}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                clear
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            for generating newsletter content with AI. you'll need access to
            GPT-4.
          </p>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type={showTokens.openai ? "text" : "password"}
                value={tokens.openai}
                onChange={(e) => updateToken("openai", e.target.value)}
                placeholder="sk-..."
                className="input-field pr-10"
              />
              <button
                onClick={() => toggleShowToken("openai")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showTokens.openai ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-800 mt-1 inline-block"
          >
            get openai api key →
          </a>
        </div>

        {/* Kit.com Token */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  tokens.kit ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <h3 className="font-semibold">Kit.com API Key</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                optional
              </span>
            </div>
            {tokens.kit && (
              <button
                onClick={() => clearToken("kit")}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                clear
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            for publishing newsletters directly to kit.com. you can skip this
            and export manually.
          </p>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type={showTokens.kit ? "text" : "password"}
                value={tokens.kit}
                onChange={(e) => updateToken("kit", e.target.value)}
                placeholder="your kit.com api key..."
                className="input-field pr-10"
              />
              <button
                onClick={() => toggleShowToken("kit")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showTokens.kit ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <a
            href="https://app.kit.com/account/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-800 mt-1 inline-block"
          >
            find kit.com api key →
          </a>
        </div>
      </div>

      {!hasRequiredTokens && hasAnySetup && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <span className="text-yellow-800 font-medium">almost there!</span>
              <p className="text-yellow-700 text-sm mt-1">
                you need github repository config, github token, and openai
                token to use the full functionality.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
