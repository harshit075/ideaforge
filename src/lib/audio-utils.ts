/**
 * Audio Utilities for IdeaForge v2 & Diagnostics Suite
 */

// Generates a valid PCM WAV buffer (16-bit, mono, 16000Hz) of specified duration
export function createWavBuffer(durationSec: number = 1, sampleRate: number = 16000, frequencyHz: number = 0): Buffer {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt Subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20);  // AudioFormat = 1 (PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels = 1 (Mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate = SampleRate * NumChannels * BitsPerSample/8
  buffer.writeUInt16LE(2, 32);  // BlockAlign = NumChannels * BitsPerSample/8
  buffer.writeUInt16LE(16, 34); // BitsPerSample = 16

  // data Subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // If frequencyHz > 0, generate a sine tone. Otherwise leave as 0 (silence).
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let sample = 0;
    if (frequencyHz > 0) {
      const t = i / sampleRate;
      sample = Math.floor(Math.sin(2 * Math.PI * frequencyHz * t) * 16383);
    }
    buffer.writeInt16LE(sample, offset);
    offset += 2;
  }

  return buffer;
}

// Packages config JSON + audio WAV buffer into AssemblyAI multipart body
export function buildDictationMultipart(config: Record<string, any>, audioWavBuffer: Buffer) {
  const boundary = "----DictationFormBoundary" + Math.random().toString(36).substring(2);
  const configHeader = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="config"\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(config)}\r\n`
  );
  const audioHeader = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="audio"; filename="clip.wav"\r\nContent-Type: audio/wav\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);

  const body = Buffer.concat([configHeader, audioHeader, audioWavBuffer, footer]);

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body,
  };
}
