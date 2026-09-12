import { NextResponse } from "next/server";

export async function GET() {
  const hasAssemblyAiKey = !!process.env.ASSEMBLYAI_API_KEY && process.env.ASSEMBLYAI_API_KEY.trim() !== "";
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "";

  return NextResponse.json({
    hasAssemblyAiKey,
    hasGeminiKey,
    defaultModel: "gemini-1.5-flash",
    assemblyAiModel: "Universal-3.5 Pro (Dictation)",
  });
}
