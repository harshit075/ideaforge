import { NextRequest, NextResponse } from "next/server";
import { getLatestDiagnosticsRun } from "@/lib/diagnostics-store";

export async function GET(req: NextRequest) {
  try {
    const latest = getLatestDiagnosticsRun();

    if (!latest || latest.probes.length === 0) {
      return NextResponse.json({
        formattedText: "No diagnostics run has been recorded yet. Please run the diagnostics suite first.",
        anomalies: [],
      });
    }

    const anomalies = latest.probes.filter((p) => p.status === "anomaly");

    if (anomalies.length === 0) {
      return NextResponse.json({
        formattedText: "All probes completed with status PASS. No anomalies or doc mismatches detected in the latest run.",
        anomalies: [],
      });
    }

    // Format into hackathon submission form entries
    const formattedBlocks = anomalies.map((anomaly, index) => {
      const submissionType = anomaly.isDocMismatch
        ? "Bug Report / Documentation Discrepancy"
        : "API Feedback & Performance Telemetry";

      return `================================================================================
HACKATHON SUBMISSION ENTRY #${index + 1}
================================================================================
What are you submitting:
${submissionType}

Probe Name:
${anomaly.name}

API Category:
${anomaly.category}

Summary / Problem Description:
${anomaly.findingSummary || anomaly.actualBehavior}

Expected Behavior (per official docs):
${anomaly.expectedBehavior}

Actual Behavior Observed (live API):
${anomaly.actualBehavior}

Latency Recorded:
${anomaly.latencyMs}ms

Reproduction Steps:
${
  anomaly.reproductionSteps ||
  `Submit request to ${anomaly.requestSnippet.url} with method ${anomaly.requestSnippet.method}.
Request snippet:
${JSON.stringify(anomaly.requestSnippet, null, 2)}`
}

Raw Response Observed:
${JSON.stringify(anomaly.responseSnippet, null, 2)}
`;
    });

    const fullExportText = `================================================================================
IDEAFORGE V2 — LIVE API DIAGNOSTICS & BUG REPORT EXPORT
Generated: ${new Date().toISOString()}
Total Probes Evaluated: ${latest.totalProbes}
Anomalies / Mismatches Detected: ${anomalies.length}
================================================================================

${formattedBlocks.join("\n\n")}`;

    return NextResponse.json({
      formattedText: fullExportText,
      anomalyCount: anomalies.length,
      anomalies,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to export diagnostics", type: "server_error" },
      { status: 500 }
    );
  }
}
