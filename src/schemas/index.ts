// src/schemas/index.ts
// Zod Schema Validation Suite for SwasthaSetu Platform

import { z } from "zod";

/**
 * 1. Patient Consent Schema (DPDP Act 2023 & ABDM)
 */
export const PatientConsentSchema = z.object({
  consentId: z.string().uuid().optional(),
  abhaId: z.string().min(14, "ABHA ID must be a valid 14-digit ABDM number").max(32),
  dpdpAgreed: z.boolean().refine((val) => val === true, "DPDP Act 2023 consent is required to proceed"),
  consentHistory: z.boolean().refine((val) => val === true, "Consent for Clinical History Intake is required"),
  consentOcr: z.boolean().refine((val) => val === true, "Consent for Medical OCR Digitization is required"),
  consentAbdm: z.boolean().refine((val) => val === true, "Consent for ABDM FHIR Profile Linking is required"),
  audioLogUri: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export type PatientConsentInput = z.infer<typeof PatientConsentSchema>;

/**
 * 2. SOCRATES Symptom Intake Schema
 */
export const SocratesSymptomSchema = z.object({
  chiefComplaint: z.string().min(2, "Chief complaint is required"),
  site: z.string().optional(),
  onset: z.string().optional(),
  character: z.string().optional(),
  radiation: z.string().optional(),
  associations: z.array(z.string()).default([]),
  timing: z.string().optional(),
  exacerbatingFactors: z.string().optional(),
  severityScore: z.number().min(1).max(10).default(5),
  durationDays: z.number().min(0).default(1),
  language: z.enum(["en", "hi", "ta", "te", "mr", "bn", "kn", "ml"]).default("hi"),
});

export type SocratesSymptomInput = z.infer<typeof SocratesSymptomSchema>;

/**
 * 3. Clinical Red Flag Alert Schema
 */
export const RedFlagAlertSchema = z.object({
  isCritical: z.boolean(),
  flagType: z.enum(["STEMI_CARDIAC", "ACUTE_DYSPNEA", "SEVERE_SEPSIS", "STROKE_NEURO", "HIGH_FEVER", "NONE"]),
  warningMessage: z.string(),
  immediateActionRequired: z.string(),
  ecgOrdered: z.boolean().default(false),
});

export type RedFlagAlertInput = z.infer<typeof RedFlagAlertSchema>;

/**
 * 4. Medical Document OCR Extraction Schema
 */
export const MedicalOcrResultSchema = z.object({
  tier: z.enum(["TIER_1_DIGITAL_PDF", "TIER_2_SCANNED_PHYSICAL", "TIER_3_UNREADABLE_GUARDRAIL"]),
  isMedicalDocument: z.boolean(),
  rejectionReason: z.string().nullable().optional(),
  patientName: z.string().optional(),
  date: z.string().optional(),
  doctorName: z.string().optional(),
  extractedDiagnoses: z.array(z.string()).default([]),
  extractedMedications: z.array(z.object({
    name: z.string(),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
  })).default([]),
  labValues: z.array(z.object({
    testName: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    isAbnormal: z.boolean().default(false),
  })).default([]),
  unreadableFields: z.array(z.string()).default([]),
});

export type MedicalOcrResultInput = z.infer<typeof MedicalOcrResultSchema>;

/**
 * 5. Full Intake Session Schema
 */
export const IntakeSessionSchema = z.object({
  sessionId: z.string().uuid().optional(),
  abhaId: z.string().min(14),
  patientName: z.string().min(1),
  ageGender: z.string(),
  locationMode: z.enum(["gps", "manual"]).default("gps"),
  facilityName: z.string(),
  department: z.string(),
  consent: PatientConsentSchema,
  socratesSymptoms: SocratesSymptomSchema,
  redFlags: RedFlagAlertSchema.optional(),
  ocrResults: z.array(MedicalOcrResultSchema).default([]),
  ayushProfile: z.record(z.any()).optional(),
  sbarSummary: z.string().optional(),
  soapNote: z.string().optional(),
  triagePriority: z.enum(["EMERGENCY", "URGENT", "ROUTINE"]).default("ROUTINE"),
  createdAt: z.string().datetime().optional(),
});

export type IntakeSessionInput = z.infer<typeof IntakeSessionSchema>;
