'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Terminal, Activity, Settings, Cpu, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'youtube' | 'bhasha' | 'diagnostics';
  setActiveTab: (tab: 'studio' | 'youtube' | 'bhasha' | 'diagnostics') => void;
  hasAssemblyAiKey: boolean;
  hasGeminiKey: boolean;
  onOpenSettings: () => void;
  anomalyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasAssemblyAiKey,
  hasGeminiKey,
  onOpenSettings,
  anomalyCount = 0,
}) => {
  return (
    <header className="w-full bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#EAE2D5] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo matching repo_clone */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline group cursor-pointer" onClick={() => setActiveTab('studio')}>
            <span className="font-serif text-3xl sm:text-4xl tracking-tight text-[#1C1917] font-semibold">
              ideaforge
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E05315] ml-0.5 inline-block group-hover:scale-125 transition-transform" />
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-[#E05315] bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full">
            Universal-3.5 Pro
          </span>
        </div>

        {/* Floating View Switcher Pills (Matching repo_clone floating pills) */}
        <div className="bg-white/90 backdrop-blur border border-[#EAE2D5] p-1.5 rounded-full inline-flex items-center gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-[#1C1917] text-white shadow-sm font-semibold'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F3]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('bhasha')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'bhasha'
                ? 'bg-[#E05315] text-white shadow-sm font-semibold'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F3]'
            }`}
          >
            <span className="text-orange-500 font-black">🔒</span>
            <span>Bhasha Team Relay</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'youtube'
                ? 'bg-[#1C1917] text-white shadow-sm font-semibold'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F3]'
            }`}
          >
            <span className="text-red-500 font-black">▶</span>
            <span>YouTube 19-Lang</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all relative ${
              activeTab === 'diagnostics'
                ? 'bg-[#1C1917] text-white shadow-sm font-semibold'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F3]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnostics</span>
            {anomalyCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ml-0.5 ${
                activeTab === 'diagnostics' ? 'bg-[#E05315] text-white' : 'bg-orange-200 text-[#E05315]'
              }`}>
                {anomalyCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Section: API Status Pills & Settings */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium ${
                hasAssemblyAiKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasAssemblyAiKey ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>AssemblyAI Dictation</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium ${
                hasGeminiKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-orange-50 text-[#E05315] border-orange-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasGeminiKey ? 'bg-emerald-500 animate-pulse' : 'bg-[#E05315]'
                }`}
              />
              <span>{hasGeminiKey ? 'Gemini Live' : 'Architect Engine'}</span>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2.5 text-[#57534E] hover:text-[#1C1917] bg-white border border-[#E5E0D8] hover:border-[#D4CDBF] rounded-full transition-all shadow-sm"
            title="API Credentials & Architecture Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
