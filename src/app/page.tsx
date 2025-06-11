"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Wand2, Send, ArrowRight, Settings } from "lucide-react";

export default function HomePage() {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if basic configuration exists
    const githubToken = localStorage.getItem("github_token") || "";
    const githubOwner = localStorage.getItem("github_owner") || "";
    const githubRepo = localStorage.getItem("github_repo") || "";

    setIsConfigured(githubToken && githubOwner && githubRepo ? true : false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Setup Call-to-Action */}
      {!isConfigured && (
        <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
          <div className="text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-900 mb-2">
              Welcome to Newsletter Builder!
            </h2>
            <p className="text-blue-800 mb-6">
              Get started by configuring your GitHub repository and API keys.
              Everything is stored locally and securely.
            </p>
            <Link href="/settings" className="btn-primary">
              <Settings className="h-4 w-4 mr-2" />
              Configure Settings
            </Link>
          </div>
        </div>
      )}

      {/* Workflow Overview */}
      <div className={!isConfigured ? "border-t pt-8" : ""}>
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
                !isConfigured ? "opacity-50 cursor-not-allowed" : ""
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
                !isConfigured ? "opacity-50 cursor-not-allowed" : ""
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
                !isConfigured ? "opacity-50 cursor-not-allowed" : ""
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
      {!isConfigured && (
        <div className="border-t pt-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              quick setup guide
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="font-medium">1.</span>
                <span>Create a GitHub repository to store your data</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">2.</span>
                <span>
                  Generate a GitHub Personal Access Token with 'repo'
                  permissions
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">3.</span>
                <span>
                  Get an OpenAI API key for AI summarization and newsletter
                  generation
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">4.</span>
                <span>
                  (Optional) Add Kit.com API key for direct publishing
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/settings"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                → Configure everything in Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {isConfigured && (
        <div className="border-t pt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-green-900 mb-2">
              🎉 You're all set!
            </h3>
            <p className="text-green-800 mb-4">
              Your newsletter builder is configured and ready to use. Start by
              saving some links!
            </p>
            <div className="flex justify-center space-x-3">
              <Link href="/links" className="btn-primary">
                Save Your First Link
              </Link>
              <Link href="/settings" className="btn-secondary">
                <Settings className="h-4 w-4 mr-2" />
                Manage Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
