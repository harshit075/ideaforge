import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IdeaForge v2 — Multilingual Voice-to-Spec & API Diagnostics",
  description:
    "Transform multilingual & code-switched voice ideas into production build specs, architecture diagrams, and ready-to-paste coding agent prompts. Features built-in API diagnostics for AssemblyAI Dictation and Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen text-slate-100 selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
