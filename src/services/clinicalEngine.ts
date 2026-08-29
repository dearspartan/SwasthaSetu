// src/services/clinicalEngine.ts
// Smart Clinical Intake Engine using SOCRATES / OLDCARTS Frameworks with Off-Topic & Nonsense Guardrails

export interface SOCRATESState {
  site?: string; // Where is the pain?
  onset?: string; // Sudden vs Gradual, 3 days ago
  character?: string; // Squeezing, sharp, burning, dull
  radiation?: string; // Radiates to left arm/jaw
  associations?: string; // Sweating, nausea, shortness of breath
  timeCourse?: string; // Continuous vs intermittent
  exacerbating?: string; // Exertion, stairs, food
  relieving?: string; // Rest, antacids
  severity?: string; // 1-10
  currentStep: number; // SOCRATES step index (0..7)
}

// Medical keywords for intent recognition
const MEDICAL_SYMPTOM_KEYWORDS = [
  "pain", "chest", "fever", "cough", "headache", "stomach", "vomiting", "nausea",
  "dizziness", "breath", "shortness", "arm", "back", "leg", "joint", "swelling",
  "blood", "pressure", "sugar", "heart", "rash", "itching", "cold", "flu",
  "throat", "infection", "weakness", "fatigue", "burning", "acidity", "gas",
  "दर्द", "सीना", "बुखार", "खांसी", "सिरदर्द", "पेट", "सांस", "तकलीफ", "उल्टी", "थकान"
];

const TIME_DURATION_KEYWORDS = [
  "day", "days", "hour", "hours", "week", "weeks", "month", "months", "today",
  "yesterday", "ago", "since", "morning", "night", "started", "दिन", "घंटे", "हफ्ते"
];

const EXACERBATING_KEYWORDS = [
  "stair", "stairs", "exertion", "walk", "walking", "running", "food", "eat",
  "lying", "breath", "climbing", "work", "सीढ़ी", "चढ़ने", "चलने", "काम"
];

/**
 * Validates if the user input is a plausible clinical response vs off-topic / nonsense (e.g. "Gorilla")
 */
export function isOffTopicInput(input: string): boolean {
  const clean = input.trim().toLowerCase();
  if (clean.length < 2) return true;

  // Single word checks for common non-medical nouns/random words
  const randomNouns = [
    "gorilla", "monkey", "banana", "apple", "car", "football", "cricket", "movie",
    "alien", "robot", "game", "song", "table", "chair", "pizza", "burger", "xyz"
  ];
  if (randomNouns.includes(clean)) return true;

  // Check if input contains any medical, duration, anatomical, or descriptive keywords
  const hasMedicalWord = MEDICAL_SYMPTOM_KEYWORDS.some((kw) => clean.includes(kw));
  const hasTimeWord = TIME_DURATION_KEYWORDS.some((kw) => clean.includes(kw));
  const hasExacerWord = EXACERBATING_KEYWORDS.some((kw) => clean.includes(kw));

  // If input is short (< 15 chars) and has zero medical/time/qualifying keywords, flag as off-topic
  if (clean.length < 15 && !hasMedicalWord && !hasTimeWord && !hasExacerWord) {
    // Check if it's a simple number (severity e.g. "7")
    if (!isNaN(Number(clean))) return false;
    return true;
  }

  return false;
}

/**
 * Formulates smart adaptive SOCRATES response based on parsed input & current state
 */
