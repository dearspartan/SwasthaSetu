import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, DataTable, InfoCard, CalloutBar } from "@/components/page-shell";
import { useLocale } from "@/context/LocaleContext";
import {
  Layers,
  Cpu,
  KeyRound,
  UploadCloud,
  DownloadCloud,
  Monitor,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/technical")({
  head: () => ({
    meta: [
      { title: "Technical Approach — SwasthaSetu" },
      {
        name: "description",
        content:
          "Technology stack, data flow, ABDM/FHIR integration architecture and accessibility engineering behind the SwasthaSetu intake platform.",
      },
      { property: "og:title", content: "Technical Approach — SwasthaSetu" },
      {
        property: "og:description",
        content: "Bhashini ASR/TTS, tiered OCR, clinical ontologies, HL7 FHIR R4 and ABDM APIs.",
      },
    ],
  }),
  component: TechnicalPage,
});

const STACK = [
  ["Speech-to-Text (ASR)", "Bhashini / AI4Bharat IndicASR", "Indian-language, multi-accent recognition"],
  ["Text-to-Speech (TTS)", "Bhashini TTS / AI4Bharat IndicTTS", "Audio prompts and consent explanation"],
  [
    "Conversational AI",
    "Medically fine-tuned LLM constrained by clinical ontology",
    "Adaptive clinical interview and history structuring",
  ],
  ["Clinical Ontology", "ICD-10, SNOMED-CT, RxNorm / ATC", "Standardised coding for interoperability"],
  ["OCR Engine", "Cloud Vision AI + custom handwriting models / Tesseract", "Printed and handwritten extraction"],
  ["Document AI", "NER models trained on Indian medical documents", "Clinical entity extraction"],
  ["Interoperability", "HL7 FHIR R4 APIs", "ABDM integration, HIS/EMR push, ABHA linking"],
  ["ABDM APIs", "M1 authentication, HIP push, HIU pull", "National digital health ecosystem"],
  ["Frontend", "Progressive Web App", "Cross-platform, installable, offline-capable"],
  ["Backend", "Cloud-native microservices", "Scalable, secure, module-independent deployment"],
  ["Database", "FHIR-native store, AES-256 at rest", "Secure health data persistence"],
  ["Offline Sync", "Service workers + local storage with conflict resolution", "Low-connectivity environments"],
] as const;

const OCR_TIERS = [
  ["Tier 1", "Printed text", "Standard OCR — high accuracy"],
  ["Tier 2", "Handwritten text", "Specialised handwriting recognition models"],
  ["Tier 3", "Unreadable", "Confidence-scored and flagged for manual review — never hallucinated"],
] as const;

const ACCESSIBILITY = [
  ["Icon-driven UI", "Every action is a large, colour-coded icon — no text-only screens"],
  ["Audio-first guidance", "Each screen auto-plays a voice prompt in the patient's language"],
  ["Voice input everywhere", "The patient can speak at any point; no screen requires typing"],
  ["Tap alternatives", "Every voice question also shows 3–4 large illustrated tap options"],
  ["Large touch targets", "Minimum 48×48dp buttons, high contrast, no fine-motor requirement"],
  ["No scrolling", "One question per screen with clear forward and back navigation"],
  ["Language auto-detect", "If the patient starts speaking, the system detects and switches language"],
  ["Zero training required", "A volunteer points the patient to the kiosk; the system takes over"],
] as const;

