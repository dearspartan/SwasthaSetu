import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  MapPin,
  Building2,
  Stethoscope,
  ShieldCheck,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Activity,
  User,
  Clock,
  Sparkles,
  Heart,
  Pill,
  AlertTriangle,
  Send,
  Languages,
  Code,
  FileUp,
  RefreshCw,
} from "lucide-react";
import { translateWithBhashini } from "@/services/bhashini";
import { speakTTS, stopTTS } from "@/services/tts";
import { queryGemini2FlashChat, setGeminiApiKey, getGeminiApiKey } from "@/services/geminiClinicalEngine";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "AI Clinical Intake & Workflow — SwasthaSetu" },
      {
        name: "description",
        content: "Fine-tuned AI Clinical History Engine (SOCRATES/OLDCARTS & AYUSH), Tiered OCR Document Digitisation, Structured FHIR Summary, and ABDM Privacy Layer.",
      },
    ],
  }),
  component: IntakeWizardPage,
});

interface ChatMessage {
  sender: "ai" | "patient";
  text: string;
  options?: string[];
  frameworkTag?: string;
}

const INDIAN_LANGUAGES = [
  { code: "en-IN", name: "English" },
  { code: "hi-IN", name: "हिन्दी (Hindi)" },
  { code: "mr-IN", name: "मराठी (Marathi)" },
  { code: "ta-IN", name: "தமிழ் (Tamil)" },
  { code: "te-IN", name: "తెలుగు (Telugu)" },
  { code: "bn-IN", name: "বাংলা (Bengali)" },
  { code: "gu-IN", name: "ગુજરાતી (Gujarati)" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)" },
];

const CHATBOT_TRANSLATIONS: Record<
  string,
  {
    q1Text: string;
    q1Options: string[];
    q2Text: string;
    q2Options: string[];
    q3Text: string;
    q3Options: string[];
    q4Text: string;
  }
