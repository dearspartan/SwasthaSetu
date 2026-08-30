// src/services/tts.ts
// Pure Multilingual Gemini 2.0 Flash Audio Speech Synthesizer for SwasthaSetu (ASR & TTS via Google Gemini)

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "./geminiClinicalEngine";

let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Pure Gemini 2.0 Flash Audio Speech Synthesis (TTS) via @google/genai SDK
 * Uses Gemini 2.0 Flash Audio Modality Output
 */
export async function speakGeminiTTS(
  text: string,
  lang: string = "hi-IN"
): Promise<boolean> {
  stopTTS();

  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Read the following clinical response aloud clearly and naturally in ${lang}: "${text}"`;

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
                voiceName: "Puck", // Warm natural clinical voice
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
      console.warn("Gemini 2.0 Flash Audio TTS synthesis notice:", err);
    }
  }

  return false;
}

/**
 * Universal Wrapper for Gemini Intake Speech Output
 */
export function speakTTS(text: string, lang: string = "hi-IN") {
  speakGeminiTTS(text, lang);
}

/**
 * Stops all active Gemini audio playback
 */
export function stopTTS() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
}
