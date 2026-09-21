// src/services/piperTts.ts
// Piper Neural TTS Client — Hindi + English (ONNX models, local HTTP server)
// Server: piper-server.py (FastAPI wrapper) running at VITE_PIPER_TTS_URL

const PIPER_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_PIPER_TTS_URL) ??
  "http://localhost:5000";

export type PiperLang = "hi" | "en";

let _cachedPiperAvailable: boolean | null = null;
let _activeAudio: HTMLAudioElement | null = null;

/**
 * Detects the Piper language code from a BCP-47 locale string.
 * "hi-IN", "hi" → "hi"
 * "en-IN", "en-US", "en" → "en"
 */
export function detectPiperLang(lang: string): PiperLang {
  const prefix = lang.split("-")[0].toLowerCase();
  return prefix === "hi" ? "hi" : "en";
}

/**
 * Health-checks the Piper HTTP server.
 * Result is cached for the session to avoid repeated round-trips.
 */
export async function isPiperAvailable(forceCheck = false): Promise<boolean> {
  if (_cachedPiperAvailable !== null && !forceCheck) return _cachedPiperAvailable;

  try {
    const r = await fetch(`${PIPER_BASE_URL}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    _cachedPiperAvailable = r.ok;
  } catch {
    _cachedPiperAvailable = false;
  }

  return _cachedPiperAvailable;
}

/**
 * Synthesizes speech via the local Piper TTS HTTP server.
 *
 * - POSTs { text, lang } to POST /synthesize
 * - Server returns audio/wav binary
 * - Plays the WAV via HTMLAudioElement
 *
 * @returns true if audio played successfully, false if Piper is unavailable or errored.
 */
export async function synthesizePiperTTS(
  text: string,
  lang: string = "hi-IN"
): Promise<boolean> {
  // Stop any currently playing Piper audio
  stopPiperTTS();

  const piperLang = detectPiperLang(lang);

  try {
    const response = await fetch(`${PIPER_BASE_URL}/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang: piperLang }),
      signal: AbortSignal.timeout(10000), // 10s — generous for first synthesis (model warm-up)
    });

    if (!response.ok) {
      console.warn(`[PiperTTS] Server returned HTTP ${response.status}`);
      _cachedPiperAvailable = false;
      return false;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("audio")) {
      console.warn("[PiperTTS] Unexpected content-type:", contentType);
      return false;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    _activeAudio = new Audio(audioUrl);
    _activeAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      _activeAudio = null;
    };

    await _activeAudio.play();
    _cachedPiperAvailable = true;
    return true;
  } catch (err: any) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      console.warn("[PiperTTS] Request timed out — server may be starting up.");
    } else {
      console.warn("[PiperTTS] Unavailable:", err?.message ?? err);
    }
    _cachedPiperAvailable = false;
    return false;
  }
}

/**
 * Stops any currently playing Piper TTS audio.
 */
export function stopPiperTTS(): void {
  if (_activeAudio) {
    _activeAudio.pause();
    _activeAudio.currentTime = 0;
    _activeAudio = null;
  }
}
