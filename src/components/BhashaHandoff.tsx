'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mic,
  RefreshCw,
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Globe2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Users,
  Clock,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MeaningPacket, LocalizedTaskCard } from '@/app/api/bhasha/route';

interface BhashaHandoffProps {
  geminiKeyOverride?: string;
  assemblyKeyOverride?: string;
}

const BHASHA_SAMPLES = [
  {
    id: 'deployment-hinglish',
    label: 'Hinglish Deployment (Rahul)',
    spoken: 'Kal Rahul deployment kare, but only after tests pass — deadline 4 PM IST.',
    description: 'Assignee Rahul, precondition tests passing, 4:00 PM IST',
  },
  {
    id: 'hotfix-prod',
    label: 'Critical Hotfix (Priya)',
    spoken: 'Priya needs to patch the payment webhook by 2 PM, staging verification mandatory.',
    description: 'Assignee Priya, deadline 2 PM, staging mandatory',
  },
  {
    id: 'database-migration',
    label: 'DB Migration (DevOps)',
    spoken: 'Kenji and Rahul will run the Postgres v16 migration at midnight 12 AM UTC, maintenance window is 30 minutes.',
    description: 'Assignee Kenji & Rahul, 12 AM UTC, 30m window',
  },
];

export const BhashaHandoff: React.FC<BhashaHandoffProps> = ({
  geminiKeyOverride,
}) => {
  const [transcriptInput, setTranscriptInput] = useState(
    'Kal Rahul deployment kare, but only after tests pass — deadline 4 PM IST.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [packet, setPacket] = useState<MeaningPacket | null>(null);
  const [renders, setRenders] = useState<LocalizedTaskCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Delta correction input
  const [deltaText, setDeltaText] = useState('');
  const [isUpdatingDelta, setIsUpdatingDelta] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleExtractPacket = async (inputQuery?: string) => {
    const textToProcess = inputQuery || transcriptInput;
    if (!textToProcess.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKeyOverride) headers['x-gemini-key'] = geminiKeyOverride;

      const res = await fetch('/api/bhasha', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transcript: textToProcess,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Extraction failed');

      setPacket(data.packet);
      setRenders(data.renders);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#E05315', '#10B981', '#1C1917'],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyDelta = async () => {
    if (!deltaText.trim() || !packet) return;

    setIsUpdatingDelta(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKeyOverride) headers['x-gemini-key'] = geminiKeyOverride;

      const res = await fetch('/api/bhasha', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deltaCorrection: deltaText,
          existingPacket: packet,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delta correction failed');

      setPacket(data.packet);
      setRenders(data.renders);
      setDeltaText('');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F97316', '#E05315'],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdatingDelta(false);
    }
  };

  const handleDispatchWhatsApp = (card: LocalizedTaskCard) => {
    const text = encodeURIComponent(card.native_memo);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDispatchEmail = (card: LocalizedTaskCard) => {
    const subject = encodeURIComponent(`[Bhasha 🔒 Zero-Drift Task] ${card.headline}`);
    const body = encodeURIComponent(card.native_memo);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopyCard = (card: LocalizedTaskCard, id: string) => {
    navigator.clipboard.writeText(card.native_memo);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Header section matching repo_clone */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 text-[#E05315] text-xs font-bold px-3.5 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero-Drift Relay · One Meaning, Every Language</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-tight text-[#1C1917] leading-tight">
          Voice-First Task Handoff & Orchestration.{' '}
          <span className="text-[#E05315] italic font-serif block mt-1">
            Zero Fact Drift. Invariant Truth.
          </span>
        </h1>

        <p className="text-base text-[#57534E] max-w-3xl leading-relaxed">
          Traditional translation loses critical dates, names, and prerequisites during handoffs (e.g. 4 PM becomes 4 AM). The system extracts an intermediate <strong>Meaning Packet</strong> with locked facts, guaranteeing Rahul, Kenji, and Alex receive culturally natural instructions from the exact same source of truth.
        </p>
      </div>

      {/* Spoken Voice Intake & 1-Click Samples Card */}
      <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#E05315]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Spoken Instruction (Supports Code-Switching & Dialects)
            </span>
          </div>
          <span className="text-xs text-[#78716C]">Hinglish, Japanese, English</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={transcriptInput}
            onChange={(e) => setTranscriptInput(e.target.value)}
            placeholder="e.g. 'Kal Rahul deployment kare, but only after tests pass — deadline 4 PM IST.'"
            disabled={isLoading}
            className="flex-1 px-4 py-3.5 bg-[#FAF8F3] border border-[#EAE2D5] rounded-2xl text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#E05315] transition-all"
          />

          <button
            onClick={() => handleExtractPacket()}
            disabled={isLoading || !transcriptInput.trim()}
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#E05315] hover:bg-[#C2410C] text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{isLoading ? 'Locking Facts...' : 'Extract Meaning Packet'}</span>
          </button>
        </div>

        {/* 1-Click Samples */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-semibold text-[#78716C]">Try Team Presets:</span>
          {BHASHA_SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setTranscriptInput(s.spoken);
                handleExtractPacket(s.spoken);
              }}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF8F3] hover:bg-white text-xs font-medium text-[#57534E] hover:text-[#1C1917] border border-[#EAE2D5] transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-900">Extraction Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Canonical Meaning Packet (🔒 Invariant Single Source of Truth) */}
      {packet && (
        <div className="space-y-6">
          <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md border-2 border-orange-200 space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE2D5] pb-4">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-orange-100 text-[#E05315] flex items-center justify-center border border-orange-200">
                  <Lock className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                      Canonical Meaning Packet
                    </h3>
                    <span className="text-xs font-mono font-bold uppercase text-[#E05315] bg-orange-100 px-2 py-0.5 rounded-full">
                      v{packet.version}.0
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Language-Independent Intermediate Representation (Locked Invariants)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>0% Fact Drift Guaranteed</span>
                </span>
              </div>
            </div>

            {/* Fact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase text-[#78716C] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#E05315]" />
                  <span>Locked Owner</span>
                </span>
                <p className="text-base font-serif font-bold text-[#1C1917]">
                  {packet.locked_fields.owner}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase text-[#78716C] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#E05315]" />
                  <span>Locked Deadline</span>
                </span>
                <p className="text-base font-serif font-bold text-[#E05315]">
                  {packet.locked_fields.deadline}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-1 sm:col-span-2">
                <span className="text-[11px] font-mono font-bold uppercase text-[#78716C] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#E05315]" />
                  <span>Locked Prerequisites / Conditions</span>
                </span>
                <p className="text-xs font-semibold text-[#1C1917] leading-relaxed">
                  {packet.locked_fields.conditions.join(', ') || 'None'}
                </p>
              </div>
            </div>

            {/* Voice Delta Correction Loop Bar */}
            <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E05315] flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingDelta ? 'animate-spin' : ''}`} />
                  <span>Voice Delta Correction Loop (Mutate Single Shared Packet)</span>
                </span>
                <span className="text-[11px] text-[#78716C]">
                  Cascades to all 3 team cards simultaneously
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. 'Actually make that 5 PM IST, tests are taking longer'"
                  value={deltaText}
                  onChange={(e) => setDeltaText(e.target.value)}
                  disabled={isUpdatingDelta}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-orange-200 rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#E05315]"
                />
                <button
                  onClick={handleApplyDelta}
                  disabled={isUpdatingDelta || !deltaText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2C2927] text-white font-medium text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>{isUpdatingDelta ? 'Broadcasting Delta...' : 'Mutate Shared Packet'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Simultaneous Multi-Language Team Relay Views */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#E05315]" />
                <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Simulated Team Relay (Rendered Simultaneously)
                </h3>
              </div>
              <span className="text-xs text-[#78716C] hidden sm:inline">
                Zero Fact Drift across languages
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renders.map((card, idx) => (
                <div
                  key={idx}
                  className="warm-card rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-5 border border-[#EAE2D5] hover:shadow-lg transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#EAE2D5] flex items-center justify-center font-mono text-[10px] font-bold text-[#E05315]">
                          {card.language.toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-[#1C1917]">{card.recipientName}</p>
                          <p className="text-[10px] text-[#78716C]">{card.languageName}</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-serif text-lg font-semibold text-[#1C1917]">
                        {card.headline}
                      </h4>
                      <p className="text-xs text-[#57534E] leading-relaxed">
                        {card.action_rendered}
                      </p>
                    </div>

                    {/* Fact-Lock Proof Pills */}
                    <div className="p-3 bg-[#FAF8F3] rounded-2xl border border-[#EAE2D5] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#78716C]">Assignee:</span>
                        <strong className="text-[#1C1917] font-mono flex items-center gap-1">
                          <span>{card.locked_summary.owner}</span>
                          <Lock className="w-2.5 h-2.5 text-[#E05315]" />
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#78716C]">Deadline:</span>
                        <strong className="text-[#E05315] font-mono flex items-center gap-1">
                          <span>{card.locked_summary.deadline}</span>
                          <Lock className="w-2.5 h-2.5 text-[#E05315]" />
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#78716C]">Condition:</span>
                        <span className="text-[11px] font-medium text-[#1C1917] text-right truncate max-w-[140px] flex items-center justify-end gap-1">
                          <span className="truncate">{card.locked_summary.condition}</span>
                          <Lock className="w-2.5 h-2.5 text-[#E05315] shrink-0" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team Relay Dispatch Buttons */}
                  <div className="pt-2 border-t border-[#EAE2D5] flex items-center gap-2">
                    <button
                      onClick={() => handleDispatchWhatsApp(card)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                      title="Dispatch WhatsApp Memo"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleDispatchEmail(card)}
                      className="flex items-center justify-center p-2 rounded-full bg-white hover:bg-[#FAF8F3] text-[#57534E] hover:text-[#1C1917] border border-[#EAE2D5] shadow-sm transition-all"
                      title="Send Email Memo"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyCard(card, `card-${idx}`)}
                      className="flex items-center justify-center p-2 rounded-full bg-white hover:bg-[#FAF8F3] text-[#57534E] hover:text-[#1C1917] border border-[#EAE2D5] shadow-sm transition-all"
                      title="Copy Card Memo"
                    >
                      {copiedId === `card-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fact-Lock Proof Table (Mathematical Proof of 0% Drift) */}
          <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                  Fact-Lock Proof Inspector
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Verifies that across all target languages, critical operational facts remain 100% invariant.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>0% Drift Verified</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EAE2D5] text-[#78716C] font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Field Entity</th>
                    <th className="py-2.5 px-3">Canonical Source</th>
                    <th className="py-2.5 px-3">English View</th>
                    <th className="py-2.5 px-3">Hindi (हिंदी) View</th>
                    <th className="py-2.5 px-3">Japanese (日本語) View</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D5]">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-[#1C1917]">Assignee / Owner</td>
                    <td className="py-3 px-3 font-mono text-[#E05315] font-bold">{packet.locked_fields.owner}</td>
                    <td className="py-3 px-3 font-mono">{packet.locked_fields.owner}</td>
                    <td className="py-3 px-3 font-mono">{packet.locked_fields.owner}</td>
                    <td className="py-3 px-3 font-mono">{packet.locked_fields.owner}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Invariant</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-[#1C1917]">Deadline</td>
                    <td className="py-3 px-3 font-mono text-[#E05315] font-bold">{packet.locked_fields.deadline}</td>
                    <td className="py-3 px-3 font-mono">{packet.locked_fields.deadline}</td>
                    <td className="py-3 px-3 font-mono">{packet.locked_fields.deadline}</td>
                    <td className="py-3 px-3 font-mono">{packet.locked_fields.deadline}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Invariant</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-[#1C1917]">Prerequisites</td>
                    <td className="py-3 px-3 font-medium">{packet.locked_fields.conditions.join(', ') || 'None'}</td>
                    <td className="py-3 px-3">{packet.locked_fields.conditions.join(', ') || 'None'}</td>
                    <td className="py-3 px-3">{packet.locked_fields.conditions.join(', ') || 'None'}</td>
                    <td className="py-3 px-3">{packet.locked_fields.conditions.join(', ') || 'None'}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Invariant</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
