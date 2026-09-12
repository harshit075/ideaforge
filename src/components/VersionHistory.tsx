"use client";

import React from "react";
import { History, RotateCcw, Clock, Sparkles } from "lucide-react";
import { BuildSpec } from "@/app/api/draft/route";

export interface VersionSnapshot {
  version: number;
  timestamp: string;
  spec: BuildSpec;
  summary: string;
}

interface VersionHistoryProps {
  history: VersionSnapshot[];
  currentVersion: number;
  onRevert: (snapshot: VersionSnapshot) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  history,
  currentVersion,
  onRevert,
}) => {
  if (history.length <= 1) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-violet-400" />
          <span>Spec Revision Timeline ({history.length} Versions)</span>
        </h3>
        <span className="text-[11px] text-slate-500">Click to switch or rollback</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {history.map((snapshot) => {
          const isCurrent = snapshot.version === currentVersion;
          return (
            <button
              key={snapshot.version}
              onClick={() => onRevert(snapshot)}
              className={`flex-shrink-0 text-left p-3 rounded-xl border transition-all ${
                isCurrent
                  ? "bg-violet-950/40 border-violet-500/60 shadow-md shadow-violet-500/20"
                  : "bg-white/[0.02] hover:bg-white/[0.06] border-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    isCurrent
                      ? "bg-violet-600 text-white"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  v{snapshot.version}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{snapshot.timestamp}</span>
                </span>
              </div>
              <p className="text-xs text-white font-medium mt-1 truncate max-w-[180px]">
                {snapshot.spec.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                {snapshot.summary}
              </p>
              {!isCurrent && (
                <div className="mt-2 text-[10px] text-violet-400 font-semibold flex items-center gap-1">
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Rollback to v{snapshot.version}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
