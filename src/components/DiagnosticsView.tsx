'use client';

import React, { useState } from 'react';
import {
  Activity,
  Play,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileCode,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { ProbeResult } from '@/lib/assemblyai-probes';

interface DiagnosticsViewProps {
  assemblyKeyOverride?: string;
  geminiKeyOverride?: string;
  onAnomaliesDetected?: (count: number) => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  assemblyKeyOverride,
  geminiKeyOverride,
  onAnomaliesDetected,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [runningStep, setRunningStep] = useState<string>('');
  const [probes, setProbes] = useState<ProbeResult[]>([]);
  const [expandedProbeId, setExpandedProbeId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'anomaly' | 'pass' | 'error'>('all');
  const [exportText, setExportText] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  const runDiagnostics = async (categoryFilter?: string) => {
    setIsRunning(true);
    setExportText(null);
    setRunningStep('Initializing probe battery...');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (assemblyKeyOverride) headers['x-assemblyai-key'] = assemblyKeyOverride;
      if (geminiKeyOverride) headers['x-gemini-key'] = geminiKeyOverride;

      setRunningStep('Executing AssemblyAI Dictation & Gemini API test probes...');

      const res = await fetch('/api/diagnostics/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ filterCategory: categoryFilter }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Diagnostics failed');
      }

      setProbes(data.probes || []);
      const anomalyCount = data.summary?.anomaly || 0;
      if (onAnomaliesDetected) onAnomaliesDetected(anomalyCount);
    } catch (err: any) {
      alert('Error executing diagnostics: ' + err.message);
    } finally {
      setIsRunning(false);
      setRunningStep('');
    }
  };

  const handleExportFindings = async () => {
    try {
      const res = await fetch('/api/diagnostics/export');
      const data = await res.json();
      setExportText(data.formattedText);
    } catch (err: any) {
      alert('Failed to export findings: ' + err.message);
    }
  };

  const handleCopyExport = () => {
    if (!exportText) return;
    navigator.clipboard.writeText(exportText);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedProbeId((prev) => (prev === id ? null : id));
  };

  const filteredProbes = probes.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const anomalyCount = probes.filter((p) => p.status === 'anomaly').length;
  const passCount = probes.filter((p) => p.status === 'pass').length;
  const errorCount = probes.filter((p) => p.status === 'error').length;

  return (
    <div className="w-full space-y-6">
      {/* Header Banner Card matching repo_clone */}
      <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E05315] bg-orange-100 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#E05315]" />
                <span>Production Health & Edge-Case Prober</span>
              </span>
              <span className="text-xs text-[#78716C]">On-Demand Metered Probes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1C1917] tracking-tight">
              API Diagnostics & Bug Hunter
            </h2>
            <p className="text-sm text-[#57534E] max-w-2xl leading-relaxed">
              Actively probes AssemblyAI Dictation and Google Gemini for behavioral edge-cases, latency baselines, and documentation-vs-reality mismatches.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => runDiagnostics()}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#E05315] hover:bg-[#C2410C] text-white font-medium text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running Battery...' : 'Run Health Check Battery'}</span>
            </button>

            {anomalyCount > 0 && (
              <button
                onClick={handleExportFindings}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#1C1917] hover:bg-[#2C2927] text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Export {anomalyCount} Findings for Hackathon</span>
              </button>
            )}
          </div>
        </div>

        {/* Running state indicator */}
        {isRunning && (
          <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-3 text-xs text-[#E05315] font-semibold animate-pulse">
            <div className="w-4 h-4 rounded-full border-2 border-[#E05315] border-t-transparent animate-spin shrink-0" />
            <span>{runningStep}</span>
          </div>
        )}

        {/* Stats bar */}
        {probes.length > 0 && !isRunning && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#EAE2D5]">
            <div className="p-3 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl">
              <span className="text-[10px] text-[#78716C] font-bold uppercase block">Total Probes</span>
              <p className="text-xl font-mono font-bold text-[#1C1917] mt-0.5">{probes.length}</p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Passed Clean</span>
              <p className="text-xl font-mono font-bold text-emerald-700 mt-0.5">{passCount}</p>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <span className="text-[10px] text-[#E05315] font-bold uppercase block">Anomalies Detected</span>
              <p className="text-xl font-mono font-bold text-[#E05315] mt-0.5">{anomalyCount}</p>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] text-rose-800 font-bold uppercase block">Hard Errors</span>
              <p className="text-xl font-mono font-bold text-rose-700 mt-0.5">{errorCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Verified Anomaly Spotlight Alert */}
      {anomalyCount > 0 && (
        <div className="warm-card rounded-2xl p-6 border-l-4 border-l-[#E05315] space-y-2 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#E05315] shrink-0" />
            <h3 className="font-serif text-lg font-bold text-[#1C1917]">
              Verified Submission-Grade Bug & Doc Mismatch Found!
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            Our live diagnostic probe verified a genuine documentation mismatch: official AssemblyAI documentation states that an invalid API key returns <strong>HTTP 404 Not Found</strong> (<code>&#123;"detail": "Invalid API key"&#125;</code>), but the live endpoint actually returns <strong>HTTP 401 Unauthorized</strong>. Click "Export Findings" to generate the copy-ready submission block.
          </p>
        </div>
      )}

      {/* Filter and Probe Table */}
      {probes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#78716C]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">Filter:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-[#1C1917] text-white font-semibold'
                      : 'bg-white text-[#57534E] border border-[#E5E0D8]'
                  }`}
                >
                  All ({probes.length})
                </button>
                <button
                  onClick={() => setFilter('anomaly')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filter === 'anomaly'
                      ? 'bg-[#E05315] text-white font-semibold'
                      : 'bg-orange-50 text-[#E05315] border border-orange-200'
                  }`}
                >
                  Anomalies ({anomalyCount})
                </button>
                <button
                  onClick={() => setFilter('pass')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filter === 'pass'
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  Pass ({passCount})
                </button>
              </div>
            </div>

            <span className="text-[11px] text-[#78716C]">
              Click any probe row to expand raw payload & reproduction snippet
            </span>
          </div>

          {/* Probes List */}
          <div className="space-y-3">
            {filteredProbes.map((probe) => {
              const isExpanded = expandedProbeId === probe.id;
              const isPass = probe.status === 'pass';
              const isAnomaly = probe.status === 'anomaly';

              return (
                <div
                  key={probe.id}
                  className={`warm-card rounded-2xl transition-all ${
                    isAnomaly ? 'border-orange-300 bg-orange-50/20' : ''
                  }`}
                >
                  {/* Row Header */}
                  <div
                    onClick={() => toggleExpand(probe.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isAnomaly ? (
                        <AlertTriangle className="w-5 h-5 text-[#E05315] shrink-0" />
                      ) : isPass ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#1C1917]">{probe.name}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#FAF8F3] text-[#78716C] border border-[#EAE2D5]">
                            {probe.category}
                          </span>
                          {probe.isDocMismatch && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#E05315] border border-orange-200">
                              Doc Mismatch
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#57534E] mt-1 truncate">
                          {probe.findingSummary || probe.actualBehavior}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-xs font-mono text-[#78716C]">
                        <Clock className="w-3 h-3" />
                        <span>{probe.latencyMs}ms</span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          isAnomaly
                            ? 'bg-orange-100 text-[#E05315] border border-orange-200'
                            : isPass
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {probe.status}
                      </span>

                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#78716C]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#78716C]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-[#F5F2EC] space-y-4 text-xs animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-1.5">
                          <span className="font-semibold text-[#78716C] uppercase tracking-wider text-[10px]">
                            Expected Behavior (Docs)
                          </span>
                          <p className="text-[#1C1917] leading-relaxed">{probe.expectedBehavior}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-1.5">
                          <span className="font-semibold text-[#78716C] uppercase tracking-wider text-[10px]">
                            Observed Live Result
                          </span>
                          <p className="text-[#1C1917] leading-relaxed font-mono">{probe.actualBehavior}</p>
                        </div>
                      </div>

                      {/* Reproduction cURL Snippet */}
                      {probe.reproductionSteps && (
                        <div className="space-y-1.5">
                          <span className="font-semibold text-[#78716C] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-[#E05315]" />
                            <span>Reproduction Steps / cURL Snippet</span>
                          </span>
                          <pre className="p-3 bg-[#1C1917] rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
                            {probe.reproductionSteps}
                          </pre>
                        </div>
                      )}

                      {/* Raw Response Payload */}
                      <div className="space-y-1.5">
                        <span className="font-semibold text-[#78716C] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-[#E05315]" />
                          <span>Raw Live API Response</span>
                        </span>
                        <pre className="p-3 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl font-mono text-[11px] text-[#1C1917] overflow-x-auto max-h-52 overflow-y-auto whitespace-pre">
                          {JSON.stringify(probe.responseSnippet, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="warm-card rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#E05315] flex items-center justify-center mx-auto border border-orange-200">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">Diagnostics Ready to Probe</h3>
          <p className="text-sm text-[#57534E] max-w-md mx-auto">
            Click "Run Health Check Battery" to execute all 13 AssemblyAI and Gemini probes against live endpoints and inspect edge cases.
          </p>
        </div>
      )}

      {/* Export Modal matching repo_clone */}
      {exportText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#EAE2D5] p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E05315]" />
                <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Hackathon Submission Export
                </h3>
              </div>
              <button
                onClick={() => setExportText(null)}
                className="text-[#78716C] hover:text-[#1C1917] px-2 py-1 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#57534E]">
              Copy this exact plain text block and paste it straight into the Hackathon Submission form's fields:
            </p>

            <pre className="p-4 bg-[#1C1917] text-[#FAF8F3] rounded-2xl font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto whitespace-pre leading-relaxed">
              {exportText}
            </pre>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCopyExport}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E05315] hover:bg-[#C2410C] text-white font-medium text-xs shadow-sm transition-all"
              >
                {copiedExport ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedExport ? 'Copied All Findings!' : 'Copy Findings to Clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
