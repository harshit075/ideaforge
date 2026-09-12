"use client";

import React, { useState } from "react";
import { X, Key, ShieldCheck, Info, Sparkles, Check } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasAssemblyAiKey: boolean;
  hasGeminiKey: boolean;
  assemblyKeyOverride: string;
  setAssemblyKeyOverride: (key: string) => void;
  geminiKeyOverride: string;
  setGeminiKeyOverride: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  hasAssemblyAiKey,
  hasGeminiKey,
  assemblyKeyOverride,
  setAssemblyKeyOverride,
  geminiKeyOverride,
  setGeminiKeyOverride,
}) => {
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-bold text-white">API Credentials & Architecture</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3 bg-violet-950/30 border border-violet-500/20 rounded-xl text-xs text-violet-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Production Server-Side Pattern</p>
              <p className="mt-0.5 text-slate-300">
                In v2, all API keys reside safely server-side in Next.js environment variables. Browser clients never expose keys directly. You can inspect or provide session overrides below.
              </p>
            </div>
          </div>

          {/* AssemblyAI Key Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>AssemblyAI API Key (Dictation / Universal-3.5 Pro)</span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  hasAssemblyAiKey
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {hasAssemblyAiKey ? "Server .env.local Loaded" : "Missing from .env"}
              </span>
            </label>
            <input
              type="password"
              placeholder="Leave blank to use server environment key"
              value={assemblyKeyOverride}
              onChange={(e) => setAssemblyKeyOverride(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Endpoint: <code className="text-violet-300">https://dictation.assemblyai.com/v1/transcribe/live</code>
            </p>
          </div>

          {/* Gemini Key Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  hasGeminiKey
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}
              >
                {hasGeminiKey ? "Server .env.local Loaded" : "Synthesizer Fallback Active"}
              </span>
            </label>
            <input
              type="password"
              placeholder="Paste Google AI Studio key (AIzaSy...) or leave blank"
              value={geminiKeyOverride}
              onChange={(e) => setGeminiKeyOverride(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Model: <code className="text-violet-300">gemini-1.5-flash</code> (strict JSON structured output).
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all"
          >
            {savedMessage ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save & Apply</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
