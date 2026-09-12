'use client';

import React, { useState } from 'react';
import {
  Mic,
  Square,
  MessageSquare,
  Globe2,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  FileCode,
  Laptop,
} from 'lucide-react';

interface HeroEditorialIntakeProps {
  onStartVoiceStudio: () => void;
  onOpenZeroDrift: () => void;
  onOpenYoutube: () => void;
  onTriggerPreset: (presetId: string) => void;
}

export const HeroEditorialIntake: React.FC<HeroEditorialIntakeProps> = ({
  onStartVoiceStudio,
  onOpenZeroDrift,
  onOpenYoutube,
  onTriggerPreset,
}) => {
  const [activeMode, setActiveMode] = useState<'speak' | 'team' | 'youtube'>('speak');

  const modes = {
    speak: {
      kicker: 'VOICE-FIRST ARCHITECT',
      heading: 'Just speak.',
      sub: 'Describe your idea in Hindi, Hinglish, Spanish, or raw technical thoughts. AssemblyAI Universal-3.5 Pro strips hesitations, and Gemini compiles your roadmap.',
      bullets: [
        'Native multilingual code-switching',
        'Automatic tech-noun protection',
        'Ready-to-paste prompt for Cursor/v0',
      ],
      cta: 'Talk to IdeaForge',
      ctaAction: onStartVoiceStudio,
      accentText: 'Multilingual Universal-3.5 Pro Live',
      image: '/images/editorial/hero-architect.jpg',
      badge: 'Interactive Speech Intake',
    },
    team: {
      kicker: 'ZERO-DRIFT ORCHESTRATION',
      heading: 'Just handoff.',
      sub: 'Keep facts invariant across global squads. When an engineering lead speaks in Hinglish, critical deadlines, assignees, and prerequisites are locked (0% fact drift).',
      bullets: [
        'Canonical Meaning Packet extraction',
        'Simultaneous EN, HI, JA localized cards',
        '1-click WhatsApp & email dispatch',
      ],
      cta: 'Open Zero-Drift Relay',
      ctaAction: onOpenZeroDrift,
      accentText: '0% Fact Drift Guaranteed',
      image: '/images/editorial/hero-zerodrift.jpg',
      badge: 'Verified Team Relay',
    },
    youtube: {
      kicker: 'MULTILINGUAL VIDEO SYNTHESIZER',
      heading: 'Just link it.',
      sub: 'Paste any YouTube URL, tech pitch, or lecture. Instantly retrieve synchronized transcripts in 19 world languages and synthesize engineering roadmaps.',
      bullets: [
        'All 19 Universal-3.5 languages supported',
        'Time-stamped verbatim alignment',
        '1-click software spec compilation',
      ],
      cta: 'Transcribe YouTube Video',
      ctaAction: onOpenYoutube,
      accentText: '19 World Languages Ready',
      image: '/images/editorial/hero-videosynth.jpg',
      badge: 'Global Video Intake',
    },
  };

  const current = modes[activeMode];

  return (
    <div className="w-full relative overflow-hidden pt-2 pb-8">
      {/* 3-Column Hero Layout matching repo_clone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Column 1: Editorial Heading & CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 text-[#E05315] text-xs font-bold px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal-3.5 Pro · Speech Engine</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-serif font-semibold tracking-tight text-[#1C1917] leading-[1.08]">
            You speak once.{' '}
            <span className="text-[#E05315] italic font-serif block mt-1">
              We carry it through.
            </span>
          </h1>

          <p className="text-base text-[#57534E] leading-relaxed max-w-md">
            Speak, send a voice instruction, or drop a video link. IdeaForge translates thoughts into locked engineering specifications and coding agent prompts.
          </p>

          <div className="pt-2">
            <button
              onClick={current.ctaAction}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#1C1917] hover:bg-[#2C2927] text-white font-medium text-sm shadow-md hover:shadow-lg transition-all group"
            >
              <span>{current.cta}</span>
              <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Column 2: Center Stage with Editorial Illustration + Floating Card */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[460px]">
          {/* Subtle Stage Radial Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-orange-200/40 blur-3xl -z-10 pointer-events-none" />

          {/* Floating Security / Intake Accent Pill */}
          <div className="absolute top-2 z-20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-[#EAE2D5] shadow-sm text-xs font-semibold text-[#1C1917]">
            <span className="w-2 h-2 rounded-full bg-[#E05315] animate-pulse" />
            <span>{current.accentText}</span>
          </div>

          {/* Editorial Artwork Card */}
          <div className="relative w-72 sm:w-80 h-[380px] rounded-3xl overflow-hidden shadow-2xl border border-[#EAE2D5] bg-white/60 backdrop-blur-sm p-1.5 transition-all">
            <img
              src={current.image}
              alt={current.heading}
              className="w-full h-full object-cover rounded-2xl transition-all duration-500"
            />
          </div>

          {/* Floating Interactive Companion Card */}
          <div className="absolute bottom-16 sm:bottom-14 right-2 sm:-right-4 z-20 w-64 sm:w-72 warm-card rounded-2xl p-4 shadow-xl border border-[#EAE2D5] space-y-2.5 backdrop-blur-sm bg-white/95 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#F5F2EC] pb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#78716C]">
                {current.badge}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            {activeMode === 'speak' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#1C1917]">
                  Tap to speak in any language
                </p>
                <button
                  onClick={onStartVoiceStudio}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#E05315] hover:bg-[#C2410C] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Voice Spec</span>
                </button>
                <div className="flex items-center justify-between text-[10px] text-[#78716C] font-mono">
                  <span>Universal-3.5 Pro</span>
                  <span>19 Languages</span>
                </div>
              </div>
            )}

            {activeMode === 'team' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#1C1917]">
                  0% Drift Meaning Packet
                </p>
                <button
                  onClick={onOpenZeroDrift}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1C1917] hover:bg-[#2C2927] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Shield className="w-3.5 h-3.5 text-orange-400" />
                  <span>View Fact-Lock Cards</span>
                </button>
                <div className="flex items-center justify-between text-[10px] text-[#78716C] font-mono">
                  <span>EN · HI · JA</span>
                  <span>Locked Invariants</span>
                </div>
              </div>
            )}

            {activeMode === 'youtube' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#1C1917]">
                  Paste URL for 19-Lang Transcribe
                </p>
                <button
                  onClick={onOpenYoutube}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Paste YouTube Link</span>
                </button>
                <div className="flex items-center justify-between text-[10px] text-[#78716C] font-mono">
                  <span>Timestamps + Spec</span>
                  <span>Instant Export</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Mode Selector Floating Switcher matching repo_clone */}
          <div className="mt-4 bg-white border border-[#EAE2D5] p-1.5 rounded-full inline-flex items-center gap-1 shadow-sm z-30">
            <button
              onClick={() => setActiveMode('speak')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeMode === 'speak'
                  ? 'bg-[#E05315] text-white shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Call Architect
            </button>
            <button
              onClick={() => setActiveMode('team')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeMode === 'team'
                  ? 'bg-[#E05315] text-white shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Zero-Drift Relay
            </button>
            <button
              onClick={() => setActiveMode('youtube')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeMode === 'youtube'
                  ? 'bg-[#E05315] text-white shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              YouTube 19-Lang
            </button>
          </div>
        </div>

        {/* Column 3: Mode Narrative Details matching repo_clone */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#E05315]">
            {current.kicker}
          </div>

          <h2 className="font-serif text-3xl font-semibold text-[#1C1917]">
            {current.heading}
          </h2>

          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            {current.sub}
          </p>

          <ul className="space-y-2.5 pt-2 text-xs text-[#1C1917]">
            {current.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E05315] shrink-0 mt-0.5" />
                <span className="leading-tight">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
