import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, DataTable, InfoCard } from "@/components/page-shell";

export const Route = createFileRoute("/impacts")({
  head: () => ({
    meta: [
      { title: "Impacts & Benefits — SwasthaSetu" },
      {
        name: "description",
        content:
          "Consultation time recovered, diagnostic accuracy improved, and real-world scenarios from emergency care to rural OPDs and Ayurvedic assessment.",
      },
      { property: "og:title", content: "Impacts & Benefits — SwasthaSetu" },
      {
        property: "og:description",
        content:
          "From a rushed two-minute interaction to a data-rich, physician-ready clinical encounter.",
      },
    ],
  }),
  component: ImpactsPage,
});

const TIME = [
  ["History elicitation", "1–2 min (rushed, incomplete)", "0 min (pre-completed)"],
  ["Document review", "1–2 min (manual paper scan)", "30 sec (structured timeline on screen)"],
  ["Examination", "0–1 min (often skipped)", "3–4 min (full examination possible)"],
  ["Counselling & prescription", "1 min", "2–3 min (adequate counselling)"],
  ["Total effective consultation", "2–5 min (mostly paperwork)", "5–8 min (fully clinical)"],
] as const;

const SCENARIOS = [
  {
    index: "Scenario 01",
    title: "Emergency / accident patient",
    body: "A road accident victim arrives unconscious. Staff search the ABHA ID from the Aadhaar card in his wallet. SwasthaSetu instantly retrieves Type 2 DM, Metformin therapy, sulfonamide allergy and a 2022 cardiac stent. The surgeon avoids contraindicated drugs and the anaesthetist adjusts protocol.",
  },
  {
    index: "Scenario 02",
    title: "Rural elderly patient at a government OPD",
    body: "A 70-year-old farmer arrives with a bag of crumpled prescriptions. He speaks only Hindi, cannot read and has never used a phone. The platform greets him by audio in Hindi, conducts the interview by voice, scans his papers and generates a complete history. His three-minute consultation becomes a meaningful clinical interaction.",
  },
  {
    index: "Scenario 03",
    title: "Ayurvedic OPD",
    body: "AYUSH mode conducts a Dashavidha Pariksha assessment — Prakriti, Agni, Koshtha, Ahara-Vihara — producing a structured Ayurvedic profile that would have taken over thirty minutes manually. The Vaidya receives a complete personalised assessment.",
  },
  {
    index: "Scenario 04",
    title: "Private hospital admission",
    body: "A patient needing surgery is checked against the insurance module: mediclaim active, no waiting period for the procedure, sum insured sufficient. Admission proceeds without billing disputes and without denial of treatment.",
  },
  {
    index: "Scenario 05",
    title: "Follow-up visit",
    body: "A diabetes patient returns quarterly. The platform surfaces a trend extracted from scanned lab reports — HbA1c 7.2 to 7.8 to 8.1 over nine months. Deteriorating control is visible in seconds instead of buried in paper.",
  },
] as const;

const STAKEHOLDERS = [
  {
    index: "Patients",
    title: "Heard, not hurried",
    body: "Every patient — literate or not, urban or rural — receives the thorough history-taking that clinical practice demands, in their own language, without needing a smartphone.",
  },
  {
    index: "Clinicians",
    title: "Prepared, not buried",
    body: "The doctor sees the complete history before the patient enters the room, and spends the entire consultation on examination, reasoning and counselling.",
  },
  {
    index: "Health system",
    title: "Structured, not scattered",
    body: "Every encounter contributes coded, FHIR-structured data to the national health record, improving continuity of care and population health planning.",
  },
] as const;

const METRICS = [
  ["Effective consultation time gained", "+3 to +5 minutes per OPD encounter"],
  ["OCR accuracy on handwritten documents", "> 75% with confidence-based flagging"],
  ["Red-flag detection sensitivity", "> 95%"],
  ["ABDM integration uptime", "> 99.5%"],
  ["Patient satisfaction (post-visit survey)", "> 4.0 / 5.0"],
] as const;

import { useLocale } from "@/context/LocaleContext";

function ImpactsPage() {
  const { strings } = useLocale();

  const time = (strings.impactsPage as any).timeRows || TIME;
  const stakeholders = (strings.impactsPage as any).stakeholderCards || STAKEHOLDERS;
  const scenarios = (strings.impactsPage as any).scenarioCards || SCENARIOS;
  const metrics = (strings.impactsPage as any).metricRows || METRICS;

  return (
    <>
      <PageHeader
        eyebrow={strings.impactsPage.eyebrow}
        title={strings.impactsPage.title}
        intro={strings.impactsPage.intro}
      />

      <Section
        title={strings.impactsPage.timeTitle}
        lead={strings.impactsPage.timeLead}
      >
        <DataTable
          headers={[strings.impactsPage.phaseHeader, strings.impactsPage.withoutHeader, strings.impactsPage.withHeader]}
          rows={time}
        />
      </Section>

      <Section title={strings.impactsPage.stakeholderTitle} tone="surface">
        <div className="grid gap-6 md:grid-cols-3">
          {stakeholders.map((s: any) => (
            <InfoCard key={s.index} index={s.index} title={s.title}>
              {s.body}
            </InfoCard>
          ))}
        </div>
      </Section>

      <Section title={strings.impactsPage.scenariosTitle}>
        <div className="grid gap-6 md:grid-cols-2">
          {scenarios.map((s: any) => (
            <InfoCard key={s.index} index={s.index} title={s.title}>
              {s.body}
            </InfoCard>
          ))}
        </div>
      </Section>

      <Section title={strings.impactsPage.metricsTitle} tone="surface">
        <DataTable headers={[strings.impactsPage.metricHeader, strings.impactsPage.targetHeader]} rows={metrics} />
      </Section>
    </>
  );
}
