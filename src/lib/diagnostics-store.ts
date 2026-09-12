import { ProbeResult } from "./assemblyai-probes";

export interface DiagnosticsRun {
  timestamp: string;
  totalProbes: number;
  passCount: number;
  anomalyCount: number;
  errorCount: number;
  probes: ProbeResult[];
}

const globalForDiagnostics = globalThis as unknown as {
  __latestDiagnosticsRun: DiagnosticsRun | null;
};

if (!globalForDiagnostics.__latestDiagnosticsRun) {
  globalForDiagnostics.__latestDiagnosticsRun = null;
}

export function setLatestDiagnosticsRun(run: DiagnosticsRun) {
  globalForDiagnostics.__latestDiagnosticsRun = run;
}

export function getLatestDiagnosticsRun(): DiagnosticsRun | null {
  return globalForDiagnostics.__latestDiagnosticsRun;
}
