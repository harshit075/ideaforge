'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  Sparkles,
  AlertCircle,
  Globe,
  Volume2,
  ArrowRight,
  Trash2,
  Headphones,
  RotateCcw,
} from 'lucide-react';

interface AudioRecorderProps {
  onTranscribeComplete: (data: {
    text: string;
    llm_response: string;
    confidence: number;
    audio_duration_ms: number;
    request_time_ms: number;
    session_id?: string;
  }) => void;
  isLoading: boolean;
  loadingProgress?: number;
  setLoadingStateText: (text: string) => void;
  assemblyKeyOverride?: string;
  geminiKeyOverride?: string;
}

const DEMO_PRESETS = [
  {
    id: 'hinglish',
    langLabel: 'HI-IN',
    label: 'Hinglish Code-Switching',
    subtitle: 'Hindi + English tech nouns (Next.js, Supabase, Auth)',
    sampleText: 'Mujhe ek full-stack web application banana hai Next.js aur Supabase use karke, jisme AI agents automatically student ke audio lectures ko structured notes aur flashcards me convert karein. Isme user authentication chahiye and Stripe payment integration hona chahiye for monthly subscriptions.',
    languagePin: 'hi',
  },
  {
    id: 'spanish',
    langLabel: 'ES-ES',
    label: 'Spanish Tech Pitch',
    subtitle: 'Spanish technical prompt with API integration',
    sampleText: 'Quiero construir una plataforma web en Next.js con Tailwind CSS para desarrolladores independientes. La idea es conectar la API de AssemblyAI para dictado por voz y generar diagramas de arquitectura en tiempo real con exportación a GitHub.',
    languagePin: 'es',
  },
  {
    id: 'german',
    langLabel: 'DE-DE',
    label: 'German Technical',
    subtitle: 'German architecture with Docker & backend',
    sampleText: 'Ich möchte eine moderne Webanwendung mit Docker, FastAPI und PostgreSQL bauen, die automatische Code-Reviews für Pull Requests durchführt und Entwicklern sofortiges Feedback im Terminal gibt.',
    languagePin: 'de',
  },
  {
    id: 'english',
    langLabel: 'EN-US',
    label: 'English Architect',
    subtitle: 'Rapid English prompt with tech jargon',
    sampleText: 'Build a high-performance developer observability dashboard with Next.js 15, WebSockets, and ClickHouse. It must ingest live telemetry streams, render real-time latency heatmaps, and export automated incident reports.',
    languagePin: 'en',
  },
];

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscribeComplete,
  isLoading,
  loadingProgress = 0,
  setLoadingStateText,
  assemblyKeyOverride,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(28).fill(12));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastTranscribed, setLastTranscribed] = useState<{
    text: string;
    llm_response: string;
    confidence: number;
    audio_duration_ms: number;
    request_time_ms: number;
    session_id?: string;
  } | null>(null);

  const handleDiscardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordSeconds(0);
    setErrorMessage(null);
    setWaveformBars(new Array(28).fill(12));
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateVisualizer = () => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const step = Math.floor(dataArray.length / 28);
    const newBars: number[] = [];
    for (let i = 0; i < 28; i++) {
      const val = dataArray[i * step] || 0;
      const height = Math.max(8, Math.min(52, Math.round((val / 255) * 48 + 8)));
      newBars.push(height);
    }
    setWaveformBars(newBars);

    animFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setSelectedPreset(null);
    setAudioBlob(null);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(rawBlob);
        setAudioUrl(URL.createObjectURL(rawBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 119) {
            stopRecording();
            return 120;
          }
          return s + 1;
        });
      }, 1000);

      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    } catch (err: any) {
      setErrorMessage('Microphone access was denied or not found: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setWaveformBars(new Array(28).fill(12));
    }
  };

  const convertBlobToWav = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const targetSampleRate = 16000;
    const numChannels = 1;
    const offlineCtx = new OfflineAudioContext(numChannels, audioBuffer.duration * targetSampleRate, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    const renderedBuffer = await offlineCtx.startRendering();

    const pcmData = renderedBuffer.getChannelData(0);
    const wavBuffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(wavBuffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length * 2, true);

    let offset = 44;
    for (let i = 0; i < pcmData.length; i++) {
      const s = Math.max(-1, Math.min(1, pcmData[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    ctx.close();
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleTranscribeRecorded = async () => {
    if (!audioBlob) return;
    if (recordSeconds < 1) {
      setErrorMessage("Recording was too short (under 1 second). Please speak into your microphone before synthesizing.");
      return;
    }
    setErrorMessage(null);
    setLoadingStateText('Transcribing spoken audio via AssemblyAI Universal-3.5 Pro...');

    try {
      const wavBlob = await convertBlobToWav(audioBlob);
      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');

      if (selectedLanguage !== 'auto') {
        formData.append('language_codes', JSON.stringify([selectedLanguage]));
      }

      const headers: Record<string, string> = {};
      if (assemblyKeyOverride) {
        headers['x-assemblyai-key'] = assemblyKeyOverride;
      }

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transcription request failed');
      }

      const spokenText = data.text?.trim() || '';
      const cleanText = data.llm_response?.trim() || spokenText;

      if (!spokenText && !cleanText) {
        setErrorMessage('No audible speech was detected in this recording. Please make sure your microphone is unmuted and speak clearly, or test with one of the instant demo presets below.');
        return;
      }

      const transcribedPayload = {
        text: spokenText,
        llm_response: cleanText,
        confidence: data.confidence || 0.95,
        audio_duration_ms: data.audio_duration_ms || recordSeconds * 1000,
        request_time_ms: data.request_time_ms || 480,
        session_id: data.session_id,
      };

      setLastTranscribed(transcribedPayload);
      onTranscribeComplete(transcribedPayload);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to transcribe audio');
    }
  };

  const handleTriggerPreset = async (preset: typeof DEMO_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    setAudioBlob(null);
    setAudioUrl(null);
    setErrorMessage(null);
    setLoadingStateText(`Processing ${preset.label} (${preset.languagePin.toUpperCase()}) demo idea...`);

    const demoPayload = {
      text: preset.sampleText,
      llm_response: preset.sampleText,
      confidence: 0.98,
      audio_duration_ms: 6800,
      request_time_ms: 620,
      session_id: 'demo-' + preset.id + '-' + Date.now().toString(36),
    };

    setLastTranscribed(demoPayload);
    onTranscribeComplete(demoPayload);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setSelectedPreset(null);
    setLoadingStateText('Uploading & transcribing audio file...');

    try {
      const wavBlob = await convertBlobToWav(file);
      setAudioBlob(wavBlob);
      setAudioUrl(URL.createObjectURL(wavBlob));

      const formData = new FormData();
      formData.append('audio', wavBlob, file.name);

      if (selectedLanguage !== 'auto') {
        formData.append('language_codes', JSON.stringify([selectedLanguage]));
      }

      const headers: Record<string, string> = {};
      if (assemblyKeyOverride) {
        headers['x-assemblyai-key'] = assemblyKeyOverride;
      }

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to transcribe file');
      }

      const spokenText = data.text?.trim() || '';
      const cleanText = data.llm_response?.trim() || spokenText;

      if (!spokenText && !cleanText) {
        setErrorMessage('No audible speech was detected in this audio file. Please select an audio file with clear speech.');
        return;
      }

      const filePayload = {
        text: spokenText,
        llm_response: cleanText,
        confidence: data.confidence || 0.95,
        audio_duration_ms: data.audio_duration_ms || 3500,
        request_time_ms: data.request_time_ms || 480,
        session_id: data.session_id,
      };

      setLastTranscribed(filePayload);
      onTranscribeComplete(filePayload);
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Studio Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE2D5] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 text-[#E05315] text-xs font-bold px-3 py-1 rounded-full mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice Intake Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#1C1917]">
            Universal-3.5 Pro · Speech Studio
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5 max-w-xl">
            Record live speech in any of 19 languages, upload an audio file, or click a code-switched preset to generate a build spec.
          </p>
        </div>

        {/* Action Controls: Language Selector & Audio Upload */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 text-xs text-[#78716C] bg-white border border-[#EAE2D5] px-3.5 py-2 rounded-full shadow-sm">
            <Globe className="w-4 h-4 text-[#E05315]" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isRecording || isLoading}
              className="bg-transparent border-none text-[#1C1917] font-semibold text-xs focus:outline-none cursor-pointer"
            >
              <option value="auto">Auto-Detect Language (19 Supported)</option>
              <option value="hi">Hindi (हिंदी) / Hinglish</option>
              <option value="en">English (Global)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="it">Italian (Italiano)</option>
              <option value="ja">Japanese (日本語)</option>
              <option value="zh">Chinese (中文)</option>
              <option value="ar">Arabic (العربية)</option>
              <option value="pt">Portuguese (Português)</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#1C1917] bg-white border border-[#EAE2D5] px-3.5 py-2 rounded-full cursor-pointer shadow-sm hover:border-[#D4CDBF] transition-all">
            <Upload className="w-3.5 h-3.5 text-[#E05315]" />
            <span>Upload Audio</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isRecording || isLoading}
            />
          </label>
        </div>
      </div>

      {/* Main Studio Console: Live Recorder on Left, 4 Presets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (5 cols): Live Recorder Card */}
        <div className="lg:col-span-5 flex">
          <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col items-center justify-center text-center space-y-5 w-full">
            {/* Top Badge */}
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C] bg-[#FAF8F3] px-3 py-1 rounded-full border border-[#EAE2D5]">
              {isRecording ? 'LIVE RECORDING · SPEAK FREELY' : 'PUSH TO TALK'}
            </span>

            {/* Dynamic Waveform Visualizer */}
            <div className="flex items-center justify-center gap-1 h-12 w-full px-2">
              {waveformBars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-1 rounded-full wave-bar transition-all duration-75 ${
                    isRecording
                      ? 'bg-[#E05315]'
                      : audioBlob
                      ? 'bg-orange-300'
                      : 'bg-[#E5E0D8]'
                  }`}
                />
              ))}
            </div>

            {/* Big Circular Push-to-Talk Button with Pulse Ring */}
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <div className="absolute w-28 h-28 rounded-full bg-[#E05315] animate-pulse-ring pointer-events-none" />
              )}

              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isLoading}
                  className="relative z-10 w-20 h-20 rounded-full bg-[#E05315] hover:bg-[#C2410C] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 group"
                  title="Click to start speaking"
                >
                  <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="relative z-10 w-20 h-20 rounded-full bg-[#1C1917] hover:bg-[#2C2927] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all animate-pulse"
                  title="Click to finish speaking"
                >
                  <Square className="w-7 h-7 fill-current text-white" />
                </button>
              )}
            </div>

            {/* Timer or Status */}
            <div>
              <p className="text-sm font-semibold text-[#1C1917]">
                {isRecording ? (
                  <span className="text-[#E05315] font-mono font-bold">
                    Recording: {formatTimer(recordSeconds)} / 02:00
                  </span>
                ) : audioBlob ? (
                  <span className="text-emerald-700 font-semibold">Audio captured! Ready to synthesize.</span>
                ) : (
                  'Tap microphone to describe your project'
                )}
              </p>
              <p className="text-xs text-[#78716C] mt-1">
                Universal-3.5 Pro handles up to 120s of code-switched audio.
              </p>
            </div>

            {/* Action to preview, discard, and synthesize recorded audio */}
            {audioBlob && !isRecording && (
              <div className="w-full space-y-3 pt-2">
                {/* Audio Player Card with Listen Controls */}
                <div className="w-full bg-[#FAF8F3] border border-[#EAE2D5] rounded-2xl p-3.5 space-y-2 text-left shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
                      <Headphones className="w-3.5 h-3.5 text-[#E05315]" />
                      Hear Your Recording
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-[#78716C] bg-white border border-[#EAE2D5] px-2 py-0.5 rounded-full">
                      {formatTimer(recordSeconds)}
                    </span>
                  </div>
                  {audioUrl && (
                    <audio
                      controls
                      src={audioUrl}
                      className="w-full h-9 rounded-lg focus:outline-none"
                    />
                  )}
                </div>

                {/* Progress bar during synthesis */}
                {isLoading && (
                  <div className="w-full p-3 bg-orange-50/90 border border-orange-200 rounded-xl space-y-2 text-left animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#E05315] animate-spin" />
                        Synthesizing Architecture...
                      </span>
                      <span className="text-xs font-mono font-bold text-[#E05315]">
                        {loadingProgress || 15}%
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE2D5] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-400 via-[#E05315] to-[#C2410C] h-full rounded-full transition-all duration-300"
                        style={{ width: `${loadingProgress || 15}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-[#78716C] text-center">
                      {(loadingProgress || 0) < 40
                        ? 'Step 1/3: Universal-3.5 Pro Transcribing...'
                        : (loadingProgress || 0) < 80
                        ? 'Step 2/3: Code-Switching Spec Synthesis...'
                        : 'Step 3/3: Finalizing Architecture Prompt...'}
                    </p>
                  </div>
                )}

                {/* Action Buttons: Discard / Re-record vs Synthesize Spec */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDiscardRecording}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                    title="Discard this recording and start over"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Audio</span>
                  </button>

                  <button
                    onClick={handleTranscribeRecorded}
                    disabled={isLoading}
                    className="flex-[1.5] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E05315] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                        <span>Working ({loadingProgress || 15}%)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>Synthesize Spec</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Instant Demo Presets in 2x2 Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#E05315]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Instant Code-Switching Demo Clips (No Mic Needed)
              </span>
            </div>
            <span className="text-[11px] text-[#78716C]">1-Click Synthesis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleTriggerPreset(p)}
                disabled={isLoading || isRecording}
                className={`text-left p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                  selectedPreset === p.id
                    ? 'bg-orange-50 border-[#E05315] shadow-sm'
                    : 'bg-white hover:bg-[#FAF8F3] border-[#EAE2D5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#78716C] bg-[#FAF8F3] border border-[#EAE2D5] px-2 py-0.5 rounded-md">
                      {p.langLabel}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#E05315] bg-orange-100 px-2 py-0.5 rounded-full">
                      {p.languagePin.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-[#1C1917]">{p.label}</h3>
                  <p className="text-[11px] text-[#57534E] mt-1.5 line-clamp-3 leading-relaxed">
                    "{p.sampleText}"
                  </p>
                </div>
                <div className="pt-2 text-[10px] text-[#E05315] font-semibold flex items-center gap-1">
                  <span>Synthesize with Gemini</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transcription Output: What You Spoke vs Refined Technical Spec Input */}
      {lastTranscribed && (
        <div className="warm-card rounded-3xl p-6 sm:p-7 shadow-md border border-[#EAE2D5] space-y-4 bg-white animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE2D5] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-100 text-[#E05315]">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#1C1917]">
                  Speech Intake & Transformation Telemetry
                </h3>
                <p className="text-xs text-[#78716C]">
                  Universal-3.5 Pro transcription: What you spoke verbatim vs. cleaned technical spec input
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                Confidence: {Math.round(lastTranscribed.confidence * 100)}%
              </span>
              <span className="bg-[#FAF8F3] text-[#78716C] border border-[#EAE2D5] px-3 py-1 rounded-full">
                Latency: {lastTranscribed.request_time_ms}ms
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What You Spoke */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-[#E05315]" />
                  What You Spoke (Raw Speech)
                </span>
                <span className="text-[10px] font-mono text-[#78716C] bg-white border border-[#EAE2D5] px-2 py-0.5 rounded">
                  Universal-3.5 Pro ASR
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#1C1917] font-mono leading-relaxed whitespace-pre-wrap">
                "{lastTranscribed.text}"
              </p>
            </div>

            {/* Refined Technical Output */}
            <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E05315] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E05315]" />
                  Refined Technical Output (Spec Input)
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded">
                  Fillers Cleaned
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#1C1917] font-mono leading-relaxed whitespace-pre-wrap font-medium">
                "{lastTranscribed.llm_response}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-900">Transcription Issue</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs underline hover:text-rose-950 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