function TechnicalPage() {
  const { strings } = useLocale();

  return (
    <>
      <PageHeader
        eyebrow={strings.technicalPage.eyebrow}
        title={strings.technicalPage.title}
        intro={strings.technicalPage.intro}
      />

      <Section title={strings.technicalPage.stackTitle}>
        <DataTable headers={[strings.technicalPage.layerHeader, strings.technicalPage.techHeader, strings.technicalPage.purposeHeader]} rows={STACK} />
      </Section>

      <Section title={strings.technicalPage.archTitle} tone="surface">
        <div className="grid gap-6 md:grid-cols-3">
          <InfoCard index={strings.technicalPage.card1Index} title={strings.technicalPage.card1Title}>
            {strings.technicalPage.card1Body}
          </InfoCard>
          <InfoCard index={strings.technicalPage.card2Index} title={strings.technicalPage.card2Title}>
            {strings.technicalPage.card2Body}
          </InfoCard>
          <InfoCard index={strings.technicalPage.card3Index} title={strings.technicalPage.card3Title}>
            {strings.technicalPage.card3Body}
          </InfoCard>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-primary">Integration & Data Flow Pipeline</h3>
                <p className="text-xs text-muted-foreground">National Health Stack (ABDM) & Hospital Infrastructure Connections</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" /> HL7 FHIR R4 & ABDM Compliant
            </span>
          </div>

          <div className="space-y-4">
            {/* Core Hub Header */}
            <div className="rounded-lg bg-primary text-primary-foreground p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Cpu className="h-6 w-6 text-accent" />
                <div>
                  <h4 className="font-display text-base font-bold">SwasthaSetu Intake Core Engine</h4>
                  <p className="text-xs opacity-85">Processes Voice, OCR, Clinical NLP & FHIR Serialization</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-primary-dark px-3 py-1 rounded text-accent font-semibold">
                Core Hub
              </span>
            </div>

            {/* Flow Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
              {/* 1. ABHA Auth */}
              <div className="gov-panel p-5 relative border-l-4 border-accent">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <KeyRound className="h-4 w-4 text-accent" />
                    ABHA Authentication
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent-foreground px-2 py-0.5 rounded">
                    M1 APIs
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Identity verification, Aadhaar OTP authentication, and ABHA number linkage.
                </p>
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-primary">
                  <span>Protocol: ABDM M1</span>
                  <ArrowRight className="h-3.5 w-3.5 text-accent" />
                </div>
              </div>

              {/* 2. HIP Push */}
              <div className="gov-panel p-5 relative border-l-4 border-emerald-500">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <UploadCloud className="h-4 w-4 text-emerald-600" />
                    Health Information Push
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    HIP APIs
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Structured intake summary converted to FHIR Bundles & pushed to ABDM Health Information Exchange.
                </p>
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-primary">
                  <span>Format: FHIR R4 Bundle</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                </div>
              </div>

              {/* 3. HIU Pull */}
              <div className="gov-panel p-5 relative border-l-4 border-blue-500">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <DownloadCloud className="h-4 w-4 text-blue-600" />
                    Health Information Pull
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    HIU APIs
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Fetches prior longitudinal records linked to patient's ABHA subject to patient consent.
                </p>
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-primary">
                  <span>Scope: Prior Records</span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                </div>
              </div>

              {/* 4. Hospital HIS Integration */}
              <div className="gov-panel p-5 relative border-l-4 border-purple-500">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Monitor className="h-4 w-4 text-purple-600" />
                    Hospital HIS / EMR
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    HL7 FHIR R4
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Pushes formatted clinical summary draft directly to clinician's consultation terminal.
                </p>
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-primary">
                  <span>Target: Doctor Terminal</span>
                  <ArrowRight className="h-3.5 w-3.5 text-purple-600" />
                </div>
              </div>

              {/* 5. ABHA PHR */}
              <div className="gov-panel p-5 relative border-l-4 border-amber-500 md:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Smartphone className="h-4 w-4 text-amber-600" />
                    ABHA Personal Health Record (PHR) App
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    Patient Portal
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Patient views, manages, and securely shares their own structured clinical history across future healthcare visits.
                </p>
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-primary">
                  <span>Access: Patient Controlled</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title={strings.technicalPage.ocrTitle}
        lead={strings.technicalPage.ocrLead}
      >
        <DataTable headers={[strings.technicalPage.tierHeader, strings.technicalPage.inputHeader, strings.technicalPage.handlingHeader]} rows={OCR_TIERS} />
        <div className="mt-8">
          <CalloutBar>
            {strings.technicalPage.ocrCallout}
          </CalloutBar>
        </div>
      </Section>

      <Section title={strings.technicalPage.a11yTitle} tone="surface">
        <p className="mb-8 max-w-3xl text-muted-foreground">
          {strings.technicalPage.a11yIntro}
        </p>
        <DataTable headers={[strings.technicalPage.principleHeader, strings.technicalPage.implHeader]} rows={ACCESSIBILITY} />
      </Section>
    </>
  );
}
