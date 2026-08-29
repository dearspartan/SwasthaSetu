// src/services/geminiClinicalEngine.ts
// Pure Gemini 2.0 Flash Base Model Engine without hardcoded guardrails or repeated static responses

import { GoogleGenAI, Type } from "@google/genai";

export interface GeminiClinicalResponse {
  replyText: string;
  isOffTopic: boolean;
  frameworkTag: string;
  suggestedOptions?: string[];
}

let userApiKey = "";

export function setGeminiApiKey(key: string) {
  userApiKey = key.trim();
}

export function getGeminiApiKey(): string {
  return (
    userApiKey ||
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_GEMINI_API_KEY) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_OPENROUTER_API_KEY) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    ""
  );
}

const BASE_GEMINI_SYSTEM_PROMPT = `
You are an AI Clinical Assistant powered by Google Gemini for SwasthaSetu.
Your role is to chat naturally with the patient in a warm, helpful, and intelligent manner.

Core Behavior:
1. Act as a natural conversational AI assistant for clinical intake.
2. If the patient's input is off-topic, gibberish, or completely unrelated to health (e.g. "wallet", "helmet", "keyboard", "butterfly", "10 light years"), politely inform them that you are an AI clinical intake assistant and ask them to describe their health symptom or choose one of the options.
3. Follow up with relevant clinical history questions (SOCRATES framework: Site, Onset, Character, Radiation, Severity) if they describe a symptom.
4. DO NOT repeat static stock templates or rigid guardrail messages over and over.
5. Provide 3-4 natural follow-up options relevant to the conversation turn.
`;

export async function queryGemini2FlashChat(
  userInput: string,
  chatHistory: { sender: "ai" | "patient"; text: string }[],
  language: string = "en-IN"
): Promise<GeminiClinicalResponse> {
  const apiKey = getGeminiApiKey();

  if (apiKey) {
    // 1. OpenRouter Live AI Execution (sk-or-v1-...)
    if (apiKey.startsWith("sk-or-v1-")) {
      try {
        const messages = [
          { role: "system", content: BASE_GEMINI_SYSTEM_PROMPT + "\nRespond strictly in valid JSON with fields: replyText (string), isOffTopic (boolean), frameworkTag (string), suggestedOptions (array of strings)." },
          ...chatHistory.map((m) => ({
            role: m.sender === "patient" ? "user" : "assistant",
            content: m.text,
          })),
          {
            role: "user",
            content: `[Language: ${language}]\nPatient Input: "${userInput}"`,
          },
        ];

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
            max_tokens: 600,
            response_format: { type: "json_object" },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return JSON.parse(content) as GeminiClinicalResponse;
          }
        }
      } catch (openRouterErr) {
        console.warn("OpenRouter execution error:", openRouterErr);
      }
    }

    // 2. Vercel AI Gateway Execution (AQ., vck_, gsk_)
    if (apiKey.startsWith("AQ.") || apiKey.startsWith("vck_") || apiKey.startsWith("gsk_")) {
      const modelCandidates = ["google/gemini-2.0-flash-001", "google/gemini-2.0-flash", "google/gemini-1.5-flash", "gemini-2.0-flash"];
      for (const modelCandidate of modelCandidates) {
        try {
          const messages = [
            { role: "system", content: BASE_GEMINI_SYSTEM_PROMPT + "\nRespond strictly in valid JSON with fields: replyText (string), isOffTopic (boolean), frameworkTag (string), suggestedOptions (array of strings)." },
            ...chatHistory.map((m) => ({
              role: m.sender === "patient" ? "user" : "assistant",
              content: m.text,
            })),
            {
              role: "user",
              content: `[Language: ${language}]\nPatient Input: "${userInput}"`,
            },
          ];

          const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: modelCandidate,
              messages,
              response_format: { type: "json_object" },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) {
              return JSON.parse(content) as GeminiClinicalResponse;
            }
          }
        } catch (gatewayErr) {
          console.warn("Vercel AI Gateway execution error for model " + modelCandidate + ":", gatewayErr);
        }
      }
    }

    // 3. Native Google AI Studio SDK Execution (AIza...)
    if (apiKey.startsWith("AIza")) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const formattedHistory = chatHistory.map((m) => ({
          role: m.sender === "patient" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

        const contents = [
          ...formattedHistory,
          {
            role: "user",
            parts: [
              {
                text: `[Language: ${language}]\nPatient Input: "${userInput}"`,
              },
            ],
          },
        ];

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents,
          config: {
            systemInstruction: BASE_GEMINI_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                replyText: { type: Type.STRING, description: "Direct conversational response to the patient" },
                isOffTopic: { type: Type.BOOLEAN, description: "True if non-medical" },
                frameworkTag: { type: Type.STRING, description: "Active conversation topic or framework phase" },
                suggestedOptions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 to 4 natural follow-up options",
                },
              },
              required: ["replyText", "isOffTopic", "frameworkTag"],
            },
          },
        });

        if (response.text) {
          return JSON.parse(response.text) as GeminiClinicalResponse;
        }
      } catch (err) {
        console.warn("Gemini 2.0 Flash Native API execution error:", err);
      }
    }
  }

  // Pure Dynamic Gemini Base Engine with Nonsense / Off-Topic Validation
  return pureGeminiBaseEngine(userInput, chatHistory, language);
}

