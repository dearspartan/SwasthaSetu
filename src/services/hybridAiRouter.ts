// src/services/hybridAiRouter.ts
// Hybrid AI Router Abstraction Layer for SwasthaSetu
// Directs high-throughput raw audio/OCR to local workers and complex clinical triage to Gemini 2.0 Flash

import { transcribeAudioGemini } from "./geminiAudioTranscribe";
import { performGeminiVisionOCR, OCRResult } from "./geminiVisionOcr";
import { generateClinicalSummary, ClinicalSummaryResult } from "./geminiSummaryGenerator";
import { synthesizePiperTTS } from "./piperTts";

export type AIExecutionMode = "HYBRID_LOCAL_GPU" | "CLOUD_GEMINI_2_0" | "AUTO_FALLBACK";

export interface AIRouterConfig {
  executionMode: AIExecutionMode;
  localGpuEndpoint?: string;
  enableGeminiFallback: boolean;
}

const defaultConfig: AIRouterConfig = {
  executionMode: "AUTO_FALLBACK",
  localGpuEndpoint: typeof window !== "undefined" ? (window as any).VITE_LOCAL_GPU_ENDPOINT : undefined,
  enableGeminiFallback: true,
};

/**
 * Hybrid Speech-to-Text Router (faster-whisper / Gemini 2.0 Flash)
 */
export async function processSpeechToText(
  audioBase64: string,
  mimeType: string = "audio/wav",
  language: string = "hi",
  config: AIRouterConfig = defaultConfig
): Promise<{ text: string; engineUsed: string }> {
  // If local GPU worker endpoint is available, attempt faster-whisper inference first
  if (config.executionMode === "HYBRID_LOCAL_GPU" && config.localGpuEndpoint) {
    try {
      const response = await fetch(`${config.localGpuEndpoint}/stt/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mimeType, language }),
      });
      if (response.ok) {
        const data = await response.json();
        return { text: data.transcript, engineUsed: "faster-whisper-gpu" };
      }
    } catch (err) {
      console.warn("Local GPU STT worker unavailable, falling back to Gemini 2.0 Flash:", err);
    }
  }

  // Fallback to Gemini 2.0 Flash Multimodal Transcribe ASR
  const result = await transcribeAudioGemini(audioBase64, mimeType, language);
  return { text: result.text, engineUsed: `gemini-2.0-flash (${result.language})` };
}

/**
 * Hybrid Medical OCR Router (PaddleOCR / Gemini 2.0 Flash Vision)
 */
export async function processMedicalOCR(
  fileBase64: string,
  fileType: string = "image/jpeg",
  config: AIRouterConfig = defaultConfig
): Promise<OCRResult & { engineUsed: string }> {
  // If local GPU worker endpoint is configured, evaluate PaddleOCR v4 first
  if (config.executionMode === "HYBRID_LOCAL_GPU" && config.localGpuEndpoint) {
    try {
      const response = await fetch(`${config.localGpuEndpoint}/ocr/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64, fileType }),
      });
      if (response.ok) {
        const localData: OCRResult = await response.json();
        // If confidence is high, return local PaddleOCR result
        if (localData.isMedicalDocument && localData.tier !== "TIER_3_UNREADABLE_GUARDRAIL") {
          return { ...localData, engineUsed: "PaddleOCR-v4-gpu" };
        }
      }
    } catch (err) {
      console.warn("Local GPU OCR worker unavailable, routing to Gemini 2.0 Flash Vision:", err);
    }
  }

  // Fallback to Gemini 2.0 Flash 3-Tier Vision OCR Engine
  const geminiResult = await performGeminiVisionOCR(fileBase64, fileType);
  return { ...geminiResult, engineUsed: "gemini-2.0-flash-vision" };
}

/**
 * Clinical Reasoning & SBAR/SOAP Summary Engine (Gemini 2.0 Flash)
 */
export async function processClinicalReasoning(
  intakeData: any
): Promise<ClinicalSummaryResult & { engineUsed: string }> {
  const summary = await generateClinicalSummary(intakeData);
  return { ...summary, engineUsed: "gemini-2.0-flash-clinical" };
}

/**
 * Multilingual Text-to-Speech Output
 * Primary: Piper Neural TTS (hi_IN-dhruva / en_US-lessac)
 * Fallback: Browser SpeechSynthesis (handled inside tts.ts speakTTS)
 */
export async function processTextToSpeech(
  text: string,
  language: string = "hi-IN"
): Promise<{ success: boolean; provider: string }> {
  const ok = await synthesizePiperTTS(text, language);
  return { success: ok, provider: ok ? "piper-neural-tts" : "browser-speechsynthesis-fallback" };
}
