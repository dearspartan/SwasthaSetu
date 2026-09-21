// src/services/tts.ts
// Multilingual Speech Synthesizer — Piper Neural TTS (Hindi + English) with Browser SpeechSynthesis fallback

import { synthesizePiperTTS, stopPiperTTS } from "./piperTts";

/**
 * Universal Wrapper for Intake Speech Output
 *
 * Priority chain:
 *   1. Piper Neural TTS (local HTTP server — hi_IN-dhruva / en_US-lessac)
 *   2. Browser SpeechSynthesis (built-in fallback, no server needed)
 *
 * @param text - Text to synthesize
 * @param lang - BCP-47 locale, e.g. "hi-IN", "en-IN"
 */
export async function speakTTS(text: string, lang: string = "hi-IN"): Promise<void> {
  stopTTS();
  const piperOk = await synthesizePiperTTS(text, lang);
  if (!piperOk) {
    speakBrowserFallbackTTS(text, lang);
  }
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
 * Stops all active TTS audio: Piper playback + browser SpeechSynthesis utterances
 */
export function stopTTS(): void {
  stopPiperTTS();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
