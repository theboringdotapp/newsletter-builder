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
    { href: "/newsletters", label: "Newsletters", icon: FileText },
  ];

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                Newsletter Builder
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Settings with warning indicator */}
          <div className="relative">
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
