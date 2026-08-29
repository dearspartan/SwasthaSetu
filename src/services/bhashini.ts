// src/services/bhashini.ts
// Bhashini (National Language Translation Mission - Digital India) API Service

export interface BhashiniTranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  confidence: number;
  engine: "Bhashini NMT (MeitY)";
}

export const BHASHINI_LANGUAGES = [
  { code: "hi-IN", name: "हिन्दी (Hindi)", bhashiniCode: "hi" },
  { code: "mr-IN", name: "मराठी (Marathi)", bhashiniCode: "mr" },
  { code: "ta-IN", name: "தமிழ் (Tamil)", bhashiniCode: "ta" },
  { code: "te-IN", name: "తెలుగు (Telugu)", bhashiniCode: "te" },
  { code: "bn-IN", name: "বাংলা (Bengali)", bhashiniCode: "bn" },
  { code: "gu-IN", name: "ગુજરાતી (Gujarati)", bhashiniCode: "gu" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", bhashiniCode: "kn" },
  { code: "en-IN", name: "English", bhashiniCode: "en" },
] as const;

/**
 * Simulates Bhashini Neural Machine Translation (NMT) API for Indic Languages
 */
export async function translateWithBhashini(
  text: string,
  sourceLang: string,
  targetLang: string = "en-IN"
): Promise<BhashiniTranslationResult> {
  // Simulated Bhashini API Latency
  await new Promise((res) => setTimeout(res, 200));

  // Medical term mappings
  let translatedText = text;
  if (sourceLang === "hi-IN") {
    if (text.includes("सीने में दर्द")) translatedText = "Chest pain / retrosternal discomfort";
    else if (text.includes("बुखार")) translatedText = "Fever with chills";
    else if (text.includes("पेट में दर्द")) translatedText = "Abdominal pain";
    else if (text.includes("सांस")) translatedText = "Dyspnea / Shortness of breath";
  }

  return {
    translatedText,
    sourceLang,
    targetLang,
    confidence: 0.96,
    engine: "Bhashini NMT (MeitY)",
  };
}
