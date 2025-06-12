"use client";

import Link from "next/link";
import {
  BookmarkPlus,
  Wand2,
  FileText,
  ArrowRight,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [isConfigured, setIsConfigured] = useState(true);
  const [showConfigBanner, setShowConfigBanner] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if basic configuration is complete
    const githubToken = localStorage.getItem("github_token") || "";
    const githubOwner = localStorage.getItem("github_owner") || "";
    const githubRepo = localStorage.getItem("github_repo") || "";
    const openaiToken = localStorage.getItem("openai_api_key") || "";

    const isGithubConfigured = !!(githubToken && githubOwner && githubRepo);
    const isOpenaiConfigured = !!openaiToken;
    const configured = isGithubConfigured && isOpenaiConfigured;

    setIsConfigured(configured);
    setShowConfigBanner(!configured);

    // Trigger entrance animation
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container py-8 sm:py-12">
        {/* Configuration Banner - Only show if not configured */}
        <div
          className={`transition-all duration-500 ease-out ${
            showConfigBanner
              ? "opacity-100 translate-y-0 mb-6 sm:mb-8"
              : "opacity-0 -translate-y-4 mb-0 h-0 overflow-hidden"
          }`}
        >
          <div className="card card-padding bg-amber-50 border-amber-200 border-l-4 border-l-amber-400">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-heading text-amber-900 mb-1">
                    Quick setup required
                  </p>
                  <p className="text-body text-amber-800">
                    Configure your API keys to start building newsletters
                  </p>
                </div>
              </div>
              <Link
                href="/settings"
                className="btn btn-primary btn-sm hover:scale-105 transition-transform duration-200 self-start sm:self-auto"
              >
                <Settings className="w-4 h-4" />
                Setup
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section - Focused and minimal with entrance animation */}
        <div
          className={`max-w-4xl mx-auto text-center mb-12 sm:mb-16 transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-900 mb-4 leading-tight">
              Build your newsletter in minutes
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto">
              Collect interesting links, add your thoughts, and let AI craft
              them into engaging newsletters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isConfigured ? (
              <Link
                href="/links"
                className="btn btn-primary btn-lg group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                Start with your first link
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            ) : (
              <Link
                href="/settings"
                className="btn btn-primary btn-lg group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Get started
              </Link>
            )}
          </div>

          {isConfigured && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Ready to go • All set up</span>
            </div>
          )}
        </div>

        {/* Main Flow - Story-driven, minimal cards with staggered animation */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
            {/* Step 1: Collect Links */}
            <div
              className={`transition-all duration-700 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <Link
                href={isConfigured ? "/links" : "/settings"}
                className="block card card-padding group hover:border-neutral-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
              >
                <div className="flex items-start gap-4 h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 group-hover:from-neutral-200 group-hover:to-neutral-300 flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                    <BookmarkPlus className="w-6 h-6 text-neutral-700 group-hover:text-neutral-900 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        Collect links
                      </h3>
                    </div>
                    <p className="text-body mb-4 leading-relaxed flex-1">
                      Save AI tools, models, and articles you discover
                      throughout the week. Each link gets automatically
                      summarized.
                    </p>
                    <div className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors flex items-center gap-2">
                      Start collecting
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Step 2: Generate Newsletter */}
            <div
              className={`transition-all duration-700 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <Link
                href={isConfigured ? "/builder" : "/settings"}
                className="block card card-padding group hover:border-neutral-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
              >
                <div className="flex items-start gap-4 h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 group-hover:from-neutral-200 group-hover:to-neutral-300 flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                    <Wand2 className="w-6 h-6 text-neutral-700 group-hover:text-neutral-900 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        Generate newsletter
                      </h3>
                    </div>
                    <p className="text-body mb-4 leading-relaxed flex-1">
                      Review your saved content, add your thoughts, and generate
                      a newsletter ready for export.
                    </p>
                    <div className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors flex items-center gap-2">
                      Create newsletter
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Secondary Feature - De-emphasized with delayed animation */}
          {isConfigured && (
            <div
              className={`text-center transition-all duration-700 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-all duration-300 hover:scale-105">
                <FileText className="w-4 h-4 text-neutral-600" />
              </div>
            </div>
          )}
        </div>

        {/* Subtle Process Indicator - Only show if configured */}
        {isConfigured && (
          <div
            className={`max-w-2xl mx-auto mt-12 sm:mt-16 text-center transition-all duration-1000 ease-out ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-neutral-400 to-neutral-500 animate-pulse"></div>
              <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-neutral-300 to-neutral-400"></div>
              <div
                className="w-2 h-2 rounded-full bg-gradient-to-r from-neutral-400 to-neutral-500 animate-pulse"
                style={{ animationDelay: "500ms" }}
              ></div>
              <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-neutral-300 to-neutral-400"></div>
              <div
                className="w-2 h-2 rounded-full bg-gradient-to-r from-neutral-400 to-neutral-500 animate-pulse"
                style={{ animationDelay: "1000ms" }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
