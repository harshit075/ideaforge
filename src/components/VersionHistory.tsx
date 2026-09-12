'use client';

import React from 'react';
import { History, RotateCcw, Clock } from 'lucide-react';
import { BuildSpec } from '@/app/api/draft/route';

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
    <div className="warm-card rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-[#E05315]" />
          <span>Spec Revision Timeline ({history.length} Versions)</span>
        </h3>
        <span className="text-[11px] text-[#A8A29E]">Click to switch or rollback</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {history.map((snapshot) => {
          const isCurrent = snapshot.version === currentVersion;
          return (
            <button
              key={snapshot.version}
              onClick={() => onRevert(snapshot)}
              className={`flex-shrink-0 text-left p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-orange-50 border-orange-300 shadow-sm'
                  : 'bg-[#FAF8F3] hover:bg-white border-[#EAE2D5]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    isCurrent
                      ? 'bg-[#E05315] text-white'
                      : 'bg-white text-[#78716C] border border-[#E5E0D8]'
                  }`}
                >
                  v{snapshot.version}
                </span>
                <span className="text-[10px] text-[#A8A29E] flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{snapshot.timestamp}</span>
                </span>
              </div>
              <p className="text-xs text-[#1C1917] font-bold mt-1.5 truncate max-w-[190px]">
                {snapshot.spec.title}
              </p>
              <p className="text-[11px] text-[#57534E] mt-0.5 truncate max-w-[190px]">
                {snapshot.summary}
              </p>
              {!isCurrent && (
                <div className="mt-2 text-[10px] text-[#E05315] font-semibold flex items-center gap-1">
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
