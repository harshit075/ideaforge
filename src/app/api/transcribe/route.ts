import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const assemblyKey =
      req.headers.get("x-assemblyai-key") ||
      process.env.ASSEMBLYAI_API_KEY;

    if (!assemblyKey) {
      return NextResponse.json(
        {
          error: "AssemblyAI API key is missing. Set ASSEMBLYAI_API_KEY in .env.local or in app settings.",
          type: "auth_error",
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const languageCodesRaw = formData.get("language_codes") as string | null;
    const customInstruction = formData.get("llm_instruction") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided in request.", type: "bad_request" },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Build configuration
    const config: Record<string, any> = {
      // Protect technical nouns, programming terms, framework names
      keyterms_prompt: [
        "React", "Next.js", "TypeScript", "Python", "Tailwind",
        "API", "GraphQL", "Supabase", "PostgreSQL", "Prisma",
        "Docker", "AWS", "FastAPI", "Node.js", "MongoDB", "Auth0"
      ],
    };

    if (customInstruction) {
      config.llm_instruction = customInstruction;
    } else {
      config.llm_instruction =
        "Clean up filler words, false starts, and speech hesitations. Preserve technical terms, library names, and architectural ideas exactly as intended.";
    }

    if (languageCodesRaw) {
      try {
        const parsed = JSON.parse(languageCodesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          config.language_codes = parsed;
        }
      } catch {
        if (languageCodesRaw.trim()) {
          config.language_codes = [languageCodesRaw.trim()];
        }
      }
    }
    // Note: If language_codes is omitted, AssemblyAI auto-detects across all 19 supported languages!

    // Build multipart body for AssemblyAI Dictation API
    const boundary = "----IdeaForgeBoundary" + Math.random().toString(36).substring(2);
    const configPart = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="config"\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(config)}\r\n`
    );
    const audioHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="audio"; filename="input.wav"\r\nContent-Type: audio/wav\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const multipartBody = Buffer.concat([configPart, audioHeader, audioBuffer, footer]);

    const start = performance.now();
    const aaiResponse = await fetch("https://dictation.assemblyai.com/v1/transcribe/live", {
      method: "POST",
      headers: {
        Authorization: assemblyKey.trim(),
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    const elapsed = Math.round(performance.now() - start);

    if (!aaiResponse.ok) {
      const errorText = await aaiResponse.text();
      let parsedError: any = {};
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = { raw: errorText };
      }

      // Categorize errors with precision
      if (aaiResponse.status === 401 || aaiResponse.status === 404) {
        return NextResponse.json(
          {
            error: "Authentication failed. Invalid or expired AssemblyAI API key.",
            type: "auth_error",
            status: aaiResponse.status,
            details: parsedError,
          },
          { status: 401 }
        );
      }

      if (aaiResponse.status === 429) {
        return NextResponse.json(
          {
            error: "AssemblyAI rate limit exceeded. Please wait a few seconds before retrying.",
            type: "rate_limit",
            retryAfterSec: 5,
            status: 429,
            details: parsedError,
          },
          { status: 429 }
        );
      }

      if (aaiResponse.status === 415) {
        return NextResponse.json(
          {
            error: "Audio format unsupported. AssemblyAI Dictation requires WAV or 16-bit PCM.",
            type: "unsupported_media",
            status: 415,
            details: parsedError,
          },
          { status: 415 }
        );
      }

      return NextResponse.json(
        {
          error: parsedError.detail || parsedError.error || "AssemblyAI Dictation API error",
          type: "upstream_error",
          status: aaiResponse.status,
          details: parsedError,
        },
        { status: aaiResponse.status }
      );
    }

    const data = await aaiResponse.json();

    const verbatim = data.text || "";
    const cleanText = data.llm_response || verbatim;
    const confidence = typeof data.confidence === "number" ? data.confidence : 1.0;
    const isLowConfidence = confidence < 0.4 && verbatim.length > 0;

    return NextResponse.json({
      success: true,
      text: verbatim,
      llm_response: cleanText,
      confidence,
      isLowConfidence,
      audio_duration_ms: data.audio_duration_ms || 0,
      session_id: data.session_id,
      request_time_ms: data.request_time_ms || elapsed,
      sync_time_ms: data.sync_time_ms,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Internal server error during transcription",
        type: "server_error",
      },
      { status: 500 }
    );
  }
}