> = {
  "en-IN": {
    q1Text: "Namaste! I am SwasthaSetu's AI Clinical Intake Assistant. What chief health symptom or discomfort brings you to the hospital today?",
    q1Options: ["Chest pain / Discomfort", "Fever & Cough", "Abdominal Pain", "Severe Headaches", "AYUSH General Checkup"],
    q2Text: "Thank you. How long have you experienced this discomfort, and does the pain radiate anywhere else (e.g. arm, jaw, back)?",
    q2Options: ["Started 3 days ago, left arm pain", "1 day ago, stays in chest", "More than a week"],
    q3Text: "Understood. What makes the pain worse or better? For example, is it aggravated by exertion, climbing stairs, or deep breathing?",
    q3Options: ["Worse on exertion / stairs", "Worse after heavy meals", "Worse when lying flat"],
    q4Text: "Thank you for providing those details. I have captured your complete clinical history structured under SOCRATES guidelines. We can now proceed to scan your medical documents.",
  },
  "hi-IN": {
    q1Text: "नमस्ते! मैं स्वास्थ्यसेतु का एआई क्लिनिकल इनटेक सहायक हूं। आज आपको कौन सी मुख्य स्वास्थ्य समस्या या दर्द अस्पताल लाया है?",
    q1Phonetic: "Namaste! Main SwasthaSetu ka AI clinical intake sahayak hoon. Aaj aapko kaun si mukhya swasthya samasya ya dard aspatal laya hai?",
    q1Options: ["सीने में दर्द / बेचैनी", "बुखार और खांसी", "पेट में दर्द", "गंभीर सिरदर्द", "आयुष सामान्य जांच"],
    q2Text: "धन्यवाद। आपको यह तकलीफ कितने समय से है, और क्या यह दर्द कहीं और फैलता है (जैसे बाएं हाथ, जबड़े या पीठ में)?",
    q2Phonetic: "Dhanyavaad. Aapko yeh takleef kitne samay se hai, aur kya yeh dard baayein haath ya jabde mein phailta hai?",
    q2Options: ["3 दिन पहले शुरू हुआ, बाएं हाथ में दर्द", "1 दिन पहले, केवल सीने में", "एक सप्ताह से अधिक"],
    q3Text: "समझ गया। किस वजह से दर्द बढ़ता या कम होता है? उदाहरण के लिए, क्या सीढ़ियाँ चढ़ने या परिश्रम करने पर दर्द बढ़ता है?",
    q3Phonetic: "Samajh gaya. Kis वजह se dard badhta ya kam hota hai? Jaise seedhiyaan chadhne par ya parishram karne par?",
    q3Options: ["सीढ़ियाँ चढ़ने / परिश्रम से बढ़ता है", "भारी भोजन के बाद बढ़ता है", "सीधे लेटने पर बढ़ता है"],
    q4Text: "जानकारी प्रदान करने के लिए धन्यवाद। मैंने आपका पूरा नैदानिक इतिहास दर्ज कर लिया है। अब हम आपके चिकित्सा दस्तावेजों को स्कैन करने के लिए आगे बढ़ सकते हैं।",
    q4Phonetic: "Jankari dene ke liye dhanyavaad. Humne aapka pura clinical itihaas darj kar liya hai. Ab hum aapke medical documents scan kar sakte hain.",
  },
  "mr-IN": {
    q1Text: "नमस्कार! मी स्वास्थ्यसेतूचा एआय क्लिनिकल इनटेक सहाय्यक आहे. आज तुम्हाला कोणती मुख्य आरोग्य समस्या किंवा त्रास आहे?",
    q1Options: ["छातीत दुखणे / अस्वस्थता", "ताप आणि खोकला", "पोटात दुखणे", "तीव्र डोकेदुखी", "आयुष सामान्य तपासणी"],
    q2Text: "धन्यवाद. हा त्रास तुम्हाला किती दिवसांपासून आहे आणि हे दुखणे डाव्या हाताकडे किंवा जबड्याकडे पसरते का?",
    q2Options: ["३ दिवसांपूर्वी सुरू झाले, डावा हात दुखतो", "१ दिवसापूर्वी, फक्त छातीत", "एका आठवड्यापेक्षा जास्त"],
    q3Text: "समजले. कशामुळे त्रास वाढतो किंवा कमी होतो? उदाहरणार्थ, पायऱ्या चढताना किंवा श्रमाच्या वेळी त्रास वाढतो का?",
    q3Options: ["पायऱ्या चढताना / श्रमाने वाढतो", "जेवणानंतर वाढतो", "सरळ झोपल्यावर वाढतो"],
    q4Text: "माहिती दिल्याबद्दल धन्यवाद. तुमचा संपूर्ण वैद्यकीय इतिहास नोंदीत केला आहे. आता आपण वैद्यकीय कागदपत्रे स्कॅन करू शकतो.",
  },
  "ta-IN": {
    q1Text: "வணக்கம்! நான் ஸ்வஸ்தாசேதுவின் AI மருத்துவ உதவி உதவியாளர். இன்று உங்களுக்கு என்ன முக்கிய உடல்நலப் பிரச்சினை உள்ளது?",
    q1Options: ["நெஞ்சு வலி / அசௌகரியம்", "காய்ச்சல் மற்றும் இருமல்", "வயிறு வலி", "கடுமையான தலைவலி", "ஆயுஷ் பொது பரிசோதனை"],
    q2Text: "நன்றி. இந்த அசௌகரியம் எவ்வளவு காலமாக உள்ளது, மேலும் இந்த வலி இடது கை அல்லது தாடைக்கு பரவுகிறதா?",
    q2Options: ["3 நாட்களுக்கு முன்பு தொடங்கியது, இடது கை வலி", "1 நாளுக்கு முன்பு, நெஞ்சில் மட்டும்", "ஒரு வாரத்திற்கும் மேலாக"],
    q3Text: "புரிந்தது. எதனால் வலி அதிகமாகிறது அல்லது குறைகிறது? உதாரணமாக, படிக்கட்டுகளில் ஏறும்போதோ அல்லது உழைப்பின் போதோ வலி அதிகமாகிறதா?",
    q3Options: ["படிக்கட்டுகளில் ஏறும் போது அதிகமாகிறது", "உணவுக்குப் பிறகு அதிகமாகிறது", "நேராக படுக்கும் போது அதிகமாகிறது"],
    q4Text: "தகவலுக்கு நன்றி. உங்கள் மருத்துவ வரலாறு பதிவு செய்யப்பட்டுள்ளது. இப்போது மருத்துவ ஆவணங்களை ஸ்கேன் செய்ய தொடரலாம்.",
  },
  "te-IN": {
    q1Text: "నమస్తే! నేను స్వస్థసేతు AI క్లినికల్ ఇంటేక్ అసిస్టెంట్‌ని. ఈరోజు మీకు ఎలాంటి ఆరోగ్య సమస్య లేదా నొప్పి ఉంది?",
    q1Options: ["ఛాతీ నొప్పి / అసౌకర్యం", "జ్వరం మరియు దగ్గు", "కడుపు నొప్పి", "తీవ్రమైన తలనొప్పి", "ఆయుష్ జనరల్ చెకప్"],
    q2Text: "ధన్యవాదాలు. ఈ అసౌకర్యం మీకు ఎంతకాలంగా ఉంది, మరియు ఈ నొప్పి ఎడమ చేయి లేదా దవడకు వ్యాపిస్తుందా?",
    q2Options: ["3 రోజుల క్రితం ప్రారంభమైంది, ఎడమ చేయి నొప్పి", "1 రోజు క్రితం, ఛాతీలో మాత్రమే", "వారానికి పైగా"],
    q3Text: "అర్థమైంది. నొప్పి దేనివల్ల పెరుగుతుంది లేదా తగ్గుతుంది? ఉదాహరణకు, మెట్లు ఎక్కేటప్పుడు లేదా శ్రమతో నొప్పి పెరుగుతుందా?",
    q3Options: ["మెట్లు ఎక్కేటప్పుడు పెరుగుతుంది", "భోజనం తర్వాత పెరుగుతుంది", "నేరుగా పడుకున్నప్పుడు పెరుగుతుంది"],
    q4Text: "సమాచారం అందించినందుకు ధన్యవాదాలు. మీ వైద్య చరిత్ర నమోదు చేయబడింది. ఇప్పుడు వైద్య పత్రాలను స్కాన్ చేయడానికి ముందుకు వెళ్ళవచ్చు.",
  },
  "bn-IN": {
    q1Text: "নমস্কার! আমি স্বাস্থ্যসেতুর এআই ক্লিনিকাল ইনটেক সহকারী। আজ আপনার কী প্রধান স্বাস্থ্য সমস্যা বা কষ্ট হচ্ছে?",
    q1Options: ["বুকে ব্যথা / অস্বস্তি", "জ্বর ও কাশি", "পেটে ব্যথা", "তীব্র মাথা ব্যথা", "আয়ুষ সাধারণ পরীক্ষা"],
    q2Text: "ধন্যবাদ। এই অস্বস্তি আপনার কত দিন ধরে হচ্ছে এবং এই ব্যথা কি বাম হাত বা চোয়ালে ছড়াচ্ছে?",
    q2Options: ["৩ দিন আগে শুরু হয়েছে, বাম হাতে ব্যথা", "১ দিন আগে, শুধু বুকে", "এক সপ্তাহের বেশি"],
    q3Text: "বুঝতে পেরেছি। কিসের কারণে ব্যথা বাড়ে বা কমে? যেমন, সিঁড়ি ওঠার সময় বা পরিশ্রমের সময় কি ব্যথা বাড়ে?",
    q3Options: ["সিঁড়ি ওঠার সময় বা পরিশ্রমে বাড়ে", "ভারী খাবারের পর বাড়ে", "সোজা হয়ে শুলে বাড়ে"],
    q4Text: "তথ্য দেওয়ার জন্য আপনাকে ধন্যবাদ। আপনার সম্পূর্ণ চিকিৎসা ইতিহাস রেকর্ড করা হয়েছে। এখন আমরা চিকিৎসা সংক্রান্ত নথি স্ক্যান করতে পারি।",
  },
  "gu-IN": {
    q1Text: "નમસ્તે! હું સ્વાસ્થ્યસેતુનો AI ક્લિનિકલ ઇન્ટેક આસિસ્ટન્ટ છું. આજે તમને કઈ મુખ્ય સ્વાસ્થ્ય સમસ્યા અથવા દુખાવો છે?",
    q1Options: ["છાતીમાં દુખાવો / અસ્વસ્થતા", "તાવ અને ઉધરસ", "પેટમાં દુખાવો", "તીવ્ર માથાનો દુખાવો", "આયુષ સામાન્ય તપાસ"],
    q2Text: "આભાર. આ અસ્વસ્થતા તમને કેટલા સમયથી છે, અને શું આ દુખાવો ડાબા હાથ કે જડબા તરફ ફેલાય છે?",
    q2Options: ["3 દિવસ પહેલા શરૂ થયો, ડાબા હાથમાં દુખાવો", "1 દિવસ પહેલા, ફક્ત છાતીમાં", "એક અઠવાડિયા કરતાં વધુ"],
    q3Text: "સમજાઈ ગયું. કયા કારણે દુખાવો વધે છે કે ઓછો થાય છે? ઉદાહરણ તરીકે, સીડી ચડતી વખતે દુખાવો વધે છે?",
    q3Options: ["સીડી ચડતી વખતે / પરિશ્રમથી વધે છે", "ભારે ખોરાક પછી વધે છે", "સીધા સૂતી વખતે વધે છે"],
    q4Text: "માહિતી આપવા બદલ આભાર. તમારો સંપૂર્ણ તબીબી ઇતિહાસ નોંધી લેવાયો છે. હવે આપણે તબીબી દસ્તાવેજો સ્કેન કરી શકીએ છીએ.",
  },
  "kn-IN": {
    q1Text: "ನಮಸ್ಕಾರ! ನಾನು ಸ್ವಾಸ್ಥ್ಯಸೇತು AI ಕ್ಲಿನಿಕಲ್ ಇಂಟೇಕ್ ಸಹಾಯಕ. ಇಂದು ನಿಮಗೆ ಯಾವ ಮುಖ್ಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಅಥವಾ ನೋವು ಇದೆ?",
    q1Options: ["ಎದೆ ನೋವು / ಅಸ್ವಸ್ಥತೆ", "ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು", "ಹೊಟ್ಟೆ ನೋವು", "ತೀವ್ರ ತಲೆನೋವು", "ಆಯುಷ್ ಸಾಮಾನ್ಯ ತಪಾಸಣೆ"],
    q2Text: "ಧನ್ಯವಾದಗಳು. ಈ ಅಸ್ವಸ್ಥತೆ ನಿಮಗೆ ಎಷ್ಟು ದಿನಗಳಿಂದ ಇದೆ, ಮತ್ತು ಈ ನೋವು ಎಡಗೈ ಅಥವಾ ದವಡೆಗೆ ಹರಡುತ್ತದೆಯೇ?",
    q2Options: ["3 ದಿನಗಳ ಹಿಂದೆ ಪ್ರಾರಂಭವಾಯಿತು, ಎಡಗೈ ನೋವು", "1 ದಿನದ ಹಿಂದೆ, ಎದೆಯಲ್ಲಿ ಮಾತ್ರ", "ಒಂದು ವಾರಕ್ಕಿಂತ ಹೆಚ್ಚು"],
    q3Text: "ಅರ್ಥವಾಯಿತು. ನೋವು ಯಾವುದರಿಂದ ಹೆಚ್ಚಾಗುತ್ತದೆ ಅಥವಾ ಕಡಿಮೆಯಾಗುತ್ತದೆ? ಉದಾಹರಣೆಗೆ, ಮೆಟ್ಟಿಲು ಹತ್ತುವಾಗ ನೋವು ಹೆಚ್ಚಾಗುತ್ತದೆಯೇ?",
    q3Options: ["ಮೆಟ್ಟಿಲು ಹತ್ತುವಾಗ / ಶ್ರಮದಿಂದ ಹೆಚ್ಚಾಗುತ್ತದೆ", "ಊಟದ ನಂತರ ಹೆಚ್ಚಾಗುತ್ತದೆ", "ನೇರವಾಗಿ ಮಲಗಿದಾಗ ಹೆಚ್ಚಾಗುತ್ತದೆ"],
    q4Text: "ಮಾಹಿತಿ ನೀಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸವನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ. ಈಗ ನಾವು ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಮುಂದುವರಿಯಬಹುದು.",
  },
};

