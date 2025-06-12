"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  BookmarkPlus,
  Wand2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [hasConfigIssues, setHasConfigIssues] = useState(false);

  useEffect(() => {
    // Check if configuration is incomplete
    const githubToken = localStorage.getItem("github_token") || "";
    const githubOwner = localStorage.getItem("github_owner") || "";
    const githubRepo = localStorage.getItem("github_repo") || "";
    const openaiToken = localStorage.getItem("openai_api_key") || "";

    const isGithubConfigured = githubToken && githubOwner && githubRepo;
    const isOpenaiConfigured = !!openaiToken;

    setHasConfigIssues(!isGithubConfigured || !isOpenaiConfigured);
  }, []);

  const navItems = [
    { href: "/links", label: "Links", icon: BookmarkPlus },
    { href: "/builder", label: "Create", icon: Wand2 },
  ];

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo - Responsive */}
          <Link href="/" className="group flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors hidden sm:block">
                Newsletter Builder
              </span>
              <span className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors sm:hidden">
                NB
              </span>
            </div>
          </Link>

          {/* Navigation - Responsive */}
          <nav className="flex items-center gap-1 flex-1 justify-center min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Settings with warning indicator - Always visible */}
          <div className="relative flex-shrink-0">
            <Link
              href="/settings"
              className={`p-2 rounded-lg transition-colors ${
                pathname === "/settings"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            {hasConfigIssues && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
