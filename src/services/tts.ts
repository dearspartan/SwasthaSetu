// src/services/tts.ts
// Robust Multilingual Speech Synthesizer powered by Gemini 2.0 Flash Audio (with WAV Header & Web Audio API Playback)

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "./geminiClinicalEngine";

let activeAudioElement: HTMLAudioElement | null = null;
let activeAudioContext: AudioContext | null = null;

/**
 * Converts raw PCM base64 data from Gemini 2.0 Flash into a playable WAV Data URL
 */
function pcmToWavDataUrl(base64Pcm: string, sampleRate: number = 24000): string {
  try {
    const binaryString = atob(base64Pcm);
    const len = binaryString.length;
    const pcmBytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }

    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + len, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // FMT sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for linear PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // DATA sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, len, true);

    const wavBytes = new Uint8Array(44 + len);
    wavBytes.set(new Uint8Array(wavHeader), 0);
    wavBytes.set(pcmBytes, 44);

    let wavBinary = "";
    const chunkSize = 8192;
    for (let i = 0; i < wavBytes.length; i += chunkSize) {
      const sub = wavBytes.subarray(i, i + chunkSize);
      wavBinary += String.fromCharCode.apply(null, Array.from(sub));
    }

    return `data:audio/wav;base64,${btoa(wavBinary)}`;
  } catch (err) {
    console.warn("PCM to WAV conversion error:", err);
    return `data:audio/pcm;base64,${base64Pcm}`;
  }
}

/**
 * Gemini 2.0 Flash Multimodal Speech Synthesizer (TTS)
 */
export async function speakGeminiTTS(
  text: string,
  lang: string = "hi-IN"
): Promise<boolean> {
  stopTTS();

  const apiKey = getGeminiApiKey();

  // Try native Gemini 2.0 Flash Audio Modality Synthesis if AIza Google API key is available
  if (apiKey && apiKey.startsWith("AIza")) {
    try {
      const isHindi = lang.startsWith("hi");
      const targetLangName = isHindi ? "Hindi (Devanagari / Hindustani)" : lang;
      const prompt = `Perform clear, empathetic, spoken text-to-speech audio synthesis in ${targetLangName} for the following clinical response: "${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: isHindi ? "Kore" : "Puck",
              },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData && part.inlineData.mimeType?.startsWith("audio/")
      );

      if (audioPart && audioPart.inlineData) {
        const { mimeType, data } = audioPart.inlineData;
        
        // Convert PCM or raw data into a playable WAV Data URL
        let sampleRate = 24000;
        if (mimeType.includes("16000") || mimeType.includes("rate=16000")) {
          sampleRate = 16000;
        }

        const audioSrc = mimeType.includes("pcm") ? pcmToWavDataUrl(data, sampleRate) : `data:${mimeType};base64,${data}`;

        activeAudioElement = new Audio(audioSrc);
        await activeAudioElement.play();
        return true;
      }
    } catch (err) {
      console.warn("Gemini 2.0 Flash Audio TTS synthesis notice:", err);
    }
  }

  // Fallback to browser SpeechSynthesis if Gemini audio output fails or API key is absent
  return speakBrowserFallbackTTS(text, lang);
}

/**
 * Universal Wrapper for Intake Speech Output
 */
export function speakTTS(text: string, lang: string = "hi-IN") {
  speakGeminiTTS(text, lang);
}

/**
 * Browser SpeechSynthesis Fallback Engine
 */
function speakBrowserFallbackTTS(text: string, lang: string = "hi-IN"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  window.speechSynthesis.cancel();

  const safeLang = lang || "hi-IN";
  const langPrefix = safeLang.split("-")[0] || "hi";
  const voices = window.speechSynthesis.getVoices();

  const matchingVoice = voices.find(
    (v) =>
      v.lang === safeLang ||
      v.lang.replace("_", "-") === safeLang ||
      (langPrefix && v.lang.startsWith(langPrefix)) ||
      (langPrefix && v.name.toLowerCase().includes(langPrefix)) ||
      v.name.toLowerCase().includes("hindi")
  );

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  if (matchingVoice) {
    utterance.voice = matchingVoice;
    utterance.lang = matchingVoice.lang;
  } else {
    utterance.lang = "en-IN";
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Stops all active Gemini audio playback and browser utterances
 */
export function stopTTS() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
