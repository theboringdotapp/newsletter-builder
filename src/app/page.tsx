"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Bookmark, Wand2, Send, ArrowRight } from "lucide-react";
import TokenManager from "@/components/TokenManager";

export default function HomePage() {
  const [tokens, setTokens] = useState({
    github: "",
    openai: "",
    kit: "",
    githubOwner: "",
    githubRepo: "",
    githubBranch: "main",
  });

  const handleTokensChange = useCallback(
    (newTokens: {
      github: string;
      openai: string;
      kit: string;
      githubOwner: string;
      githubRepo: string;
      githubBranch: string;
    }) => {
      setTokens(newTokens);
    },
    []
  );

  const hasRequiredTokens =
    tokens.github && tokens.openai && tokens.githubOwner && tokens.githubRepo;

  return (
    <div className="space-y-8">
      {/* Token Setup */}
      <TokenManager onTokensChange={handleTokensChange} />

      {/* Workflow Overview */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          how it works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Save Links */}
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">1. save links</h4>
            <p className="text-sm text-gray-600 mb-4">
              collect AI tools, models, and articles you discover throughout the
              week
            </p>
            <Link
              href="/links"
              className={`btn-secondary w-full flex items-center justify-center space-x-2 ${
                !hasRequiredTokens ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span>save links</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Step 2: Build Newsletter */}
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Wand2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              2. build newsletter
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              select links, add your thoughts, and let AI generate a friendly
              newsletter
            </p>
            <Link
              href="/builder"
              className={`btn-secondary w-full flex items-center justify-center space-x-2 ${
                !hasRequiredTokens ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span>build newsletter</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Step 3: Export & Send */}
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              3. export & send
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              publish directly to kit.com or export for other email platforms
            </p>
            <Link
              href="/export"
              className={`btn-secondary w-full flex items-center justify-center space-x-2 ${
                !tokens.githubOwner || !tokens.githubRepo || !tokens.github
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <span>export newsletter</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          why you'll love this
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">
                  conversational tone
                </h4>
                <p className="text-sm text-gray-600">
                  AI generates newsletters that feel like chatting with a friend
                  over coffee
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">
                  your own github repo
                </h4>
                <p className="text-sm text-gray-600">
                  data stored in your own repository — completely free and under
                  your control
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">
                  flexible publishing
                </h4>
                <p className="text-sm text-gray-600">
                  direct kit.com integration or export for any email platform
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">
                  completely private
                </h4>
                <p className="text-sm text-gray-600">
                  all configuration stored locally — we never see your tokens or
                  content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      {!hasRequiredTokens && (
        <div className="border-t pt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-4">
              quick setup guide
            </h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start space-x-2">
                <span className="font-medium">1.</span>
                <span>
                  set your github username and choose a repository name for
                  storing data
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">2.</span>
                <span>
                  create a github personal access token with repo permissions
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">3.</span>
                <span>get an openai api key with gpt-4 access</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">4.</span>
                <span>
                  optionally add your kit.com api key for direct publishing
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">5.</span>
                <span>start building your first newsletter! ☕</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
