import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IdeaForge — Voice-First AI Build Studio & Zero-Drift Relay",
  description:
    "Transform multilingual & code-switched voice ideas into production build specs and ready-to-paste coding agent prompts. Powered by AssemblyAI Universal-3.5 Pro and Google Gemini.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAF8F3] text-[#1C1917] selection:bg-orange-100 selection:text-[#E05315]">
        {children}
      </body>
    </html>
  );
}