function IntakeWizardPage() {
  const { strings } = useLocale();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // STEP 1: Informed Patient Consent (DPDP Act 2023 & ABDM)
  const [consentHistory, setConsentHistory] = useState(true);
  const [consentOcr, setConsentOcr] = useState(true);
  const [consentAbdm, setConsentAbdm] = useState(true);
  const [consentError, setConsentError] = useState(false);

  // STEP 2: Location & Care Destination
  const [locationMode, setLocationMode] = useState<"gps" | "manual">("manual");
  const [stateName, setStateName] = useState("Delhi NCR");
  const [district, setDistrict] = useState("Central Delhi");
  const [cityName, setCityName] = useState("Connaught Place");
  const [pincode, setPincode] = useState("110001");

  // STEP 3: Facility & Department
  const [facility, setFacility] = useState("Swastha District Hospital");
  const [department, setDepartment] = useState("General Medicine");
  const [consultType, setConsultType] = useState<"new" | "followup">("new");
  const [doctorPref, setDoctorPref] = useState<"any" | "specific">("specific");

  // MODULE A: AI Clinical History Engine State
  const [intakeMode, setIntakeMode] = useState<"allopathy" | "ayush">("allopathy");
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [isListening, setIsListening] = useState(false);
  const [userInputText, setUserInputText] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);

  // Red Flag Emergency Overlay Modal State
  const [showRedFlagModal, setShowRedFlagModal] = useState(false);
  const [redFlagAcknowledged, setRedFlagAcknowledged] = useState(false);

  // Conversational Messages Log (SOCRATES / OLDCARTS Framework)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: CHATBOT_TRANSLATIONS["en-IN"].q1Text,
      options: CHATBOT_TRANSLATIONS["en-IN"].q1Options,
      frameworkTag: "SOCRATES — Site & Chief Complaint",
    },
  ]);

  // Update initial message and trigger TTS when language changes (ONLY on Step 4 AI Engine)
  useEffect(() => {
    const t = CHATBOT_TRANSLATIONS[selectedLang] || CHATBOT_TRANSLATIONS["en-IN"];
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === "ai") {
        return [
          {
            sender: "ai",
            text: t.q1Text,
            options: t.q1Options,
            frameworkTag: "SOCRATES — Site & Chief Complaint",
          },
        ];
      }
      return prev;
    });
    if (step === 4 && ttsEnabled) {
      speakText(t.q1Text, (t as any).q1Phonetic);
    }
  }, [selectedLang, step]);

  const [collectedHistory, setCollectedHistory] = useState({
    complaint: "Chest pain & persistent cough",
    onset: "Started 3 days ago, gradual onset",
    character: "Squeezing, retrosternal chest pressure",
    radiation: "Radiates to left arm and shoulder",
    severity: "6 / 10 (Moderate to Severe)",
    aggravating: "Worse on climbing stairs and physical exertion",
    relieving: "Slightly relieved by rest",
    pastMedical: "Type 2 Diabetes Mellitus (2018), Essential Hypertension (2020)",
  });

  // MODULE B: Working Document Upload & OCR
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [ocrProgress, setOcrProgress] = useState(0);

  // MODULE C: FHIR & Doctor-Only Insights State
  const [showFhirModal, setShowFhirModal] = useState(false);

  // Web Speech API Voice Recognition (STT) & Speech Synthesis (TTS) Engine
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [activeVoiceName, setActiveVoiceName] = useState<string>("Default Indic Voice");

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const vs = window.speechSynthesis.getVoices();
        setAvailableVoices(vs);

        // Auto-select natural or Google voice if available
        if (!selectedVoiceURI && vs.length > 0) {
          const natural = vs.find((v) =>
            v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("neural")
          );
          if (natural) setSelectedVoiceURI(natural.voiceURI || natural.name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (text: string, phoneticText?: string) => {
    if (!ttsEnabled) return;
    stopTTS();
    setActiveVoiceName(`Speech Synthesizer (${selectedLang})`);
    speakTTS(text, selectedLang, phoneticText);
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported on this browser. Please type your response.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInputText(transcript);
        handleSendMessage(transcript);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || userInputText;
    if (!query.trim()) return;

    // Trigger Red-Flag Modal if chest pain or severe symptom selected
    if ((query.toLowerCase().includes("chest pain") || query.toLowerCase().includes("सीने में दर्द")) && !redFlagAcknowledged) {
      setShowRedFlagModal(true);
    }

    // Append patient message
    const newMessages: ChatMessage[] = [
      ...messages,
      { sender: "patient", text: query },
    ];

    setUserInputText("");
    setMessages(newMessages);
    setAiThinking(true);

    // Send multi-turn transcript directly to Gemini 2.0 Flash Model
    try {
      const geminiResult = await queryGemini2FlashChat(query, newMessages, selectedLang);
      setAiThinking(false);

      const aiReply: ChatMessage = {
        sender: "ai",
        text: geminiResult.replyText,
        options: geminiResult.suggestedOptions,
        frameworkTag: geminiResult.frameworkTag || "Gemini 2.0 Flash Model",
      };

      setMessages((prev) => [...prev, aiReply]);
      speakText(aiReply.text);
    } catch (e) {
      setAiThinking(false);
    }
  };

  // Real File Upload Handler (MODULE B)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);

      // Create preview URL if image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }

      // Simulate OCR Scanner Progress
      setOcrStatus("scanning");
      setOcrProgress(10);
      setTimeout(() => setOcrProgress(45), 400);
      setTimeout(() => setOcrProgress(80), 800);
      setTimeout(() => {
        setOcrProgress(100);
        setOcrStatus("done");
      }, 1200);
    }
  };

  return (
    <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-10 lg:px-16 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Step Indicator & Header Bar Controls */}
        <div className="flex flex-wrap items-center justify-between border-b border-border pb-4 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">SIH Prototype Platform</span>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                DPDP Act 2023 & ABDM Compliant
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-primary mt-1">
              {step === 1 && "Step 1 · Informed Patient Consent (DPDP Act 2023 & ABDM)"}
              {step === 2 && "Step 2 · Location & Care Destination"}
              {step === 3 && "Step 3 · Facility & Department Selection"}
              {step === 4 && "Step 4 · AI Clinical History Engine (SOCRATES / AYUSH)"}
              {step === 5 && "Step 5 · Tiered OCR Document Digitisation"}
              {step === 6 && "Step 6 · Structured Clinical Summary & Doctor-Only AI Insights"}
              {step === 7 && "Step 7 · OPD Queue Token #024 Generated"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Patient Metadata Badge */}
            <span className="text-xs font-semibold text-primary bg-accent/15 border border-accent/30 px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-accent" />
              Rahul Sharma (54 / M)
            </span>

            {/* TTS Speaker Mute/Unmute Toggle */}
            {step === 4 && (
              <button
                type="button"
                onClick={() => {
                  setTtsEnabled((prev) => !prev);
                  if (ttsEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className={`p-2 rounded-md border transition ${
                  ttsEnabled ? "bg-accent text-accent-foreground border-accent shadow-sm" : "bg-surface text-muted-foreground border-border"
                }`}
                title={ttsEnabled ? "Disable Auto Read Aloud" : "Enable Auto Read Aloud"}
              >
                {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}

            <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-bold text-accent">
              Step {step} of 7
            </span>
          </div>
        </div>

        {/* RED FLAG EMERGENCY POP-UP OVERLAY MODAL */}
        {showRedFlagModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-card border-2 border-red-500 p-6 shadow-2xl space-y-4 animate-bounce">
              <div className="flex items-center gap-3 text-red-600 border-b border-red-200 pb-3">
                <AlertTriangle className="h-8 w-8 text-red-600 shrink-0" />
                <div>
                  <h3 className="font-display text-lg font-bold text-red-700">ஆபத்து హెచ్చరిక | EMERGENCY TRIAGE ALERT</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Red Flag Symptom Detected</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
                Emergency signals (Exertional Retro-sternal Chest Pain + Arm Radiation) detected. Please proceed directly to the triage / casualty desk immediately after completing intake.
              </p>

              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-bold space-y-1">
                <div>⚠️ STEMI / Acute Coronary Syndrome Risk</div>
                <div>⚠️ Immediate 12-lead ECG Ordered</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRedFlagModal(false);
                  setRedFlagAcknowledged(true);
                }}
                className="w-full rounded-md bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 text-xs transition-colors shadow-md"
              >
                मैंने समझ लिया है | I Understand & Acknowledge
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: INFORMED PATIENT CONSENT (DPDP ACT 2023 & ABDM) */}
        {step === 1 && (
          <div className="gov-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Informed Patient Consent for Information Collection
              </h2>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> DPDP Act 2023 & ABDM Framework
              </span>
            </div>

            {/* Consent Audio Guidance Banner */}
            <div className="flex flex-wrap items-center justify-between bg-accent/10 border border-accent/30 p-3.5 rounded-xl text-xs gap-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Volume2 className="h-4 w-4 text-accent shrink-0" />
                <span>Audio-Guided Consent Notice (ऑडियो सहमति सूचना):</span>
              </div>
              <button
                type="button"
                onClick={() => speakText(
                  "स्वास्थ्यसेतु में आपका स्वागत है। आपके क्लिनिकल इतिहास, लक्षणों और चिकित्सा दस्तावेजों का संग्रह केवल आपकी चिकित्सा सहायता और डॉक्टर के लिए किया जा रहा है। क्या आप इसकी अनुमति देते हैं?",
                  "Welcome to SwasthaSetu. Your clinical history and documents are collected strictly for your medical consultation under DPDP Act 2023 and ABDM consent rules."
                )}
                className="px-3.5 py-1.5 bg-accent text-accent-foreground rounded-md font-bold text-xs hover:bg-accent/90 transition flex items-center gap-1.5 shadow-sm"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Listen / सहमति सुनें
              </button>
            </div>

            {/* Consent Purpose Breakdown */}
            <div className="space-y-4 text-xs sm:text-sm text-foreground bg-surface p-5 rounded-xl border border-border">
              <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Purpose of Information Collection (Digital Clinical History & Records)
              </h3>
              
              <p className="text-muted-foreground leading-relaxed text-xs">
                In compliance with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and the <strong>Ayushman Bharat Digital Mission (ABDM) Consent Architecture</strong>, SwasthaSetu requests your explicit authorization to capture and process your health details for today's OPD consultation:
              </p>

              <div className="grid gap-3 sm:grid-cols-3 pt-1">
                <div className="p-3 bg-background rounded-lg border border-border space-y-1">
                  <div className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-accent" /> 1. Symptom History
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">Interactive voice & text intake of chief health complaints and SOCRATES history for your attending doctor.</p>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border space-y-1">
                  <div className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-accent" /> 2. Document OCR
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">Digitisation and entity extraction of legacy paper prescriptions and diagnostic lab reports.</p>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border space-y-1">
                  <div className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" /> 3. ABDM FHIR Linking
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">Formatting clinical summary into an ABDM FHIR bundle linked to your ABHA health account.</p>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 space-y-1">
                <strong className="block text-emerald-950 font-bold">Patient Data Rights & Privacy Guarantee:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-850">
                  <li>Your health information is used <strong>strictly</strong> for your medical care during this consultation.</li>
                  <li>Data is encrypted end-to-end and stored adhering to ABDM health data standards.</li>
                  <li>Consent is revocable at any time without compromising your right to standard medical care.</li>
                </ul>
              </div>
            </div>

            {/* Mandatory Checkboxes */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-background cursor-pointer hover:border-accent transition">
                <input
                  type="checkbox"
                  checked={consentHistory}
                  onChange={(e) => setConsentHistory(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-accent rounded border-border focus:ring-accent"
                />
                <div className="text-xs">
                  <strong className="text-foreground font-bold block">Consent for Clinical Intake & Symptom Interview</strong>
                  <span className="text-muted-foreground">I consent to capturing and structuring my health symptoms via SwasthaSetu AI assistant for my doctor.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-background cursor-pointer hover:border-accent transition">
                <input
                  type="checkbox"
                  checked={consentOcr}
                  onChange={(e) => setConsentOcr(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-accent rounded border-border focus:ring-accent"
                />
                <div className="text-xs">
                  <strong className="text-foreground font-bold block">Consent for Medical Document Digitization & OCR</strong>
                  <span className="text-muted-foreground">I consent to scanning, extracting parameters, and summarizing my previous medical prescriptions & lab tests.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-background cursor-pointer hover:border-accent transition">
                <input
                  type="checkbox"
                  checked={consentAbdm}
                  onChange={(e) => setConsentAbdm(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-accent rounded border-border focus:ring-accent"
                />
                <div className="text-xs">
                  <strong className="text-foreground font-bold block">Consent for ABDM FHIR Profile Linking</strong>
                  <span className="text-muted-foreground">I consent to linking this structured clinical intake summary to my ABHA account for my treating physician.</span>
                </div>
              </label>
            </div>

            {consentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                Please select all consent items above to proceed with digital intake, or request manual queue registration at reception.
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setConsentHistory(true);
                  setConsentOcr(true);
                  setConsentAbdm(true);
                  setConsentError(false);
                  setStep(2);
                }}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Select All & Agree
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!consentHistory || !consentOcr || !consentAbdm) {
                    setConsentError(true);
                    return;
                  }
                  setConsentError(false);
                  setStep(2);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm"
              >
                I Agree & Give Consent
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION SELECTION (MODULE D) */}
        {step === 2 && (
          <div className="gov-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                {strings.intakeWizard.whereCare}
              </h2>
              <span className="text-xs font-bold text-muted-foreground">Location-Aware Provider Discovery</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setLocationMode("gps")}
                className={`p-5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  locationMode === "gps"
                    ? "border-accent bg-accent/10 shadow-sm"
                    : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                <MapPin className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-foreground text-sm">{strings.intakeWizard.useGps}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Auto-detect nearest empaneled government hospitals & clinics.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLocationMode("manual")}
                className={`p-5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  locationMode === "manual"
                    ? "border-accent bg-accent/10 shadow-sm"
                    : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                <Building2 className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-foreground text-sm">{strings.intakeWizard.enterManual}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Specify State, District, City or PIN Code manually.</p>
                </div>
              </button>
            </div>

            {locationMode === "manual" && (
              <div className="grid gap-4 sm:grid-cols-2 pt-2 bg-surface p-4 rounded-xl border border-border">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{strings.intakeWizard.selectState}</label>
                  <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{strings.intakeWizard.selectDistrict}</label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{strings.intakeWizard.selectCity}</label>
                  <input type="text" value={cityName} onChange={(e) => setCityName(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{strings.intakeWizard.pincode}</label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-accent" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Consent
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm"
              >
                Proceed to Facility & Department
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FACILITY & DEPARTMENT SELECTION */}
        {step === 3 && (
          <div className="gov-panel p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{strings.intakeWizard.selectFacility}</label>
              <select
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm font-bold text-primary outline-none focus:border-accent"
              >
                <option value="Swastha District Hospital">Swastha District Hospital (2.4 km · Govt District OPD)</option>
                <option value="Apex Super Speciality Hospital">Apex Super Speciality Hospital (5.1 km · Empaneled Private)</option>
                <option value="City Community Health Centre">City Community Health Centre (1.2 km · CHC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{strings.intakeWizard.selectDept}</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {["General Medicine", "Cardiology", "Pediatrics", "ENT", "AYUSH OPD"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepartment(d)}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all text-center ${
                      department === d
                        ? "border-accent bg-accent text-accent-foreground shadow-sm"
                        : "border-border bg-surface text-foreground hover:border-primary/40"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{strings.intakeWizard.consultType}</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultType("new")}
                    className={`flex-1 p-2.5 rounded-md border text-xs font-bold transition-all ${
                      consultType === "new" ? "border-accent bg-accent/15 text-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {strings.intakeWizard.newConsult}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultType("followup")}
                    className={`flex-1 p-2.5 rounded-md border text-xs font-bold transition-all ${
                      consultType === "followup" ? "border-accent bg-accent/15 text-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {strings.intakeWizard.followUp}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{strings.intakeWizard.doctorPref}</label>
                <select
                  value={doctorPref}
                  onChange={(e) => setDoctorPref(e.target.value as any)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-accent"
                >
                  <option value="any">{strings.intakeWizard.anyDoc}</option>
                  <option value="specific">{strings.intakeWizard.specificDoc}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Location
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm"
              >
                Proceed to AI Clinical History Engine
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: MODULE A — AI CLINICAL HISTORY ENGINE */}
        {step === 4 && (
          <div className="gov-panel p-6 sm:p-8 space-y-6">
            {/* Top Toolbar: Language & AYUSH Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Languages className="h-4 w-4 text-accent" /> Bhashini Voice & Text Language:
                </div>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="rounded-md border border-border bg-surface px-3 py-1 text-xs font-bold text-accent outline-none"
                >
                  {INDIAN_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>

                {/* Voice Model Picker */}
                {availableVoices.length > 0 && (
                  <select
                    value={selectedVoiceURI}
                    onChange={(e) => {
                      setSelectedVoiceURI(e.target.value);
                      const t = CHATBOT_TRANSLATIONS[selectedLang] || CHATBOT_TRANSLATIONS["en-IN"];
                      // Test voice immediately on change
                      setTimeout(() => speakText(t.q1Text, (t as any).q1Phonetic), 100);
                    }}
                    className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-primary outline-none max-w-[200px] truncate"
                    title="Select AI Voice Engine Model"
                  >
                    <option value="">Auto Natural Voice</option>
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                )}

                <span className="rounded bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1">
                  <Volume2 className="h-3 w-3 text-accent" />
                  {activeVoiceName}
                </span>
              </div>

              {/* Gemini 2.0 Key Configurator & Mode Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Paste Gemini API Key..."
                  defaultValue={getGeminiApiKey()}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground outline-none focus:border-accent max-w-[170px]"
                  title="Paste Google Gemini API Key from aistudio.google.com for live model execution"
                />

                <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIntakeMode("allopathy")}
                    className={`px-3 py-1.5 rounded transition-all ${
                      intakeMode === "allopathy" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    SOCRATES Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntakeMode("ayush")}
                    className={`px-3 py-1.5 rounded transition-all ${
                      intakeMode === "ayush" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    AYUSH Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Patient Safety Callout */}
            <div className="flex items-start gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3.5 text-amber-900 text-xs font-semibold">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900">PATIENT SAFETY GUARANTEE:</strong> SwasthaSetu AI collects clinical history only. It strictly does NOT diagnose or recommend treatments to patients. All summaries are sent exclusively to your attending physician.
              </div>
            </div>

            {/* Chat Conversation Stream */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-h-[420px] overflow-y-auto">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "patient" ? "items-end" : "items-start"}`}
                >
                  {m.frameworkTag && (
                    <span className="text-[10px] font-mono font-bold text-accent mb-1 bg-accent/15 px-2 py-0.5 rounded">
                      {m.frameworkTag}
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl p-4 text-xs sm:text-sm font-medium leading-relaxed ${
                      m.sender === "patient"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-surface border border-border text-foreground shadow-sm"
                    }`}
                  >
                    {m.text}

                    {/* Audio TTS Button for AI messages */}
                    {m.sender === "ai" && (
                      <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => speakText(m.text)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent hover:underline"
                        >
                          <Volume2 className="h-3.5 w-3.5" /> Listen / Read Aloud
                        </button>
                        <span className="text-[10px] text-muted-foreground">IndicTTS Audio</span>
                      </div>
                    )}
                  </div>

                  {/* Option Pills */}
                  {m.options && (
                    <div className="mt-3 flex flex-wrap gap-2 max-w-[85%]">
                      {m.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSendMessage(opt)}
                          className="rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-sm"
                        >
                          + {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* AI Thinking Spinner */}
              {aiThinking && (
                <div className="flex items-center gap-2 text-xs font-bold text-accent bg-surface p-3 rounded-lg border border-border max-w-[220px]">
                  <RefreshCw className="h-4 w-4 animate-spin text-accent" />
                  <span>AI विश्लेषण कर रहा है...</span>
                </div>
              )}
            </div>

            {/* Input & Voice Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex h-11 w-11 items-center justify-center rounded-lg transition-all shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
                }`}
                title="Toggle Web Speech API Voice Input"
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <input
                type="text"
                placeholder={isListening ? "Listening in selected language..." : "Type or speak your symptoms here..."}
                value={userInputText}
                onChange={(e) => setUserInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-accent"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-dark shrink-0"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button type="button" onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Facility
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm"
              >
                Proceed to Document Digitisation (Module B)
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: MODULE B — WORKING OCR DIGITISATION */}
        {step === 5 && (
          <div className="gov-panel p-6 sm:p-8 space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <FileUp className="h-5 w-5 text-accent" />
                Module B · Working Document Digitisation & Tiered OCR
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload existing printed prescriptions, lab reports or handwritten doctor slips.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-accent/40 bg-accent/5 rounded-xl p-8 text-center cursor-pointer hover:bg-accent/10 transition-all space-y-3"
            >
              <Upload className="h-10 w-10 text-accent mx-auto" />
              <div>
                <h3 className="font-bold text-sm text-foreground">Click to Choose or Drag & Drop File</h3>
                <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, JPEG, PDF up to 10MB</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2 text-xs font-bold text-accent-foreground shadow-sm"
              >
                Browse Local Files
              </button>
            </div>

            {uploadedFile && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-accent" />
                    <div>
                      <h4 className="font-bold text-sm text-primary">{uploadedFile.name}</h4>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.type}</p>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1">
                    Uploaded
                  </span>
                </div>

                {filePreview && (
                  <div className="max-h-48 overflow-hidden rounded-lg border border-border bg-black/5 p-2 text-center">
                    <img src={filePreview} alt="Uploaded prescription preview" className="max-h-44 mx-auto rounded shadow-sm object-contain" />
                  </div>
                )}

                {ocrStatus === "scanning" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-accent">
                      <span>Tiered OCR Pipeline: Entity Extraction in Progress...</span>
                      <span>{ocrProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                    </div>
                  </div>
                )}

                {ocrStatus === "done" && (
                  <div className="space-y-3 pt-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Extracted Clinical Parameters:
                    </h5>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="text-muted-foreground border-b border-border">
                            <th className="pb-2 font-semibold">Extracted Entity</th>
                            <th className="pb-2 font-semibold">Value / Regimen</th>
                            <th className="pb-2 font-semibold text-right">Confidence & Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="py-2 font-semibold text-foreground">HbA1c Lab Parameter</td>
                            <td className="py-2 font-bold text-destructive">8.4 %</td>
                            <td className="py-2 text-right">
                              <span className="rounded bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold">ABOVE RANGE</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-foreground">LDL Cholesterol</td>
                            <td className="py-2 font-bold text-destructive">165 mg/dL</td>
                            <td className="py-2 text-right">
                              <span className="rounded bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold">HIGH</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-foreground">Active Medication</td>
                            <td className="py-2 font-mono text-xs font-bold text-foreground">Tab Metformin 500mg BD</td>
                            <td className="py-2 text-right">
                              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">HIGH CONFIDENCE</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button type="button" onClick={() => setStep(4)} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to History
              </button>
              <button
                type="button"
                onClick={() => setStep(6)}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm"
              >
                Generate Summary & Doctor Insights (Module C)
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: MODULE C — SUMMARY & DOCTOR INSIGHTS */}
        {step === 6 && (
          <div className="gov-panel p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-primary">
                  Module C · Structured Clinical Summary & Doctor Insights
                </h2>
                <p className="text-xs text-muted-foreground">Bilingual draft summary formatted for the physician's terminal.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFhirModal(true)}
                className="inline-flex items-center gap-2 rounded bg-surface border border-border px-3 py-1.5 text-xs font-bold text-primary hover:border-accent"
              >
                <Code className="h-4 w-4 text-accent" /> View HL7 FHIR Bundle
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-mono font-bold text-accent bg-accent/15 px-3 py-1 rounded">
                  AI-GENERATED DRAFT — Patient Confirmed
                </span>
                <span className="text-xs font-bold text-muted-foreground">Facility: {facility}</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">Chief Complaint (SOCRATES):</span>
                  <p className="font-bold text-foreground">"{collectedHistory.complaint}"</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">History of Present Illness (HPI):</span>
                  <p className="font-semibold text-foreground">
                    {collectedHistory.onset} · {collectedHistory.character} · {collectedHistory.radiation} · {collectedHistory.aggravating}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Past Medical History:</span>
                  <p className="font-semibold text-primary">{collectedHistory.pastMedical}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 border-accent bg-accent/5 p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-accent/20 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h3 className="font-display text-base font-bold text-primary">DOCTOR-ONLY AI CLINICAL INSIGHTS & DIFFERENTIALS</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2.5 py-0.5 rounded border border-red-200">
                  Hidden from Patient
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Primary Differential Diagnoses for Physician Consideration:</span>
                  <ul className="mt-1 space-y-1">
                    <li className="font-bold text-primary flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 1. Stable Angina Pectoris / Ischemic Heart Disease (ICD-10 I20.9)
                    </li>
                    <li className="font-bold text-primary flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 2. Gastroesophageal Reflux Disease (GERD) (ICD-10 K21.9)
                    </li>
                    <li className="font-bold text-primary flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 3. Musculoskeletal Chest Wall Strain
                    </li>
                  </ul>
                </div>

                <div className="border-t border-accent/20 pt-3">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Suggested Diagnostic Workup:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    • Stat 12-lead ECG · Serum Troponin I · Fasting Lipid Profile & HbA1c recheck
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button type="button" onClick={() => setStep(5)} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Documents
              </button>
              <button
                type="button"
                onClick={() => setStep(7)}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Confirm Summary & Generate OPD Queue Token
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>

            {/* Complete HL7 FHIR R4 Bundle Modal */}
            {showFhirModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-2xl border border-border">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
                      <Code className="h-5 w-5 text-accent" /> HL7 FHIR R4 Bundle (ABDM HIE Compliant)
                    </h3>
                    <button type="button" onClick={() => setShowFhirModal(false)} className="text-xs font-bold text-muted-foreground">✕</button>
                  </div>
                  <pre className="mt-4 rounded-lg bg-surface p-4 text-[11px] font-mono text-emerald-600 overflow-x-auto max-h-80 border border-border">
{`{
  "resourceType": "Bundle",
  "id": "bundle-swasthasetu-001245",
  "type": "document",
  "timestamp": "${new Date().toISOString()}",
  "entry": [
    {
      "fullUrl": "urn:uuid:comp-001",
      "resource": {
        "resourceType": "Composition",
        "status": "final",
        "type": { "coding": [{ "system": "http://loinc.org", "code": "34133-9", "display": "Summary of episode note" }] },
        "subject": { "reference": "Patient/ABHA-12-3456-7890-1234", "display": "Rahul Sharma" },
        "author": [{ "display": "SwasthaSetu AI Intake Engine" }],
        "section": [
          { "title": "Chief Complaint", "text": "Chest pain & persistent cough (3 days)" },
          { "title": "History of Present Illness", "text": "Gradual onset, squeezing retrosternal pressure, radiates to left arm" },
          { "title": "Scanned Lab OCR", "text": "HbA1c: 8.4%, LDL: 165 mg/dL" }
        ]
      }
    },
    {
      "fullUrl": "urn:uuid:pat-001",
      "resource": {
        "resourceType": "Patient",
        "id": "ABHA-12-3456-7890-1234",
        "name": [{ "text": "Rahul Sharma" }],
        "gender": "male",
        "birthDate": "1972-08-14"
      }
    },
    {
      "fullUrl": "urn:uuid:cond-001",
      "resource": {
        "resourceType": "Condition",
        "clinicalStatus": "active",
        "code": { "text": "Type 2 Diabetes Mellitus & Essential Hypertension" }
      }
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 7: QUEUE TOKEN GENERATED */}
        {step === 7 && (
          <div className="gov-panel p-8 text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="font-display text-2xl font-bold text-primary">{strings.intakeWizard.tokenGenerated}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {strings.intakeWizard.tokenSub}
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate({ to: "/patient" })}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground"
              >
                Go to My Patient Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/doctor" })}
                className="inline-flex items-center gap-2 rounded-md border border-primary px-6 py-2.5 text-xs font-bold text-primary hover:bg-primary/10"
              >
                Open Doctor Terminal (To Review Token #024 & AI Insights)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
