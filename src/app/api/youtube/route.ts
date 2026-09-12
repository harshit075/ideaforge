import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { ALL_19_LANGUAGES } from "@/lib/languages";

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function POST(req: NextRequest) {
  try {
    const { url, targetLanguage = "en", translateAll = false } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No YouTube URL provided.", type: "bad_request" }, { status: 400 });
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please provide a standard watch, share, or shorts link.", type: "invalid_url" },
        { status: 400 }
      );
    }

    // 1. Fetch metadata via YouTube oEmbed
    let videoTitle = "YouTube Video";
    let authorName = "YouTube Creator";
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        videoTitle = oembed.title || videoTitle;
        authorName = oembed.author_name || authorName;
        thumbnailUrl = oembed.thumbnail_url || thumbnailUrl;
      }
    } catch {}

    // 2. Fetch transcript via YoutubeTranscript
    let transcriptLines: { start: number; duration: number; text: string }[] = [];
    try {
      const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptLines = rawTranscript.map((t: any) => ({
        start: Math.round(t.offset / 1000),
        duration: Math.round(t.duration / 1000),
        text: t.text
          .replace(/&amp;#39;/g, "'")
          .replace(/&amp;quot;/g, '"')
          .replace(/&amp;/g, "&"),
      }));
    } catch (transcriptError: any) {
      return NextResponse.json(
        {
          error: `Could not retrieve transcripts for this video: ${transcriptError.message}. Make sure the video is public and has closed captions or auto-generated subtitles enabled.`,
          type: "transcript_unavailable",
          videoId,
          videoTitle,
          thumbnailUrl,
        },
        { status: 404 }
      );
    }

    const fullOriginalText = transcriptLines.map((l) => l.text).join(" ");

    // 3. Multilingual Translation using Gemini (or built-in synthesizer)
    const geminiKey =
      req.headers.get("x-gemini-key") ||
      process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API;

    // Determine target languages to translate
    const targetCodes = translateAll
      ? ALL_19_LANGUAGES.map((l) => l.code)
      : Array.from(new Set(["en", targetLanguage]));

    const translations: Record<string, string> = {
      en: fullOriginalText,
    };

    if (geminiKey && targetCodes.length > 0) {
      try {
        const translatedMap = await translateWithGemini(geminiKey, fullOriginalText, targetCodes);
        Object.assign(translations, translatedMap);
      } catch (geminiErr: any) {
        console.warn("Gemini translation fallback:", geminiErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      videoId,
      videoTitle,
      authorName,
      thumbnailUrl,
      lineCount: transcriptLines.length,
      lines: transcriptLines,
      originalText: fullOriginalText,
      translations,
      availableLanguages: ALL_19_LANGUAGES,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process YouTube video", type: "server_error" }, { status: 500 });
  }
}

async function translateWithGemini(
  apiKey: string,
  text: string,
  targetCodes: string[]
): Promise<Record<string, string>> {
  // Truncate text if very long for translation prompt
  const sample = text.slice(0, 4000);
  const languagesList = targetCodes.map((code) => {
    const lang = ALL_19_LANGUAGES.find((l) => l.code === code);
    return `${code} (${lang?.name || code})`;
  });

  const prompt = `You are an elite multilingual translator and transcriber.
Below is an excerpt of a spoken transcript from a YouTube video:

"${sample}"

TASK:
Translate and format this transcript cleanly into each of the following target language codes:
${languagesList.join(", ")}

Return ONLY a valid JSON object where keys are the language codes (e.g. "en", "hi", "es", "fr", etc.) and values are the fluent, complete translated transcripts in that language.`;

  const model = "gemini-flash-lite-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini translation HTTP ${res.status}`);
  }

  const json = await res.json();
  const rawJson = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) return {};

  return JSON.parse(rawJson);
}
