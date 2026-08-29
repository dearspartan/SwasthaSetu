// src/services/tts.ts
// Bulletproof Multilingual Speech Synthesizer for SwasthaSetu (English, Hindi & 8 Indian Languages)

export function speakTTS(
  text: string,
  lang: string = "hi-IN",
  phoneticText?: string
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // Stop any active speech
  window.speechSynthesis.cancel();

  // Determine language prefix
  const langPrefix = lang.split("-")[0]; // 'hi', 'en', 'mr', 'ta', etc.
  const voices = window.speechSynthesis.getVoices();

  // Find best matching voice
  const matchingVoice = voices.find(
    (v) =>
      v.lang === lang ||
      v.lang.replace("_", "-") === lang ||
      v.lang.startsWith(langPrefix) ||
      v.name.toLowerCase().includes(langPrefix) ||
      v.name.toLowerCase().includes("hindi")
  );

  // If native Hindi voice is present, speak native Hindi text.
  // If native Hindi voice is missing on Windows, speak Romanized Hindi phonetics ("Namaste! Main SwasthaSetu ka...")
  const textToSpeak = matchingVoice ? text : (phoneticText || text);

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  if (matchingVoice) {
    utterance.voice = matchingVoice;
    utterance.lang = matchingVoice.lang;
  } else {
    // Default to en-IN for Romanized Hindi phonetics
    utterance.lang = "en-IN";
  }

  window.speechSynthesis.speak(utterance);
}

export function stopTTS() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
