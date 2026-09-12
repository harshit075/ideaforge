'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function BannerTop() {
  return (
    <div className="w-full bg-[#FEF08A] border-b border-[#FDE047] text-[#854D0E] text-xs font-semibold tracking-wider uppercase py-1.5 px-4 text-center select-none z-50 relative shadow-sm">
      <span className="inline-flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04] animate-ping" />
        <span>ASSEMBLYAI UNIVERSAL-3.5 PRO · CODE-SWITCHING VOICE INTAKE · API DIAGNOSTICS ACTIVE</span>
      </span>
    </div>
  );
}
