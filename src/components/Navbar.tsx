"use client";

import React from "react";
import { Sparkles, Terminal, ShieldAlert, Cpu, Settings, Activity, CheckCircle2 } from "lucide-react";

interface NavbarProps {
  activeTab: "studio" | "diagnostics";
  setActiveTab: (tab: "studio" | "diagnostics") => void;
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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Model indicator */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-400 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                IdeaForge
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-violet-900/60 text-violet-300 border border-violet-500/30">
                v2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Universal-3.5 Pro</span>
              <span className="text-slate-600">•</span>
              <span>Gemini Architecture</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-white/[0.04] border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === "studio"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Build Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
              activeTab === "diagnostics"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>API Diagnostics</span>
            {anomalyCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 ml-0.5">
                {anomalyCount}
              </span>
            )}
          </button>
        </div>

        {/* Server Key Badges & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border font-medium ${
                hasAssemblyAiKey
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-950/40 text-rose-300 border-rose-500/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasAssemblyAiKey ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              <span>AssemblyAI Dictation</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border font-medium ${
                hasGeminiKey
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                  : "bg-indigo-950/40 text-indigo-300 border-indigo-500/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasGeminiKey ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"
                }`}
              />
              <span>{hasGeminiKey ? "Gemini Live" : "Synthesizer Mode"}</span>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all"
            title="API Keys & Diagnostics Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
