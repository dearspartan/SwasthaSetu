import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, DataTable, InfoCard, CalloutBar } from "@/components/page-shell";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research & References — SwasthaSetu" },
      {
        name: "description",
        content:
          "Evidence base for SwasthaSetu: consultation-length studies, diagnostic yield of history-taking, ABDM standards, Bhashini language models and clinical ontologies.",
      },
      { property: "og:title", content: "Research & References — SwasthaSetu" },
      {
        property: "og:description",
        content: "The studies, standards and national frameworks that the platform is built on.",
      },
    ],
  }),
  component: ResearchPage,
});

const EVIDENCE = [
  [
    "Consultation length",
    "International comparison of primary-care consultation length (BMJ Open, 2017) places India among the shortest in the world at roughly two minutes",
  ],
  [
    "Diagnostic yield of history",
    "Classical clinical studies attribute the correct diagnosis to history alone in 70–80% of presentations",
  ],
  [
    "OPD load",
    "Tertiary government hospitals in India register 4,000–10,000 outpatients per day, concentrating demand into limited clinician hours",
  ],
  [
    "Ayurvedic assessment burden",
    "Dashavidha Pariksha comprises ten-fold examination parameters that cannot be elicited within standard OPD time",
  ],
] as const;

const STANDARDS = [
  ["ABDM", "Ayushman Bharat Digital Mission — ABHA identity, consent manager, HIP and HIU APIs"],
  ["HL7 FHIR R4", "Composition, Condition, MedicationStatement, AllergyIntolerance and Observation resources"],
  ["ICD-10", "Diagnosis coding for interoperable clinical records"],
  ["SNOMED CT", "Clinical terminology for structured findings"],
  ["RxNorm / ATC", "Medication normalisation and drug interaction checking"],
  ["DPDP Act, 2023", "Digital Personal Data Protection obligations for health data fiduciaries"],
] as const;

const NATIONAL = [
  {
    index: "Bhashini",
    title: "National Language Translation Mission",
    body: "Government-backed ASR, TTS and translation services covering Indian languages, used for the voice interview and audio consent.",
  },
  {
    index: "AI4Bharat",
    title: "IndicASR / IndicTTS",
    body: "Open research models for multi-accent Indian speech recognition and synthesis, supporting patients who cannot read or type.",
  },
  {
    index: "PMJAY",
    title: "Pradhan Mantri Jan Arogya Yojana",
    body: "Eligibility and covered-procedure checks surfaced in the insurance module alongside private mediclaim policies.",
  },
] as const;

const OPEN = [
  "Field validation of handwriting OCR accuracy on Indian medical prescriptions across states and specialities.",
  "Clinical evaluation of red-flag detection sensitivity and false-positive burden on triage teams.",
  "Longitudinal study of whether pre-consultation intake measurably improves diagnostic concordance.",
  "Standardised digital encoding of Dashavidha Pariksha parameters for AYUSH interoperability.",
] as const;

import { useLocale } from "@/context/LocaleContext";

function ResearchPage() {
  const { strings } = useLocale();

  const evidence = (strings.researchPage as any).evidenceRows || EVIDENCE;
  const standards = (strings.researchPage as any).standardRows || STANDARDS;
  const national = (strings.researchPage as any).nationalCards || NATIONAL;
  const openQuestions = (strings.researchPage as any).openQuestions || OPEN;

  return (
    <>
      <PageHeader
        eyebrow={strings.researchPage.eyebrow}
        title={strings.researchPage.title}
        intro={strings.researchPage.intro}
      />

      <Section title={strings.researchPage.evidenceTitle}>
        <DataTable headers={[strings.researchPage.areaHeader, strings.researchPage.findingHeader]} rows={evidence} />
      </Section>

      <Section title={strings.researchPage.standardsTitle} tone="surface">
        <DataTable headers={[strings.researchPage.standardHeader, strings.researchPage.roleHeader]} rows={standards} />
      </Section>

      <Section title={strings.researchPage.nationalTitle}>
        <div className="grid gap-6 md:grid-cols-3">
          {national.map((n: any) => (
            <InfoCard key={n.index} index={n.index} title={n.title}>
              {n.body}
            </InfoCard>
          ))}
        </div>
      </Section>

      <Section title={strings.researchPage.openTitle} tone="surface">
        <ul className="grid gap-4 md:grid-cols-2">
          {openQuestions.map((q: string) => (
            <li key={q} className="border-l-4 border-accent bg-card p-5 text-sm text-foreground">
              {q}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <CalloutBar>
            {strings.researchPage.researchCallout}
          </CalloutBar>
        </div>
      </Section>
    </>
  );
}
