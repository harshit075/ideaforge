'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, Download, AlertCircle, RefreshCw } from 'lucide-react';

interface ArchitectureVisualizerProps {
  chart: string;
  title?: string;
}

export const ArchitectureVisualizer: React.FC<ArchitectureVisualizerProps> = ({
  chart,
  title = 'System Architecture',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#FFF7ED',
        primaryTextColor: '#1C1917',
        primaryBorderColor: '#E05315',
        lineColor: '#EA580C',
        secondaryColor: '#FAF8F3',
        tertiaryColor: '#FFFFFF',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
      },
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setError(null);
    setIsRendered(false);

    // Sanitize and ensure valid chart
    let cleanChart = (chart || '').trim();
    if (!cleanChart.startsWith('graph') && !cleanChart.startsWith('flowchart') && !cleanChart.startsWith('sequenceDiagram') && !cleanChart.startsWith('classDiagram')) {
      cleanChart = `graph TD\n  Client[Web Client: Next.js] --> API[API Route / Orchestrator]\n  API --> AssemblyAI[AssemblyAI Dictation Pro]\n  API --> LLM[Gemini Architecture Engine]\n  LLM --> Prompt[Coding Agent Prompt]`;
    }

    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
          setIsRendered(true);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Mermaid render error:', err);
          setError('Could not render complex diagram graph. Showing raw format.');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
          Visual System Diagram
        </span>
        {isRendered && (
          <button
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#E05315] hover:text-[#C2410C] bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full transition-all"
            title="Download Architecture SVG"
          >
            <Download className="w-3 h-3" />
            <span>Download Diagram</span>
          </button>
        )}
      </div>

      {error ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Diagram Syntax View</span>
          </div>
          <pre className="p-2 bg-white/70 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre">
            {chart}
          </pre>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="p-4 bg-white rounded-2xl border border-[#EAE2D5] shadow-inner overflow-x-auto flex items-center justify-center min-h-[220px]"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
};
