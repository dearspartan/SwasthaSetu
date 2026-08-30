// src/services/tts.ts
// Multilingual Gemini 2.0 Flash Audio Multimodal Speech Synthesizer for SwasthaSetu

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "./geminiClinicalEngine";

let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Native Gemini 2.0 Flash Audio Speech Synthesis (TTS) via @google/genai
 */
export async function speakGeminiTTS(
  text: string,
  lang: string = "hi-IN",
  phoneticText?: string
): Promise<boolean> {
  stopTTS();

  const apiKey = getGeminiApiKey();

  // Try native Gemini 2.0 Flash Audio Modality Synthesis if Google API key is available
  if (apiKey && apiKey.startsWith("AIza")) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Read the following clinical text aloud clearly and naturally in ${lang} (supporting Hindi, English, Hinglish, Tamil, Telugu, Marathi): "${text}"`;

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
                voiceName: "Puck", // Warm natural voice
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
        const audioSrc = `data:${mimeType};base64,${data}`;
        activeAudioElement = new Audio(audioSrc);
        await activeAudioElement.play();
        return true;
      }
    } catch (err) {
      console.warn("Gemini native audio TTS synthesis notice:", err);
    }
  }

  // Browser Web Speech API fallback if Gemini audio modality API is unavailable
  speakBrowserFallbackTTS(text, lang, phoneticText);
  return false;
}

/**
 * Universal Wrapper for Intake Speech Output
 */
export function speakTTS(
  text: string,
  lang: string = "hi-IN",
  phoneticText?: string
) {
  speakGeminiTTS(text, lang, phoneticText);
}

/**
 * Browser SpeechSynthesis Fallback Engine
 */
function speakBrowserFallbackTTS(
  text: string,
  lang: string = "hi-IN",
  phoneticText?: string
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

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

  const textToSpeak = matchingVoice ? text : phoneticText || text;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  if (matchingVoice) {
    utterance.voice = matchingVoice;
    utterance.lang = matchingVoice.lang;
  } else {
    utterance.lang = "en-IN";
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops all active Gemini audio playback and browser WebSpeech utterances
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