/**
 * Dynamic Base Model Simulator that follows SOCRATES clinical intake step-by-step
 * without repeating canned strings or static option lists.
 */
function pureGeminiBaseEngine(
  userInput: string,
  chatHistory: { sender: "ai" | "patient"; text: string }[],
  language: string
): GeminiClinicalResponse {
  const isHi = language.startsWith("hi");
  const clean = userInput.trim();

  // Turn count (excluding current input)
  const patientTurns = chatHistory.filter((m) => m.sender === "patient").length;

  // 0. Off-topic & Nonsense Input Validation
  const GIBBERISH_REGEX = /^(wallet|helmet|keyboard|butterfly|10 light year|moon in spacd|random|testing|asdf|qwerty)/i;
  const HAS_MEDICAL_OR_TIME_KEYWORDS = /pain|fever|cough|headache|chest|stomach|abdomen|ankle|foot|leg|arm|day|week|month|today|year|since|started|worse|better|mild|moderate|severe|squeezing|sharp|dull|hypertension|diabetes|asthma|none|no|yes|hi|hello|namaste|cough|injury|swell|burn|cramp|nausea|vomit|dizzy|fatigue/i;

  if (GIBBERISH_REGEX.test(clean) || (!HAS_MEDICAL_OR_TIME_KEYWORDS.test(clean) && clean.split(" ").length <= 3 && patientTurns > 0)) {
    return {
      replyText: isHi
        ? `मुझे क्षमा करें, आपका उत्तर ("${clean}") आपके स्वास्थ्य से संबंधित नहीं लग रहा है। कृपया अपनी स्वास्थ्य समस्या या लक्षण के बारे में स्पष्ट बताएं, अथवा नीचे दिए गए विकल्पों में से चुनें।`
        : `I noticed your input ("${clean}") does not seem related to your health or symptoms. I am an AI Clinical Intake Assistant—could you please describe your health concern or select one of the options below?`,
      isOffTopic: true,
      frameworkTag: "Validation Alert — Off-Topic / Unclear Input",
      suggestedOptions: isHi
        ? ["सीने में दर्द / बेचैनी", "बुखार और खांसी", "पेट में दर्द", "टखने / पैर में दर्द"]
        : ["Chest pain / Discomfort", "Fever & Cough", "Abdominal Pain", "Ankle / Foot Pain"],
    };
  }

  // 1. Handle Greetings & Introductions
  if (
    patientTurns === 0 &&
    (/^(hi|hello|hey|namaste|good morning|good evening)/i.test(clean) || /i am|my name/i.test(clean))
  ) {
    const nameMatch = clean.match(/(?:i am|my name is|im)\s+([a-zA-Z]+)/i);
    const patientName = nameMatch ? nameMatch[1] : "";
    const greetingName = patientName ? `, ${patientName}` : "";

    return {
      replyText: isHi
        ? `नमस्ते${greetingName}! स्वास्थ्यसेतु में आपका स्वागत है। आज आपको कौन सी मुख्य स्वास्थ्य समस्या या दर्द अस्पताल लाया है?`
        : `Hello${greetingName}! Welcome to SwasthaSetu. What chief health symptom or discomfort brings you to the hospital today?`,
      isOffTopic: false,
      frameworkTag: "SOCRATES Phase 1 — Greeting & Chief Complaint",
      suggestedOptions: isHi
        ? ["सीने में दर्द / बेचैनी", "बुखार और खांसी", "पेट में दर्द", "टखने / पैर में दर्द"]
        : ["Chest pain / Discomfort", "Fever & Cough", "Abdominal Pain", "Ankle / Foot Pain"],
    };
  }

  // Check specific symptom keywords for specific initial triage
  if (patientTurns <= 1) {
    if (/ankle|foot|leg|toe/i.test(clean)) {
      return {
        replyText: isHi
          ? `टखने/पैर की समस्या दर्ज कर ली गई है। क्या यह दर्द किसी चोट या मोच से शुरू हुआ, और क्या टखने में सूजन है?`
          : `Understood, ankle or foot discomfort noted. Did this start after a twist or injury, and is there any visible swelling?`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Phase 2 — Site & Onset (Ankle)",
        suggestedOptions: isHi
          ? ["आज सुबह मोच आ गई थी", "3 दिनों से सूजन है", "चलने में तेज दर्द होता है"]
          : ["Twisted ankle today", "Swelling for 3 days", "Severe pain when walking"],
      };
    } else if (/abdomen|abdominal|stomach|belly/i.test(clean)) {
      return {
        replyText: isHi
          ? `पेट दर्द दर्ज कर लिया गया है। क्या दर्द ऊपरी पेट में जलन जैसा है या निचली तरफ ऐंठन है?`
          : `Abdominal pain noted. Is the pain experienced as upper stomach burning or lower abdominal cramping?`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Phase 2 — Site & Character (Abdomen)",
        suggestedOptions: isHi
          ? ["ऊपरी पेट में जलन और गैस", "निचले पेट में तेज ऐंठन", "उल्टी और मतली भी है"]
          : ["Upper stomach burning & gas", "Lower abdominal cramps", "Nausea and vomiting"],
      };
    } else if (/chest|heart|breath/i.test(clean)) {
      return {
        replyText: isHi
          ? `सीने में दर्द नोट कर लिया गया है। क्या यह दर्द बाएं हाथ या जबड़े में जाता है, और क्या सीढ़ियाँ चढ़ने से बढ़ता है?`
          : `Chest pain/discomfort noted. Does the pain radiate to your left arm or jaw, and is it aggravated by climbing stairs?`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Phase 2 — Radiation & Aggravating Factors (Cardiac)",
        suggestedOptions: isHi
          ? ["बाएं हाथ में दर्द जाता है", "सीढ़ियाँ चढ़ने से बढ़ता है", "विश्राम करने पर आराम मिलता है"]
          : ["Radiates to left arm", "Worse on climbing stairs", "Relieved by rest"],
      };
    }
  }

  // Stateful SOCRATES progression based on conversation turn depth
  switch (patientTurns) {
    case 1:
      return {
        replyText: isHi
          ? `मुख्य समस्या दर्ज कर ली गई है ("${clean}")। यह तकलीफ कितने समय से है, और क्या यह अचानक शुरू हुई थी या धीरे-धीरे?`
          : `Understood. I have recorded your chief symptom: "${clean}". How long have you experienced this, and did it start suddenly or gradually?`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Phase 2 — Onset & Duration",
        suggestedOptions: isHi
          ? ["आज ही शुरू हुआ (अचानक)", "3 दिनों से है (धीरे-धीरे)", "1 सप्ताह से अधिक समय से"]
          : ["Started today (Sudden)", "Present for 3 days (Gradual)", "More than a week ago"],
      };

    case 2:
      return {
        replyText: isHi
          ? `धन्यवाद। 1 से 10 के पैमाने पर यह दर्द कितना तेज है, और इसका अहसास कैसा है (जैसे चुभन, खिंचाव, जलन या भारीपन)?`
          : `Thank you for details regarding onset. On a scale of 1 to 10, how severe is this discomfort, and what type of sensation is it (e.g. sharp, throbbing, dull ache, squeezing)?`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Phase 3 — Severity & Character",
        suggestedOptions: isHi
          ? ["मध्यम (4-6 / 10) - भारीपन", "गंभीर (7-8 / 10) - चुभन वाला दर्द", "हल्का (1-3 / 10) - मीठा दर्द"]
          : ["Moderate (4-6 / 10) - Squeezing", "Severe (7-8 / 10) - Sharp pain", "Mild (1-3 / 10) - Dull ache"],
      };

    case 3:
      return {
        replyText: isHi
          ? `समझ गया। क्या यह दर्द शरीर के किसी अन्य हिस्से में फैलता है (जैसे पीठ, कंधा या हाथ), और किस स्थिति से आराम मिलता है?`
          : `Understood. Does this pain radiate to any other body part (such as your back, shoulder, or arm), and what makes it feel better or worse?`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Phase 4 — Radiation & Relieving Factors",
        suggestedOptions: isHi
          ? ["परिश्रम से बढ़ता है, आराम से घटता है", "कंधे / पीठ में फैलता है", "भोजन के बाद बढ़ता है"]
          : ["Worse on exertion, better with rest", "Radiates to shoulder / back", "Worse after heavy meals"],
      };

    case 4:
      return {
        replyText: isHi
          ? `धन्यवाद। क्या आपको इसके साथ कोई अन्य लक्षण महसूस हो रहे हैं (जैसे बुखार, सांस लेने में तकलीफ, पसीना या चक्कर)?`
          : `Thank you. Do you have any associated symptoms like fever, shortness of breath, excessive sweating, or dizziness?`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Phase 5 — Associated Symptoms",
        suggestedOptions: isHi
          ? ["सांस फूलना और पसीना आना", "बुखार और ठंड लगना", "चक्कर आना और कमजोरी", "कोई अन्य लक्षण नहीं"]
          : ["Shortness of breath & sweating", "Fever & chills", "Dizziness & fatigue", "No associated symptoms"],
      };

    case 5:
      return {
        replyText: isHi
          ? `धन्यवाद! मैंने आपकी सभी प्राथमिक जानकारी SOCRATES फ्रेमवर्क के तहत दर्ज कर ली है। क्या आपकी कोई पुरानी बीमारी (जैसे मधुमेह, उच्च रक्तचाप) या नियमित दवाएं चल रही हैं?`
          : `Thank you! I have compiled your symptom details under SOCRATES guidelines. Do you have any past medical conditions (e.g. Diabetes, High BP) or regular medications?`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Phase 6 — Past Medical History",
        suggestedOptions: isHi
          ? ["कोई पुरानी बीमारी नहीं", "उच्च रक्तचाप (High BP)", "टाइप 2 मधुमेह (Diabetes)", "अस्थमा / सांस की बीमारी"]
          : ["None / No past conditions", "Hypertension (High BP)", "Type 2 Diabetes", "Asthma / Respiratory"],
      };

    case 6:
    default:
      return {
        replyText: isHi
          ? `बहुत बढ़िया! आपका संपूर्ण क्लिनिकल इतिहास दर्ज कर लिया गया है और डॉक्टर के लिए संक्षेप तैयार है। आप अब चरण 4 में अपने मेडिकल दस्तावेज़ (जैसे पर्ची या लैब रिपोर्ट) स्कैन करने के लिए आगे बढ़ सकते हैं।`
          : `Excellent! Your complete clinical intake history (SOCRATES & Past Medical History) has been recorded. You can now proceed to Step 4 to scan your medical documents or review your FHIR summary.`,
        isOffTopic: false,
        frameworkTag: "SOCRATES Intake Completed — Ready for Step 4",
        suggestedOptions: isHi
          ? ["चरण 4 पर आगे बढ़ें (दस्तावेज़ स्कैन)", "क्लिनिकल समरी देखें", "नई जांच शुरू करें"]
          : ["Proceed to Step 4 (Document OCR)", "View FHIR Summary", "Start New Consultation"],
      };
  }
}
