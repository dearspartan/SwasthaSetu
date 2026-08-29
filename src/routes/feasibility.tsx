import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, DataTable, InfoCard, CalloutBar } from "@/components/page-shell";

export const Route = createFileRoute("/feasibility")({
  head: () => ({
    meta: [
      { title: "Feasibility & Viability — SwasthaSetu" },
      {
        name: "description",
        content:
          "Deployment feasibility, risk mitigation, compliance with the DPDP Act 2023 and ABDM, and the verified-provider adoption model behind SwasthaSetu.",
      },
      { property: "og:title", content: "Feasibility & Viability — SwasthaSetu" },
      {
        property: "og:description",
        content:
          "Why the platform is deployable today: existing rails, honest constraints and a market-driven adoption path.",
      },
    ],
  }),
  component: FeasibilityPage,
});

const ENABLERS = [
  [
    "Infrastructure already exists",
    "ABDM provides ABHA identity, consent management, HIP/HIU APIs and FHIR HIE — SwasthaSetu adds the missing first-mile layer rather than a parallel stack",
  ],
  [
    "Language models already exist",
    "Bhashini and AI4Bharat provide production Indian-language ASR and TTS as national public goods",
  ],
  [
    "No new hardware mandate",
    "A progressive web app runs on existing hospital kiosks, tablets, registration desktops and volunteer-held devices",
  ],
  [
    "Works without connectivity",
    "Service workers with conflict-resolving local storage keep the intake usable during hospital network outages",
  ],
  [
    "Non-disruptive to clinicians",
    "The summary is delivered into the existing HIS terminal; no change to the doctor's habitual workflow is required",
  ],
] as const;

const RISKS = [
  [
    "Illegible handwritten records",
    "Tiered OCR with confidence scoring; below threshold documents are flagged for data-entry review instead of being hallucinated",
  ],
  [
    "AI clinical error",
    "The summary is an explicitly labelled draft; the physician edits, confirms or rejects every section before it enters the record",
  ],
  [
    "Low digital literacy",
    "Audio-first, icon-driven, one-question-per-screen interface with tap alternatives for every voice prompt",
  ],
  [
    "Data credibility",
    "Only NMC / State Medical Council / AYUSH-registry verified providers can write checkup data to a patient record",
  ],
  [
    "Privacy and consent",
    "Granular, time-bound, revocable ABDM consent; session voice and scan data purged after summary confirmation",
  ],
  [
    "Queue disruption",
    "Intake runs in the waiting period patients already spend; emergency red flags bypass the queue entirely",
  ],
] as const;

const COMPLIANCE = [
  [
    "Digital Personal Data Protection Act, 2023",
    "Purpose limitation, data minimisation, storage limitation and full data-principal rights of access, correction and erasure",
  ],
  [
    "ABDM Consent Framework",
    "Granular, time-bound and revocable consent issued through the ABDM consent manager APIs",
  ],
  [
    "Clinical liability",
    "Output is a decision-support draft. Diagnosis and treatment remain the registered physician's responsibility",
  ],
  [
    "Encryption standards",
    "TLS 1.3 in transit and AES-256 at rest, with a FHIR-native encrypted data store",
  ],
] as const;

const ADOPTION = [
  {
    index: "Phase 1",
    title: "Pilot",
    body: "One tertiary government hospital OPD plus one AYUSH OPD. Measure completion rate, summary acceptance by physicians and effective consultation minutes gained.",
  },
  {
    index: "Phase 2",
    title: "District scale-up",
    body: "District hospitals and CHCs across a single state, with offline sync as the default operating assumption and volunteer-assisted onboarding.",
  },
  {
    index: "Phase 3",
    title: "Private ecosystem pull",
    body: "Verified private clinics and hospitals join for insurance verification and digital record entry, creating market-driven adoption without mandate.",
  },
] as const;

import { useLocale } from "@/context/LocaleContext";

function FeasibilityPage() {
  const { strings } = useLocale();

  const enablers = (strings.feasibilityPage as any).enablerRows || ENABLERS;
  const risks = (strings.feasibilityPage as any).riskRows || RISKS;
  const compliance = (strings.feasibilityPage as any).complianceRows || COMPLIANCE;
  const adoption = (strings.feasibilityPage as any).adoptionPhases || ADOPTION;

  return (
    <>
      <PageHeader
        eyebrow={strings.feasibilityPage.eyebrow}
        title={strings.feasibilityPage.title}
        intro={strings.feasibilityPage.intro}
      />

      <Section title={strings.feasibilityPage.feasibleTitle}>
        <DataTable headers={[strings.feasibilityPage.enablerHeader, strings.feasibilityPage.detailHeader]} rows={enablers} />
      </Section>

      <Section title={strings.feasibilityPage.risksTitle} tone="surface">
        <DataTable headers={[strings.feasibilityPage.riskHeader, strings.feasibilityPage.mitigationHeader]} rows={risks} />
      </Section>

      <Section
        title={strings.feasibilityPage.complianceTitle}
        lead={strings.feasibilityPage.complianceLead}
      >
        <DataTable headers={[strings.feasibilityPage.regHeader, strings.feasibilityPage.complianceHeader]} rows={compliance} />
      </Section>

      <Section title={strings.feasibilityPage.adoptionTitle} tone="surface">
        <div className="grid gap-6 md:grid-cols-3">
          {adoption.map((p: any) => (
            <InfoCard key={p.index} index={p.index} title={p.title}>
              {p.body}
            </InfoCard>
          ))}
        </div>
      </Section>
    </>
  );
}
