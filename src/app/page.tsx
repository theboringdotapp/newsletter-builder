"use client";

import Link from "next/link";
import { Plus, FileText, Send } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Newsletter Builder
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered newsletter creation for theboring.app. Save interesting
          links throughout the week, add your thoughts, and let AI help you
          craft the perfect newsletter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/links"
          className="card hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center mb-4">
            <Plus className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-xl font-semibold">Save Links</h3>
          </div>
          <p className="text-gray-600">
            Quickly save interesting AI tools, models, and articles you discover
            throughout the week.
          </p>
        </Link>

        <Link
          href="/builder"
          className="card hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-xl font-semibold">Build Newsletter</h3>
          </div>
          <p className="text-gray-600">
            Review your saved content, add thoughts, and generate a newsletter
            with AI assistance.
          </p>
        </Link>

        <Link
          href="/export"
          className="card hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center mb-4">
            <Send className="h-8 w-8 text-primary-600 mr-3" />
            <h3 className="text-xl font-semibold">Export & Send</h3>
          </div>
          <p className="text-gray-600">
            Export to Kit.com or download the newsletter content for manual
            import.
          </p>
        </Link>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Getting Started
        </h3>
        <ol className="text-blue-800 space-y-1">
          <li>1. Save interesting links throughout the week</li>
          <li>2. When ready to build, go to the Newsletter Builder</li>
          <li>3. Select which links to include and add your thoughts</li>
          <li>4. Generate the newsletter with AI</li>
          <li>5. Export to Kit.com or download for manual import</li>
        </ol>
      </div>
    </div>
  );
}
