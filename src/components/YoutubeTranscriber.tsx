'use client';

import React, { useState } from 'react';
import {
  Youtube,
  Globe,
  Sparkles,
  Copy,
  Check,
  Download,
  Clock,
  ArrowRight,
  Play,
  FileText,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { ALL_19_LANGUAGES } from '@/lib/languages';

interface YoutubeTranscriberProps {
  onSynthesizeSpecFromVideo: (transcriptText: string) => void;
  geminiKeyOverride?: string;
}

const SAMPLE_VIDEOS = [
  {
    title: 'Never Gonna Give You Up',
    channel: 'Rick Astley',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    label: '🎵 Music Demo',
  },
  {
    title: 'Steve Jobs iPhone 2007 Keynote',
    channel: 'Apple Archive',
    url: 'https://www.youtube.com/watch?v=VQKMoT-6XSg',
    label: '📱 Tech Pitch',
  },
  {
    title: 'Introduction to Generative AI',
    channel: 'Google Cloud Tech',
    url: 'https://www.youtube.com/watch?v=G2fqAlgmoPo',
    label: '🤖 AI Lecture',
  },
];

export const YoutubeTranscriber: React.FC<YoutubeTranscriberProps> = ({
  onSynthesizeSpecFromVideo,
  geminiKeyOverride,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [videoData, setVideoData] = useState<{
    videoId: string;
    videoTitle: string;
    authorName: string;
    thumbnailUrl: string;
    lines: { start: number; duration: number; text: string }[];
    originalText: string;
    translations: Record<string, string>;
  } | null>(null);

  const [activeLanguage, setActiveLanguage] = useState('en');
  const [viewMode, setViewMode] = useState<'clean' | 'timestamps'>('clean');
  const [copied, setCopied] = useState(false);
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);

  const handleTranscribe = async (inputUrl?: string) => {
    const targetUrl = (inputUrl || url).trim();
    if (!targetUrl) return;

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStep('Fetching YouTube video metadata & captions...');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKeyOverride) headers['x-gemini-key'] = geminiKeyOverride;

      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: targetUrl,
          targetLanguage: activeLanguage,
          translateAll: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract transcript');
      }

      setVideoData(data);
      setUrl(targetUrl);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Switch or translate into another of the 19 languages on demand
  const handleSelectLanguage = async (code: string) => {
    setActiveLanguage(code);
    if (!videoData) return;

    // If already translated, nothing to fetch
    if (videoData.translations[code]) return;

    // Otherwise translate on demand
    setTranslatingLang(code);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKeyOverride) headers['x-gemini-key'] = geminiKeyOverride;

      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url,
          targetLanguage: code,
          translateAll: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.translations?.[code]) {
        setVideoData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            translations: {
              ...prev.translations,
              [code]: data.translations[code],
            },
          };
        });
      }
    } catch (e) {
      console.warn('On-demand translation failed:', e);
    } finally {
      setTranslatingLang(null);
    }
  };

  const currentTranscriptText =
    videoData?.translations[activeLanguage] ||
    videoData?.originalText ||
    '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTranscriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentTranscriptText], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${videoData?.videoTitle || 'youtube-transcript'}-${activeLanguage}.txt`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Hero Header matching repo_clone */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 text-[#E05315] text-xs font-bold px-3.5 py-1.5 rounded-full">
          <Youtube className="w-4 h-4 text-red-600" />
          <span>Multilingual YouTube Transcriber · 19 Languages Supported</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-tight text-[#1C1917]">
          Paste any YouTube URL.{' '}
          <span className="text-[#E05315] italic font-serif block mt-1">
            Transcribe in 19 world languages.
          </span>
        </h1>

        <p className="text-base text-[#57534E] max-w-2xl leading-relaxed">
          Instantly extract audio transcripts from any video or Shorts. Translate across all 19 Universal-3.5 Pro languages (Hindi, Spanish, German, Japanese, Arabic, English, and more) or generate an architectural spec from the video content.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-600">
              <Youtube className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or youtu.be/...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-3.5 bg-[#FAF8F3] border border-[#EAE2D5] rounded-2xl text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#E05315] transition-all"
            />
          </div>

          <button
            onClick={() => handleTranscribe()}
            disabled={isLoading || !url.trim()}
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#E05315] hover:bg-[#C2410C] text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Processing Video...' : 'Transcribe Video'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Sample Videos */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-semibold text-[#78716C]">Try 1-Click Samples:</span>
          {SAMPLE_VIDEOS.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setUrl(s.url);
                handleTranscribe(s.url);
              }}
              disabled={isLoading}
              className="px-3 py-1 rounded-full bg-[#FAF8F3] hover:bg-white text-xs font-medium text-[#57534E] hover:text-[#1C1917] border border-[#EAE2D5] transition-all"
            >
              <span>{s.label} ({s.channel})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Banner */}
      {isLoading && (
        <div className="warm-card rounded-2xl p-6 flex items-center justify-center gap-3 animate-pulse">
          <div className="w-6 h-6 rounded-full border-2 border-[#E05315] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-[#1C1917]">{loadingStep}</p>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-900">Transcription Unavailable</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Video Result View */}
      {videoData && (
        <div className="space-y-6">
          {/* Video Metadata Card */}
          <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Thumbnail */}
              <div className="relative w-full md:w-56 h-32 rounded-2xl overflow-hidden bg-black flex-shrink-0 border border-[#EAE2D5]">
                <img
                  src={videoData.thumbnailUrl}
                  alt={videoData.videoTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex-1 min-w-0 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase text-[#78716C] bg-[#FAF8F3] px-2.5 py-0.5 rounded-md border border-[#EAE2D5]">
                  {videoData.authorName}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1C1917] line-clamp-2">
                  {videoData.videoTitle}
                </h2>
                <p className="text-xs text-[#78716C] flex items-center gap-3">
                  <span>{videoData.lines.length} spoken segments extracted</span>
                  <span>•</span>
                  <span>19 Languages Available</span>
                </p>
              </div>

              {/* Action: Synthesize Spec from this Video */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => onSynthesizeSpecFromVideo(videoData.originalText)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1C1917] hover:bg-[#2C2927] text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Synthesize Spec from Video</span>
                </button>
              </div>
            </div>

            {/* 19 Languages Horizontal Selector Bar */}
            <div className="mt-6 pt-6 border-t border-[#EAE2D5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#E05315]" />
                  <span>Select Transcript Language (19 Supported)</span>
                </span>
                {translatingLang && (
                  <span className="text-xs text-[#E05315] font-semibold animate-pulse">
                    Translating into {translatingLang.toUpperCase()} via Gemini...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
                {ALL_19_LANGUAGES.map((lang) => {
                  const isSelected = activeLanguage === lang.code;
                  const isReady = !!videoData.translations[lang.code];

                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#E05315] text-white border-[#E05315] shadow-sm font-semibold'
                          : isReady
                          ? 'bg-orange-50/70 text-[#1C1917] border-orange-200 hover:bg-orange-100'
                          : 'bg-white text-[#57534E] border-[#EAE2D5] hover:border-[#D4CDBF]'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transcript Content Card */}
          <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE2D5] pb-4">
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-semibold text-[#1C1917]">
                  {ALL_19_LANGUAGES.find((l) => l.code === activeLanguage)?.flag}{' '}
                  {ALL_19_LANGUAGES.find((l) => l.code === activeLanguage)?.name} Transcript
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="bg-[#FAF8F3] border border-[#EAE2D5] p-1 rounded-full inline-flex text-xs">
                  <button
                    onClick={() => setViewMode('clean')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      viewMode === 'clean' ? 'bg-[#1C1917] text-white font-semibold' : 'text-[#57534E]'
                    }`}
                  >
                    Clean Paragraph
                  </button>
                  <button
                    onClick={() => setViewMode('timestamps')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      viewMode === 'timestamps' ? 'bg-[#1C1917] text-white font-semibold' : 'text-[#57534E]'
                    }`}
                  >
                    Timestamps
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="p-2 text-[#57534E] hover:text-[#1C1917] bg-white border border-[#EAE2D5] rounded-full shadow-sm"
                  title="Copy Transcript"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleDownload}
                  className="p-2 text-[#57534E] hover:text-[#1C1917] bg-white border border-[#EAE2D5] rounded-full shadow-sm"
                  title="Download .txt"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transcript Text Body */}
            {viewMode === 'clean' ? (
              <div className="p-6 bg-[#FAF8F3] border border-[#EAE2D5] rounded-2xl text-sm text-[#1C1917] leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap font-sans">
                {currentTranscriptText}
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {videoData.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl flex items-start gap-3 text-xs"
                  >
                    <span className="font-mono text-[#E05315] font-semibold shrink-0 mt-0.5">
                      [{formatTime(line.start)}]
                    </span>
                    <span className="text-[#1C1917] leading-relaxed">{line.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
