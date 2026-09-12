'use client';

import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EAE2D5] p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#F5F2EC]">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#E05315]" />
            <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
              API Credentials & Architecture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F3] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl text-xs text-[#57534E] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#E05315] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1C1917]">Server-Side Credential Protection</p>
              <p className="mt-0.5 leading-relaxed">
                All production calls proxy through Next.js server routes. The browser never holds your keys directly. You can inspect status or provide session overrides below.
              </p>
            </div>
          </div>

          {/* AssemblyAI Key Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1C1917] flex items-center justify-between">
              <span>AssemblyAI API Key (Dictation / Universal-3.5 Pro)</span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  hasAssemblyAiKey
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {hasAssemblyAiKey ? 'Server .env.local Loaded' : 'Missing in .env'}
              </span>
            </label>
            <input
              type="password"
              placeholder="Leave blank to use server environment key"
              value={assemblyKeyOverride}
              onChange={(e) => setAssemblyKeyOverride(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#E05315] transition-all"
            />
            <p className="text-[11px] text-[#78716C]">
              Endpoint: <code className="text-[#E05315] font-semibold">https://dictation.assemblyai.com/v1/transcribe/live</code>
            </p>
          </div>

          {/* Gemini Key Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1C1917] flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  hasGeminiKey
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-orange-50 text-[#E05315] border border-orange-200'
                }`}
              >
                {hasGeminiKey ? 'Server .env.local Loaded' : 'Architect Engine Active'}
              </span>
            </label>
            <input
              type="password"
              placeholder="Paste Google AI Studio key (AIzaSy...) or leave blank"
              value={geminiKeyOverride}
              onChange={(e) => setGeminiKeyOverride(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#E05315] transition-all"
            />
            <p className="text-[11px] text-[#78716C]">
              Model: <code className="text-[#E05315] font-semibold">gemini-1.5-flash</code> (structured JSON schema).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F5F2EC]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-[#FAF8F3] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#E05315] hover:bg-[#C2410C] text-white rounded-full text-xs font-medium shadow-sm transition-all"
          >
            {savedMessage ? (
              <>
                <Check className="w-4 h-4 text-white" />
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
