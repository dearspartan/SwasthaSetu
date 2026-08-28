import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, DataTable, InfoCard, CalloutBar } from "@/components/page-shell";

export const Route = createFileRoute("/problems")({
  head: () => ({
    meta: [
      { title: "The Problem — SwasthaSetu" },
      {
        name: "description",
        content:
          "Two-to-five minute OPD consultations, 4,000+ patients a day and loose paper records: the first-mile clinical history gap in Indian public hospitals.",
      },
      { property: "og:title", content: "The Problem — SwasthaSetu" },
      {
        property: "og:description",
        content:
          "Why history-taking collapses in Indian OPDs and why existing systems do not close the gap.",
      },
    ],
  }),
  component: ProblemsPage,
});

const REALITY = [
  ["Consultation time", "2–5 minutes per OPD patient (BMJ Open, 2017) — among the shortest globally"],
  ["Patient volume", "Tertiary government hospitals register 4,000–10,000 OPD patients per day"],
  [
    "History-taking yield",
    "A thorough history yields the correct diagnosis in 70–80% of cases — but there is no time to take one",
  ],
  [
    "Records",
    "Patients carry loose paper prescriptions, lab reports and discharge summaries — handwritten, multilingual, unorganised",
  ],
  [
    "AYUSH gap",
    "Ayurvedic intake (Dashavidha Pariksha) is far more extensive than allopathic history — impossible to complete manually in OPD time",
  ],
  [
    "Digital infrastructure",
    "ABDM provides ABHA IDs, FHIR APIs and HIE — but the first-mile patient intake layer is missing",
  ],
] as const;

const FAILURES = [
  [
    "Hospital registration systems",
    "Capture only demographics — name, age, token. Zero clinical history.",
  ],
  [
    "Mobile health apps / tele-triage bots",
    "Require smartphone literacy, stable connectivity and pre-enrolment — excluding elderly, rural and low-literacy patients",
  ],
  [
    "Nurse-led triage desks",
    "Human-resource-limited, do not scale to 5,000+ daily patients, reintroduce the same bottleneck",
  ],
  [
    "Generic document scanners",
    "Digitise images but do not extract, structure or link clinical content to patient records",
  ],
  [
    "Existing EHR / EMR systems",
    "Doctor-side data entry after the consultation — does not solve the pre-consultation history gap",
  ],
] as const;

import { useLocale } from "@/context/LocaleContext";

function ProblemsPage() {
  const { strings } = useLocale();

  const REALITY = [
    ["Consultation time", "2–5 minutes per OPD patient (BMJ Open, 2017) — among the shortest globally"],
    ["Patient volume", "Tertiary government hospitals register 4,000–10,000 OPD patients per day"],
    [
      "History-taking yield",
      "A thorough history yields the correct diagnosis in 70–80% of cases — but there is no time to take one",
    ],
    [
      "Records",
      "Patients carry loose paper prescriptions, lab reports and discharge summaries — handwritten, multilingual, unorganised",
    ],
    [
      "AYUSH gap",
      "Ayurvedic intake (Dashavidha Pariksha) is far more extensive than allopathic history — impossible to complete manually in OPD time",
    ],
    [
      "Digital infrastructure",
      "ABDM provides ABHA IDs, FHIR APIs and HIE — but the first-mile patient intake layer is missing",
    ],
  ] as const;

  const FAILURES = [
    [
      "Hospital registration systems",
      "Capture only demographics — name, age, token. Zero clinical history.",
    ],
    [
      "Mobile health apps / tele-triage bots",
      "Require smartphone literacy, stable connectivity and pre-enrolment — excluding elderly, rural and low-literacy patients",
    ],
    [
      "Nurse-led triage desks",
      "Human-resource-limited, do not scale to 5,000+ daily patients, reintroduce the same bottleneck",
    ],
    [
      "Generic document scanners",
      "Digitise images but do not extract, structure or link clinical content to patient records",
    ],
    [
      "Existing EHR / EMR systems",
      "Doctor-side data entry after the consultation — does not solve the pre-consultation history gap",
    ],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow={strings.problemsPage.eyebrow}
        title={strings.problemsPage.title}
        intro={strings.problemsPage.intro}
      />

      <Section
        title={strings.problemsPage.realityTitle}
        lead={strings.problemsPage.realityLead}
      >
        <DataTable headers={[strings.problemsPage.dimHeader, strings.problemsPage.realityHeader]} rows={REALITY} />
        <div className="mt-8">
          <CalloutBar>
            <strong className="text-primary">{strings.problemsPage.resultPrefix}</strong>{" "}
            {strings.problemsPage.resultText}
          </CalloutBar>
        </div>
      </Section>

      <Section title={strings.problemsPage.consequencesTitle} tone="surface">
        <div className="grid gap-6 md:grid-cols-3">
          <InfoCard index={strings.problemsPage.card1Index} title={strings.problemsPage.card1Title}>
            {strings.problemsPage.card1Body}
          </InfoCard>
          <InfoCard index={strings.problemsPage.card2Index} title={strings.problemsPage.card2Title}>
            {strings.problemsPage.card2Body}
          </InfoCard>
          <InfoCard index={strings.problemsPage.card3Index} title={strings.problemsPage.card3Title}>
            {strings.problemsPage.card3Body}
          </InfoCard>
        </div>
      </Section>

      <Section
        title={strings.problemsPage.failuresTitle}
        lead={strings.problemsPage.failuresLead}
      >
        <DataTable headers={[strings.problemsPage.approachHeader, strings.problemsPage.shortfallHeader]} rows={FAILURES} />
      </Section>
    </>
  );
}
