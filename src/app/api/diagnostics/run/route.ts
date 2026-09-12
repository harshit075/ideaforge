import { NextRequest, NextResponse } from "next/server";
import {
  probeAuthValidKey,
  probeAuthInvalidKey,
  probeLanguageCoverage,
  probeAutoVsPinnedLanguage,
  probeLlmRewriteSuccess,
  probeLlmRewriteFailure,
  probeMalformedConfig,
  probeSilentAudio,
  probeLatencyBaseline,
  ProbeResult,
} from "@/lib/assemblyai-probes";
import {
  probeGeminiAuth,
  probeGeminiJsonReliability,
  probeGeminiModelAliases,
  probeGeminiMultilingualInstruction,
} from "@/lib/gemini-probes";
import { setLatestDiagnosticsRun, getLatestDiagnosticsRun } from "@/lib/diagnostics-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { filterCategory, probeId } = body;

    const assemblyKey =
      req.headers.get("x-assemblyai-key") ||
      process.env.ASSEMBLYAI_API_KEY ||
      "";

    const geminiKey =
      req.headers.get("x-gemini-key") ||
      process.env.GEMINI_API_KEY ||
      "";

    const probesToRun: (() => Promise<ProbeResult>)[] = [];

    // AssemblyAI probe battery
    if (!filterCategory || filterCategory === "AssemblyAI") {
      if (!probeId || probeId === "aai-auth-valid") probesToRun.push(() => probeAuthValidKey(assemblyKey));
      if (!probeId || probeId === "aai-auth-invalid") probesToRun.push(() => probeAuthInvalidKey());
      if (!probeId || probeId === "aai-lang-coverage") probesToRun.push(() => probeLanguageCoverage(assemblyKey));
      if (!probeId || probeId === "aai-auto-vs-pinned") probesToRun.push(() => probeAutoVsPinnedLanguage(assemblyKey));
      if (!probeId || probeId === "aai-llm-rewrite-success") probesToRun.push(() => probeLlmRewriteSuccess(assemblyKey));
      if (!probeId || probeId === "aai-llm-rewrite-fallback") probesToRun.push(() => probeLlmRewriteFailure(assemblyKey));
      if (!probeId || probeId === "aai-malformed-config") probesToRun.push(() => probeMalformedConfig(assemblyKey));
      if (!probeId || probeId === "aai-silent-audio") probesToRun.push(() => probeSilentAudio(assemblyKey));
      if (!probeId || probeId === "aai-latency-baseline") probesToRun.push(() => probeLatencyBaseline(assemblyKey));
    }

    // Gemini probe battery
    if (!filterCategory || filterCategory === "Gemini") {
      if (!probeId || probeId === "gemini-auth-invalid") probesToRun.push(() => probeGeminiAuth(geminiKey));
      if (!probeId || probeId === "gemini-json-reliability") probesToRun.push(() => probeGeminiJsonReliability(geminiKey));
      if (!probeId || probeId === "gemini-model-aliases") probesToRun.push(() => probeGeminiModelAliases(geminiKey));
      if (!probeId || probeId === "gemini-multilingual-instruction") probesToRun.push(() => probeGeminiMultilingualInstruction(geminiKey));
    }

    // Execute selected probes
    const results: ProbeResult[] = [];
    for (const probeFn of probesToRun) {
      try {
        const res = await probeFn();
        results.push(res);
      } catch (err: any) {
        results.push({
          id: "unknown-error",
          name: "Probe Execution Error",
          category: "AssemblyAI",
          status: "error",
          latencyMs: 0,
          expectedBehavior: "Clean probe completion",
          actualBehavior: err.message,
          requestSnippet: { method: "UNKNOWN", url: "", headers: {} },
          responseSnippet: { status: 0, statusText: "ERROR", body: { error: err.message } },
          findingSummary: err.message,
        });
      }
    }

    const passCount = results.filter(p => p.status === "pass").length;
    const anomalyCount = results.filter(p => p.status === "anomaly").length;
    const errorCount = results.filter(p => p.status === "error").length;

    const latestProbeRun = {
      timestamp: new Date().toISOString(),
      totalProbes: results.length,
      passCount,
      anomalyCount,
      errorCount,
      probes: results,
    };
    setLatestDiagnosticsRun(latestProbeRun);

    return NextResponse.json({
      success: true,
      timestamp: latestProbeRun.timestamp,
      summary: {
        total: results.length,
        pass: passCount,
        anomaly: anomalyCount,
        error: errorCount,
      },
      probes: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute diagnostics suite", type: "server_error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const latest = getLatestDiagnosticsRun();
  if (!latest) {
    return NextResponse.json({ message: "No diagnostics run has occurred yet. Click 'Run Diagnostics' to test APIs." });
  }
  return NextResponse.json(latest);
}
