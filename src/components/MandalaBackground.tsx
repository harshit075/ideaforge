'use client';

import React from 'react';

export default function MandalaBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {/* Top Left Corner Flourish */}
      <svg
        className="absolute top-0 left-0 w-80 h-80 text-[#E05315] opacity-20 transform -translate-x-10 -translate-y-10"
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <circle cx="0" cy="0" r="120" strokeDasharray="4 4" />
        <circle cx="0" cy="0" r="180" />
        <circle cx="0" cy="0" r="240" strokeDasharray="2 6" />
        <circle cx="0" cy="0" r="300" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = Math.cos(angle) * 120;
          const y1 = Math.sin(angle) * 120;
          const x2 = Math.cos(angle) * 240;
          const y2 = Math.sin(angle) * 240;
          return (
            <g key={i}>
              <path d={`M 0 0 Q ${x1} ${y1} ${x2} ${y2}`} />
              <circle cx={x2} cy={y2} r="4" fill="currentColor" opacity="0.4" />
            </g>
          );
        })}
      </svg>

      {/* Top Right Corner Flourish */}
      <svg
        className="absolute top-0 right-0 w-96 h-96 text-[#E05315] opacity-20 transform translate-x-12 -translate-y-12"
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <circle cx="400" cy="0" r="140" strokeDasharray="4 4" />
        <circle cx="400" cy="0" r="210" />
        <circle cx="400" cy="0" r="280" strokeDasharray="2 6" />
        <circle cx="400" cy="0" r="350" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 400 - Math.cos(angle) * 140;
          const y1 = Math.sin(angle) * 140;
          const x2 = 400 - Math.cos(angle) * 280;
          const y2 = Math.sin(angle) * 280;
          return (
            <g key={i}>
              <path d={`M 400 0 Q ${x1} ${y1} ${x2} ${y2}`} />
              <circle cx={x2} cy={y2} r="4" fill="currentColor" opacity="0.4" />
            </g>
          );
        })}
      </svg>

      {/* Subtle Bottom Ambient Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#FAF8F3] via-transparent to-transparent z-0" />
    </div>
  );
}
