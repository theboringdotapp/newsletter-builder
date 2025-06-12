import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Newsletter Builder | theboring.app",
  description:
    "Build beautiful, AI-powered newsletters in minutes. Save links, generate content, and export to Kit.com or JSON. Fast, minimal, and open source.",
  openGraph: {
    title: "Newsletter Builder | theboring.app",
    description:
      "Build beautiful, AI-powered newsletters in minutes. Save links, generate content, and export to Kit.com or JSON. Fast, minimal, and open source.",
    url: "https://theboring.app",
    type: "website",
    images: [
      {
        url: "https://theboring.app/og.png",
        width: 1200,
        height: 630,
        alt: "Newsletter Builder | theboring.app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter Builder | theboring.app",
    description:
      "Build beautiful, AI-powered newsletters in minutes. Save links, generate content, and export to Kit.com or JSON. Fast, minimal, and open source.",
    images: ["https://theboring.app/og.png"],
    site: "@theboringapp",
  },
  metadataBase: new URL("https://theboring.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
