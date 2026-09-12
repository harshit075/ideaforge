"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Upload, Play, Volume2, Sparkles, AlertCircle, RefreshCw, Globe2 } from "lucide-react";

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
  setLoadingStateText: (text: string) => void;
  assemblyKeyOverride?: string;
  geminiKeyOverride?: string;
}

// 4 high-impact demo presets for instant code-switching demonstration
const DEMO_PRESETS = [
  {
    id: "hinglish",
    flag: "🇮🇳",
    label: "Hinglish Code-Switching",
    description: "Hindi + English tech nouns (Next.js, Supabase, Auth)",
    sampleText: "Mujhe ek full-stack web application banana hai Next.js aur Supabase use karke, jisme AI agents automatically student ke audio lectures ko structured notes aur flashcards me convert karein. Isme user authentication chahiye and Stripe payment integration hona chahiye for monthly subscriptions.",
    languagePin: "hi",
  },
  {
    id: "spanish",
    flag: "🇪🇸",
    label: "Spanish Tech Pitch",
    description: "Spanish technical prompt with API integration",
    sampleText: "Quiero construir una plataforma web en Next.js con Tailwind CSS para desarrolladores independientes. La idea es conectar la API de AssemblyAI para dictado por voz y generar diagramas de arquitectura en tiempo real con exportación a GitHub.",
    languagePin: "es",
  },
  {
    id: "german",
    flag: "🇩🇪",
    label: "German Technical",
    description: "German architecture with Docker & backend",
    sampleText: "Ich möchte eine moderne Webanwendung mit Docker, FastAPI und PostgreSQL bauen, die automatische Code-Reviews für Pull Requests durchführt und Entwicklern sofortiges Feedback im Terminal gibt.",
    languagePin: "de",
  },
  {
    id: "english",
    flag: "🇬🇧",
    label: "English Architect",
    description: "Rapid English prompt with tech jargon",
    sampleText: "Build a high-performance developer observability dashboard with Next.js 15, WebSockets, and ClickHouse. It must ingest live telemetry streams, render real-time latency heatmaps, and export automated incident reports.",
    languagePin: "en",
  },
];

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscribeComplete,
  isLoading,
  setLoadingStateText,
  assemblyKeyOverride,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(24).fill(12));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update frequency meter while recording
  const updateVisualizer = () => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const step = Math.floor(dataArray.length / 24);
    const newBars: number[] = [];
    for (let i = 0; i < 24; i++) {
      const val = dataArray[i * step] || 0;
      // Map 0-255 to height 8px - 48px
      const height = Math.max(8, Math.min(48, Math.round((val / 255) * 44 + 8)));
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

      // Audio Context for visualizer
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
      setErrorMessage("Microphone access was denied or not found: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setWaveformBars(new Array(24).fill(12));
    }
  };

  // Convert WebM/audio blob to WAV using AudioContext before sending to AssemblyAI Dictation API
  const convertBlobToWav = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // Encode to 16-bit PCM WAV (16kHz or original sample rate)
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

    // RIFF identifier
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, pcmData.length * 2, true);

    let offset = 44;
    for (let i = 0; i < pcmData.length; i++) {
      const s = Math.max(-1, Math.min(1, pcmData[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    ctx.close();
    return new Blob([wavBuffer], { type: "audio/wav" });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Transcribe recorded audio
  const handleTranscribeRecorded = async () => {
    if (!audioBlob) return;
    setErrorMessage(null);
    setLoadingStateText("Transcribing spoken audio via AssemblyAI Universal-3.5 Pro...");

    try {
      const wavBlob = await convertBlobToWav(audioBlob);
      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");

      if (selectedLanguage !== "auto") {
        formData.append("language_codes", JSON.stringify([selectedLanguage]));
      }

      const headers: Record<string, string> = {};
      if (assemblyKeyOverride) {
        headers["x-assemblyai-key"] = assemblyKeyOverride;
      }

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Transcription request failed");
      }

      onTranscribeComplete({
        text: data.text,
        llm_response: data.llm_response || data.text,
        confidence: data.confidence,
        audio_duration_ms: data.audio_duration_ms,
        request_time_ms: data.request_time_ms,
        session_id: data.session_id,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to transcribe audio");
    }
  };

  // Trigger one of the high-impact code-switching demo presets
  const handleTriggerPreset = async (preset: typeof DEMO_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    setAudioBlob(null);
    setAudioUrl(null);
    setErrorMessage(null);
    setLoadingStateText(`Processing ${preset.label} (${preset.languagePin.toUpperCase()}) demo idea...`);

    // Directly pass the transcribed preset text into the spec generation pipeline
    onTranscribeComplete({
      text: preset.sampleText,
      llm_response: preset.sampleText,
      confidence: 0.98,
      audio_duration_ms: 6800,
      request_time_ms: 620,
      session_id: "demo-" + preset.id + "-" + Date.now().toString(36),
    });
  };

  // Upload custom file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setSelectedPreset(null);
    setLoadingStateText("Uploading & transcribing audio file...");

    try {
      const wavBlob = await convertBlobToWav(file);
      setAudioBlob(wavBlob);
      setAudioUrl(URL.createObjectURL(wavBlob));

      const formData = new FormData();
      formData.append("audio", wavBlob, file.name);

      if (selectedLanguage !== "auto") {
        formData.append("language_codes", JSON.stringify([selectedLanguage]));
      }

      const headers: Record<string, string> = {};
      if (assemblyKeyOverride) {
        headers["x-assemblyai-key"] = assemblyKeyOverride;
      }

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to transcribe file");
      }

      onTranscribeComplete({
        text: data.text,
        llm_response: data.llm_response || data.text,
        confidence: data.confidence,
        audio_duration_ms: data.audio_duration_ms,
        request_time_ms: data.request_time_ms,
        session_id: data.session_id,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "File upload failed");
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>Speak Your Idea in Any Language</span>
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Universal-3.5 Pro handles native code-switching (Hindi, Spanish, German, etc. mixed with English tech nouns).
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-violet-400 shrink-0" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isRecording || isLoading}
            className="px-3 py-1.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="auto">Auto-Detect (Universal 19 Languages)</option>
            <option value="hi">Hindi (hi) / Hinglish</option>
            <option value="en">English (en)</option>
            <option value="es">Spanish (es)</option>
            <option value="fr">French (fr)</option>
            <option value="de">German (de)</option>
            <option value="it">Italian (it)</option>
            <option value="ja">Japanese (ja)</option>
            <option value="zh">Chinese (zh)</option>
            <option value="ar">Arabic (ar)</option>
            <option value="pt">Portuguese (pt)</option>
          </select>
        </div>
      </div>

      {/* Recording Stage & Live Frequency Meter */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-purple-950/20 via-slate-950/40 to-slate-950/80 border border-white/10 flex flex-col items-center justify-center gap-5">
        {/* Dynamic Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-md px-4">
          {waveformBars.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}px` }}
              className={`w-1.5 rounded-full wave-bar transition-all duration-75 ${
                isRecording
                  ? "bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400 shadow-sm shadow-purple-500"
                  : audioBlob
                  ? "bg-violet-500/50"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isLoading}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <div className="w-4 h-4 rounded-full bg-red-400 group-hover:scale-110 transition-all" />
              <Mic className="w-5 h-5" />
              <span>Start Speaking Your Idea</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-base shadow-xl shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all animate-pulse"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>Stop & Build Spec ({formatTimer(recordSeconds)} / 02:00)</span>
            </button>
          )}

          {/* Action to transcribe recorded audio if stopped */}
          {audioBlob && !isRecording && (
            <button
              onClick={handleTranscribeRecorded}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Synthesize Spec from Audio</span>
            </button>
          )}
        </div>

        {/* Audio playback if recorded */}
        {audioUrl && !isRecording && (
          <div className="w-full max-w-sm flex items-center justify-center pt-2">
            <audio controls src={audioUrl} className="w-full h-8 opacity-80" />
          </div>
        )}

        {/* File upload fallback */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span>Or upload audio file:</span>
          <label className="text-violet-400 hover:text-violet-300 underline cursor-pointer flex items-center gap-1 font-medium">
            <Upload className="w-3.5 h-3.5" />
            <span>Browse .wav / .mp3</span>
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

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/50 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Transcription Encountered An Issue</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs underline hover:text-rose-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Instant Demo Presets (High-Impact Code Switching) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-violet-400" />
            <span>Instant Demo Clips (Try Code-Switching Without Speaking)</span>
          </span>
          <span className="text-[11px] text-violet-400 font-mono">1-Click Synthesis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleTriggerPreset(p)}
              disabled={isLoading || isRecording}
              className={`text-left p-3.5 rounded-2xl border transition-all hover:scale-[1.01] ${
                selectedPreset === p.id
                  ? "bg-violet-950/40 border-violet-500/60 shadow-lg shadow-purple-500/20"
                  : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{p.flag}</span>
                <span className="font-bold text-xs text-white">{p.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                "{p.sampleText}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