export function processClinicalInput(
  userInput: string,
  state: SOCRATESState,
  lang: string = "en-IN"
): {
  aiText: string;
  isOffTopic: boolean;
  nextOptions?: string[];
  frameworkTag: string;
  newState: SOCRATESState;
} {
  const isHi = lang.startsWith("hi");
  const isOffTopic = isOffTopicInput(userInput);

  // 1. Off-Topic / Nonsense Guardrail Response
  if (isOffTopic) {
    return {
      aiText: isHi
        ? `मैं समझ गया, लेकिन "${userInput}" एक स्वास्थ्य लक्षण या दर्द का विवरण नहीं लगता है। आपकी डॉक्टर की बेहतर मदद के लिए, क्या आप अपनी शारीरिक समस्या के बारे में बता सकते हैं (जैसे दर्द कहाँ है या कब शुरू हुआ)?`
        : `I noticed "${userInput}" doesn't seem to describe a health symptom or medical complaint. To help your doctor evaluate your condition, could you please describe your health concern (e.g., where is your discomfort, or when did it start)?`,
      isOffTopic: true,
      nextOptions: isHi
        ? ["सीने में दर्द / बेचैनी", "बुखार और खांसी", "पेट में दर्द", "सिरदर्द"]
        : ["Chest pain / Discomfort", "Fever & Cough", "Abdominal Pain", "Headache"],
      frameworkTag: "Guardrail — Off-Topic Input Refocused",
      newState: state,
    };
  }

  // 2. Progressive SOCRATES / OLDCARTS Questions
  const nextStep = state.currentStep + 1;
  const updatedState: SOCRATESState = { ...state, currentStep: nextStep };

  switch (nextStep) {
    case 1:
      // Step 1 -> Ask Onset & Duration
      updatedState.site = userInput;
      return {
        aiText: isHi
          ? `धन्यवाद। आपने बताया: "${userInput}"। यह तकलीफ कब शुरू हुई (जैसे 2 घंटे पहले या 3 दिन से), और क्या दर्द अचानक शुरू हुआ था?`
          : `Thank you for specifying "${userInput}". How long have you experienced this discomfort (e.g. 2 hours ago or 3 days), and did it start suddenly or gradually?`,
        isOffTopic: false,
        nextOptions: isHi
          ? ["3 दिन पहले शुरू हुआ, धीरे-धीरे", "आज सुबह अचानक", "1 सप्ताह से अधिक"]
          : ["Started 3 days ago, gradual", "Started suddenly this morning", "More than a week ago"],
        frameworkTag: "SOCRATES — Onset & Duration",
        newState: updatedState,
      };

    case 2:
      // Step 2 -> Ask Character & Radiation
      updatedState.onset = userInput;
      return {
        aiText: isHi
          ? `समझ गया। यह दर्द कैसा महसूस होता है (जैसे भारीपन, चुभन या जलन), और क्या यह दर्द शरीर में कहीं और जाता है (जैसे बाएं हाथ, जबड़े या पीठ में)?`
          : `Understood. What does the discomfort feel like (e.g. squeezing pressure, sharp, or burning), and does the pain radiate anywhere else (e.g., left arm, jaw, or back)?`,
        isOffTopic: false,
        nextOptions: isHi
          ? ["सीने में भारीपन, बाएं हाथ में जाता है", "जलन जैसा दर्द", "तेज चुभने वाला दर्द"]
          : ["Squeezing pressure, radiates to left arm", "Burning chest pain", "Sharp stabbing pain"],
        frameworkTag: "SOCRATES — Character & Radiation",
        newState: updatedState,
      };

    case 3:
      // Step 3 -> Ask Exacerbating & Relieving Factors
      updatedState.character = userInput;
      return {
        aiText: isHi
          ? `नोट कर लिया गया है। किस वजह से दर्द बढ़ता या कम होता है? उदाहरण के लिए, क्या सीढ़ियाँ चढ़ने या परिश्रम करने पर दर्द बढ़ता है?`
          : `Got it. What makes the pain worse or better? For example, is it aggravated by exertion, climbing stairs, or deep breathing?`,
        isOffTopic: false,
        nextOptions: isHi
          ? ["सीढ़ियाँ चढ़ने / परिश्रम से बढ़ता है", "भारी भोजन के बाद बढ़ता है", "विश्राम करने से कम होता है"]
          : ["Worse on exertion / stairs", "Worse after heavy meals", "Relieved by rest"],
        frameworkTag: "SOCRATES — Exacerbating & Relieving Factors",
        newState: updatedState,
      };

    case 4:
      // Step 4 -> Ask Severity (0-10)
      updatedState.exacerbating = userInput;
      return {
        aiText: isHi
          ? `0 से 10 के पैमाने पर आप इस दर्द को कितना नंबर देंगे (जहाँ 0 कोई दर्द नहीं और 10 असहनीय दर्द है)?`
          : `On a scale of 0 to 10 (where 0 is no pain and 10 is unbearable pain), how severe is your discomfort right now?`,
        isOffTopic: false,
        nextOptions: ["3 / 10 (Halka)", "6 / 10 (Moderate)", "8 / 10 (Severe)"],
        frameworkTag: "SOCRATES — Severity Scale (0-10)",
        newState: updatedState,
      };

    default:
      // Step 5 -> Completion
      updatedState.severity = userInput;
      return {
        aiText: isHi
          ? `आपके विस्तृत उत्तरों के लिए धन्यवाद। मैंने SOCRATES और OLDCARTS मानकों के तहत आपका संपूर्ण क्लिनिकल इतिहास दर्ज कर लिया है। अब हम आपके चिकित्सा दस्तावेजों को स्कैन करने के लिए आगे बढ़ सकते हैं।`
          : `Thank you for providing those detailed inputs. I have structured your clinical history under SOCRATES and OLDCARTS frameworks. We can now proceed to scan your medical records.`,
        isOffTopic: false,
        frameworkTag: "Intake Complete · SOCRATES Structured",
        newState: updatedState,
      };
  }
}
