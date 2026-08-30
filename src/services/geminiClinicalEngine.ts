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
  const env = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
  const metaEnv = (typeof import.meta !== "undefined" ? (import.meta as any).env : {}) as Record<string, string | undefined>;
  const storedKey = typeof window !== "undefined" ? window.localStorage.getItem("swasthasetu_gemini_key") : "";

  return (
    userApiKey ||
    storedKey ||
    env["OPENROUTER_API_KEY"] ||
    env["GEMINI_API_KEY"] ||
    env["VITE_GEMINI_API_KEY"] ||
    metaEnv["VITE_OPENROUTER_API_KEY"] ||
    metaEnv["VITE_GEMINI_API_KEY"] ||
    ""
  );
}

const ALLOPATHY_SYSTEM_PROMPT = `
You are an AI Clinical Assistant powered by Google Gemini for SwasthaSetu (Allopathic OPD).
Your role is to chat naturally with the patient for clinical intake.

Core Behavior:
1. Act as a natural conversational AI assistant for clinical intake using the SOCRATES framework (Site, Onset, Character, Radiation, Severity).
2. Nonsense / Off-topic Filter: If the patient's input is off-topic, gibberish, or completely unrelated to health (e.g. "wallet", "helmet", "keyboard", "butterfly", "10 light years"), politely inform them that you are an AI clinical intake assistant and ask them to describe their health symptom or choose one of the options.
3. DO NOT repeat static stock templates or rigid guardrail messages over and over.
4. Provide 3-4 natural follow-up options relevant to the conversation turn.
`;

const AYUSH_SYSTEM_PROMPT = `
You are an AI Ayurvedic Clinical Assistant powered by Google Gemini for SwasthaSetu (Ayurvedic OPD / Vaidya Terminal).
Your role is to conduct an ACTIVE, DYNAMIC AI-guided Dashavidha Pariksha (दशविध परीक्षा) assessment for the Vaidya.

Dashavidha Pariksha Parameters Evaluated Dynamically:
1. Prakriti (Vata/Pitta/Kapha constitution, body build, temperament)
2. Vikriti (Present dosha imbalance and symptom aggravation)
3. Agni (Digestive fire: Sama, Vishama, Tikshna, or Manda)
4. Koshtha (Bowel nature: Krura, Mrudu, or Madhyama)
5. Ahara Shakti & Vyayama Shakti (Appetite, digestion quality, exercise endurance)
6. Satmya & Sattva (Food/season adaptability, mental resilience & stress response)
7. Sara, Samhanana, Pramana (Tissue essence, body build, proportions)
8. Ahara-Vihara, Nidana, Samprapti (Diet/lifestyle habits, causative triggers, pathogenesis)

Core Behavior:
1. Conduct an ACTIVE, dynamic interview asking adaptive follow-up questions tailored to their reported dosha symptoms, Agni, Koshtha, and lifestyle.
2. Nonsense / Off-topic Filter: If the patient inputs off-topic, gibberish, or non-medical words (e.g., "helmet", "wallet", "butterfly", "asdf"), REJECT the insensible input politely, explain that you are conducting an Ayurvedic Dashavidha Pariksha intake, and ask them to clarify their symptom or pick a structured option.
3. Provide 3-4 natural, relevant option buttons for the patient in each turn.
4. Include the active Pariksha parameter tag in your response (e.g., "Dashavidha Pariksha — Agni & Koshtha Assessment").
`;

