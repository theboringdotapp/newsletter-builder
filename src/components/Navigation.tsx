"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                theboring.app Newsletter Builder
              </h1>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/links"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/links"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Links
              </Link>
              <Link
                href="/builder"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/builder"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Builder
              </Link>
              <Link
                href="/export"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/export"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Export
              </Link>
            </nav>
          </div>

          {/* Settings button */}
          <Link
            href="/settings"
            className={`p-2 rounded-lg transition-colors ${
              pathname === "/settings"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
