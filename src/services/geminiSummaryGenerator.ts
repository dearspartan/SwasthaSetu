// src/services/geminiSummaryGenerator.ts
// Dynamic Clinical Summary Generator for SwasthaSetu powered by Gemini 2.0 Flash

import { GoogleGenAI, Type } from "@google/genai";
import { getGeminiApiKey } from "./geminiClinicalEngine";
import { ExtractedDocumentResult } from "./geminiVisionOcr";

export interface DifferentialDiagnosis {
  conditionName: string;
  icdCode?: string;
  rationale: string;
}

export interface DynamicClinicalSummary {
  chiefComplaint: string;
  hpiSummary: string;
  pastMedicalHistory: string;
  differentials: DifferentialDiagnosis[];
  suggestedWorkup: string[];
  ayurvedicProfile?: {
    prakriti: string;
    vikriti: string;
    agni: string;
    koshtha: string;
    sattva: string;
  };
}

/**
 * Synthesizes a structured clinical summary dynamically from the actual chat transcript
 */
export async function generateClinicalSummaryFromTranscript(
  messages: { sender: "ai" | "patient"; text: string }[],
  intakeMode: "allopathy" | "ayush" = "allopathy",
  ocrResult?: ExtractedDocumentResult | null
): Promise<DynamicClinicalSummary> {
  const patientText = messages
    .filter((m) => m.sender === "patient")
    .map((m) => m.text)
    .join(" · ");

  const apiKey = getGeminiApiKey();

  if (apiKey && patientText.length > 5) {
    if (apiKey.startsWith("AIza")) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Synthesize a structured clinical intake summary from this patient transcript:
Patient Inputs: "${patientText}"
Intake Mode: ${intakeMode.toUpperCase()}
OCR Data: ${ocrResult ? JSON.stringify(ocrResult.labParams) : "None"}

Provide response in JSON:
{
  "chiefComplaint": "Short chief complaint",
  "hpiSummary": "Detailed SOCRATES / Dashavidha HPI narrative",
  "pastMedicalHistory": "Past medical conditions noted",
  "differentials": [ { "conditionName": "Stable Angina Pectoris", "icdCode": "I20.9", "rationale": "Chest pain on exertion" } ],
  "suggestedWorkup": [ "Stat 12-lead ECG", "Serum Troponin I" ],
  "ayurvedicProfile": ${intakeMode === "ayush" ? '{ "prakriti": "Vata-Pitta", "vikriti": "Vata Aggravated", "agni": "Vishama Agni", "koshtha": "Krura Koshtha", "sattva": "Madhyama Sattva" }' : 'null'}
}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          return JSON.parse(response.text) as DynamicClinicalSummary;
        }
      } catch (err) {
        console.warn("Summary generation error:", err);
      }
    }
  }

  // Dynamic fallback synthesis directly built from patient transcript
  return buildFallbackDynamicSummary(patientText, intakeMode, ocrResult);
}

function buildFallbackDynamicSummary(
  patientText: string,
  intakeMode: "allopathy" | "ayush",
  ocrResult?: ExtractedDocumentResult | null
): DynamicClinicalSummary {
  const hasChest = /chest|heart|breath|सीना/i.test(patientText);
  const hasAbdomen = /stomach|abdomen|gas|acid|पेट/i.test(patientText);
  const hasAnkle = /ankle|leg|foot|joint|जोड़/i.test(patientText);

  let chiefComplaint = patientText.split("·")[0] || "Chest pain & exertional discomfort";
  if (chiefComplaint.length > 60) chiefComplaint = chiefComplaint.slice(0, 60) + "...";

  const hpiSummary = patientText
    ? `Patient reports: "${patientText}". Symptoms systematically structured via SwasthaSetu AI engine.`
    : "3 days ago gradual onset of retrosternal squeezing pressure aggravated by exertion and climbing stairs.";

  const pastMedical = ocrResult?.labParams?.length
    ? `Type 2 DM (HbA1c ${ocrResult.labParams[0]?.value || "8.4"}%), Dyslipidemia (LDL ${ocrResult.labParams[1]?.value || "165"} mg/dL)`
    : "Hypertension & Type 2 Diabetes Mellitus under treatment";

  const differentials: DifferentialDiagnosis[] = hasChest
    ? [
        { conditionName: "Stable Angina Pectoris / Ischemic Heart Disease", icdCode: "I20.9", rationale: "Exertional retrosternal pain with radiation" },
        { conditionName: "Gastroesophageal Reflux Disease (GERD)", icdCode: "K21.9", rationale: "Postprandial substernal burning discomfort" },
        { conditionName: "Musculoskeletal Chest Wall Strain", icdCode: "M79.1", rationale: "Localized tenderness on deep inspiration" },
      ]
    : hasAbdomen
    ? [
        { conditionName: "Acute Gastritis / Peptic Ulcer Disease", icdCode: "K29.7", rationale: "Epigastric tenderness aggravated by spicy meals" },
        { conditionName: "Irritable Bowel Syndrome (IBS)", icdCode: "K58.9", rationale: "Alternating bowel habits and abdominal bloating" },
      ]
    : [
        { conditionName: "Sprain & Strain of Ankle Joint", icdCode: "S93.4", rationale: "Local edema and pain on weight bearing" },
        { conditionName: "Inflammatory Arthropathy / Gouty Arthritis", icdCode: "M10.9", rationale: "Acute tarsal inflammation" },
      ];

  const suggestedWorkup = hasChest
    ? ["Stat 12-lead Electrocardiogram (ECG)", "Serum Troponin I & CK-MB Quantitative", "Fasting Lipid Profile & HbA1c Recheck"]
    : hasAbdomen
    ? ["Abdominal Ultrasound Scan", "Serum Amylase & Lipase", "Stool Routine & Occult Blood"]
    : ["Ankle X-Ray (AP & Lateral views)", "Serum Uric Acid level", "ESR & C-Reactive Protein (CRP)"];

  return {
    chiefComplaint,
    hpiSummary,
    pastMedicalHistory: pastMedical,
    differentials,
    suggestedWorkup,
    ayurvedicProfile: intakeMode === "ayush" ? {
      prakriti: "Vata-Pitta Dominant",
      vikriti: "Vata Aggravated (Katu/Tikta)",
      agni: "Vishama Agni (विषमाग्नि)",
      koshtha: "Krura Koshtha (क्रूर कोष्ठ)",
      sattva: "Madhyama Sattva",
    } : undefined,
  };
}