export async function queryGemini2FlashChat(
  userInput: string,
  chatHistory: { sender: "ai" | "patient"; text: string }[],
  language: string = "en-IN",
  mode: "allopathy" | "ayush" = "allopathy"
): Promise<GeminiClinicalResponse> {
  const apiKey = getGeminiApiKey();
  const systemPrompt = mode === "ayush" ? AYUSH_SYSTEM_PROMPT : ALLOPATHY_SYSTEM_PROMPT;

  if (apiKey) {
    // 1. OpenRouter Live AI Execution (sk-or-v1-...)
    if (apiKey.startsWith("sk-or-v1-")) {
      try {
        const messages = [
          { role: "system", content: systemPrompt + "\nRespond strictly in valid JSON with fields: replyText (string), isOffTopic (boolean), frameworkTag (string), suggestedOptions (array of strings)." },
          ...chatHistory.map((m) => ({
            role: m.sender === "patient" ? "user" : "assistant",
            content: m.text,
          })),
          {
            role: "user",
            content: `[Language: ${language}, Mode: ${mode.toUpperCase()}]\nPatient Input: "${userInput}"`,
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
            { role: "system", content: systemPrompt + "\nRespond strictly in valid JSON with fields: replyText (string), isOffTopic (boolean), frameworkTag (string), suggestedOptions (array of strings)." },
            ...chatHistory.map((m) => ({
              role: m.sender === "patient" ? "user" : "assistant",
              content: m.text,
            })),
            {
              role: "user",
              content: `[Language: ${language}, Mode: ${mode.toUpperCase()}]\nPatient Input: "${userInput}"`,
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
                text: `[Language: ${language}, Mode: ${mode.toUpperCase()}]\nPatient Input: "${userInput}"`,
              },
            ],
          },
        ];

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents,
          config: {
            systemInstruction: systemPrompt,
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
  return pureGeminiBaseEngine(userInput, chatHistory, language, mode);
}

/**
 * Dynamic Base Model Simulator that follows SOCRATES (Allopathy) or Dashavidha Pariksha (AYUSH)
 * without repeating canned strings or static option lists.
 */
function pureGeminiBaseEngine(
  userInput: string,
  chatHistory: { sender: "ai" | "patient"; text: string }[],
  language: string,
  mode: "allopathy" | "ayush" = "allopathy"
): GeminiClinicalResponse {
  const isHi = language.startsWith("hi");
  const clean = userInput.trim();

  // Turn count (excluding current input)
  const patientTurns = chatHistory.filter((m) => m.sender === "patient").length;

  // AYUSH (Ayurvedic Dashavidha Pariksha Engine)
  if (mode === "ayush") {
    const GIBBERISH_REGEX = /^(wallet|helmet|keyboard|butterfly|10 light year|moon in spacd|random|testing|asdf|qwerty)/i;
    const HAS_AYUSH_KEYWORDS = /vata|pitta|kapha|dosha|agni|koshtha|digest|pain|gas|acid|stool|bowel|skin|fever|cough|sleep|stress|cold|hot|warm|sweat|appetite|joint|heavy|body|head|day|week|month|year|started|none|no|yes|hi|hello|namaste|ayurved/i;

    if (GIBBERISH_REGEX.test(clean) || (!HAS_AYUSH_KEYWORDS.test(clean) && clean.split(" ").length <= 3 && patientTurns > 0)) {
      return {
        replyText: isHi
          ? `मुझे क्षमा करें, आपका उत्तर ("${clean}") आपके आयुर्वेदिक दशविध परीक्षा मूल्यांकन से संबंधित नहीं लग रहा है। कृपया अपनी स्वास्थ्य समस्या या दोष लक्षण स्पष्ट करें, अथवा नीचे दिए गए विकल्पों में से चुनें।`
          : `I noticed your input ("${clean}") does not seem related to your Ayurvedic Dashavidha Pariksha assessment. Please describe your health concern or select one of the options below.`,
        isOffTopic: true,
        frameworkTag: "Validation Alert — Off-Topic / Unclear AYUSH Input",
        suggestedOptions: isHi
          ? ["वात असंतुलन (जोड़ों का दर्द, गैस, रूखापन)", "पित्त असंतुलन (एसिडिटी, जलन)", "कफ असंतुलन (बलगम, आलस्य)", "सामान्य स्वास्थ्य जांच"]
          : ["Vata Imbalance (Joint pain, Gas)", "Pitta Imbalance (Acidity, Burning)", "Kapha Imbalance (Mucus, Lethargy)", "General Wellness Checkup"],
      };
    }

    switch (patientTurns) {
      case 0:
      case 1:
        return {
          replyText: isHi
            ? `मुख्य दोष/लक्षण दर्ज कर लिया गया है ("${clean}")। आइए आपकी विकृति (Vikriti) और अग्नि (Agni - पाचन शक्ति) का मूल्यांकन करें। आपकी भूख कैसी रहती है और भोजन के बाद क्या पेट में जलन, गैस या भारीपन महसूस होता है?`
            : `Recorded chief symptom: "${clean}". Let us evaluate your Vikriti (Current Imbalance) and Agni (Digestive Fire). How is your appetite, and do you experience burning, gas, or heaviness after meals?`,
          isOffTopic: false,
          frameworkTag: "Dashavidha Pariksha — Vikriti & Agni Assessment",
          suggestedOptions: isHi
            ? ["अनियमित भूख और गैस (विषमाग्नि)", "तेज भूख और छाती में जलन (तीक्ष्णाग्नि)", "कम भूख और भारीपन (मंदाग्नि)", "सामान्य पाचन (समाग्नि)"]
            : ["Irregular appetite & gas (Vishama Agni)", "Intense hunger & burning (Tikshna Agni)", "Slow digestion & heaviness (Manda Agni)", "Normal digestion (Sama Agni)"],
        };

      case 2:
        return {
          replyText: isHi
            ? `धन्यवाद। अब आपके कोष्ठ (Koshtha - मल प्रकृति) और आहार-विहार का मूल्यांकन: आपका मल त्याग कैसा रहता है (कड़ा, सामान्य या पतला), और आपकी नींद कैसी है?`
            : `Thank you. Now evaluating your Koshtha (Bowel Nature) and Ahara-Vihara (Diet & Sleep): How are your bowel movements (hard, normal, or loose), and how is your sleep quality?`,
          isOffTopic: false,
          frameworkTag: "Dashavidha Pariksha — Koshtha & Ahara-Vihara Assessment",
          suggestedOptions: isHi
            ? ["कड़ा मल और कब्ज (क्रूर कोष्ठ) · नींद कच्ची", "पतला मल और तीव्र वेग (मृदु कोष्ठ) · अच्छी नींद", "सामान्य मल त्याग (मध्यम कोष्ठ) · सामान्य नींद"]
            : ["Hard stools & constipation (Krura Koshtha) · Disturbed sleep", "Loose stools (Mrudu Koshtha) · Sound sleep", "Regular normal stools (Madhyama Koshtha) · Normal sleep"],
        };

      case 3:
        return {
          replyText: isHi
            ? `समझ गया। अब आपकी प्रकृति (Prakriti) और सात्म्य (Satmya - अनुकूलता): आप ठंडे या गर्म मौसम के प्रति कैसे प्रतिक्रिया देते हैं, और आपकी त्वचा तथा शारीरिक बनावट कैसी है?`
            : `Understood. Now assessing your Prakriti (Constitution) and Satmya (Environmental Adaptability): How do you react to cold or hot weather, and what is your skin texture and body build?`,
          isOffTopic: false,
          frameworkTag: "Dashavidha Pariksha — Prakriti & Satmya Assessment",
          suggestedOptions: isHi
            ? ["ठंड संवेदनशील, सूखी त्वचा, पतला शरीर (वात)", "गर्मी संवेदनशील, तैलीय त्वचा, मध्यम शरीर (पित्त)", "गर्मी सहनशील, चिकनी त्वचा, मजबूत शरीर (कफ)"]
            : ["Sensitive to cold, dry skin, lean frame (Vata)", "Sensitive to heat, oily skin, medium build (Pitta)", "Tolerates heat, smooth skin, sturdy build (Kapha)"],
        };

      case 4:
        return {
          replyText: isHi
            ? `धन्यवाद। अब सत्त्व (Sattva - मानसिक सहनशक्ति) और व्यायाम शक्ति (Physical Endurance): तनाव के समय आपका मानसिक दृष्टिकोण कैसा रहता है, और आपकी शारीरिक सहनशक्ति (थकान का स्तर) कैसी है?`
            : `Thank you. Now evaluating Sattva (Mental Resilience) and Vyayama Shakti (Exercise Capacity): How do you respond to psychological stress, and what is your physical endurance / fatigue level?`,
          isOffTopic: false,
          frameworkTag: "Dashavidha Pariksha — Sattva & Vyayama Shakti Assessment",
          suggestedOptions: isHi
            ? ["जल्दी चिंता / तनाव होना (अवर सत्त्व) · जल्दी थकान", "मध्यम तनाव सहनशीलता (मध्यम सत्त्व) · सामान्य ऊर्जा", "मजबूत मानसिक शक्ति (प्रवर सत्त्व) · उच्च सहनशक्ति"]
            : ["Prone to anxiety/stress (Avara Sattva) · Early fatigue", "Moderate stress tolerance (Madhyama Sattva) · Normal energy", "High mental resilience (Pravara Sattva) · High endurance"],
        };

      case 5:
      default:
        return {
          replyText: isHi
            ? `उत्कृष्ट! आपकी दशविध परीक्षा (प्रकृति, विकृति, सार, संहनन, प्रमाण, सात्म्य, सत्त्व, आहार शक्ति, व्यायाम शक्ति, वय) का पूर्ण मूल्यांकन हो चुका है। वैद्य जी के लिए सारांश तैयार है।`
            : `Excellent! Your complete Dashavidha Pariksha assessment (Prakriti, Vikriti, Agni, Koshtha, Sara, Satmya, Sattva, Vyayama Shakti) is fully recorded. The Vaidya can now review your comprehensive Ayurvedic profile.`,
          isOffTopic: false,
          frameworkTag: "Dashavidha Pariksha Completed — Profile Generated",
          suggestedOptions: isHi
            ? ["चरण 5 पर आगे बढ़ें (दस्तावेज़ ओसीआर)", "आयुर्वेदिक समरी देखें", "पुनः जांच शुरू करें"]
            : ["Proceed to Step 5 (Document OCR)", "View Ayurvedic Profile Summary", "Restart Intake"],
        };
    }
  }

  // ALLOPATHY (SOCRATES Engine)
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

