import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mic,
  FileScan,
  ClipboardList,
  ShieldCheck,
  Stethoscope,
  Languages,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Section, InfoCard } from "@/components/page-shell";
import journey from "@/assets/journey-illustration.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SwasthaSetu — Bridge to Healthcare" },
      {
        name: "description",
        content:
          "SwasthaSetu conducts a structured clinical history interview by voice and touch, digitises medical documents and delivers a physician-ready summary before the consultation begins.",
      },
      { property: "og:title", content: "SwasthaSetu — Bridge to Healthcare" },
      {
        property: "og:description",
        content:
          "AI-powered clinical history and document intake for Indian hospitals, aligned with ABDM and ABHA.",
      },
    ],
  }),
  component: Index,
});

const SERVICES = [
  {
    icon: Mic,
    title: "Pre-Consultation Intake",
    body: "A guided voice and touch interview in eight Indian languages, completed while the patient waits.",
  },
  {
    icon: FileScan,
    title: "Health Records",
    body: "Old prescriptions, lab reports and discharge summaries digitised into a dated clinical timeline.",
  },
  {
    icon: ClipboardList,
    title: "Regular Medicines",
    body: "Chronic medication for thyroid, diabetes and hypertension tracked persistently across visits.",
  },
  {
    icon: Languages,
    title: "AYUSH Assessment",
    body: "A dedicated Dashavidha Pariksha interview producing a structured Ayurvedic patient profile.",
  },
  {
    icon: ShieldCheck,
    title: "Insurance & Mediclaim",
    body: "Policies, waiting periods and PMJAY eligibility visible before admission decisions are made.",
  },
  {
    icon: Stethoscope,
    title: "Verified Providers",
    body: "Only NMC, State Council and AYUSH-registered providers can write to a patient's record.",
  },
] as const;

const STEPS = [
  { n: "01", t: "Identify", d: "ABHA login or assisted creation, language choice, audio-guided consent." },
  { n: "02", t: "Converse", d: "Adaptive clinical interview by voice or tap, one question per screen." },
  { n: "03", t: "Scan", d: "Documents digitised, entities extracted, abnormal values flagged." },
  { n: "04", t: "Summarise", d: "Physician-ready draft pushed to the consultation terminal." },
] as const;

const HIGHLIGHTS = [
  { k: "2–5 min", v: "Average OPD consultation time in India today" },
  { k: "70–80%", v: "Of diagnoses reachable from history alone" },
  { k: "4,000+", v: "OPD patients a day at a tertiary government hospital" },
  { k: "8", v: "Indian languages supported at intake" },
] as const;

import { useLocale } from "@/context/LocaleContext";

function Index() {
  const { strings } = useLocale();

  const SERVICES = [
    {
      icon: Mic,
      title: strings.services.intakeTitle,
      body: strings.services.intakeBody,
    },
    {
      icon: FileScan,
      title: strings.services.recordsTitle,
      body: strings.services.recordsBody,
    },
    {
      icon: ClipboardList,
      title: strings.services.medicinesTitle,
      body: strings.services.medicinesBody,
    },
    {
      icon: Languages,
      title: strings.services.ayushTitle,
      body: strings.services.ayushBody,
    },
    {
      icon: ShieldCheck,
      title: strings.services.insuranceTitle,
      body: strings.services.insuranceBody,
    },
    {
      icon: Stethoscope,
      title: strings.services.providersTitle,
      body: strings.services.providersBody,
    },
  ] as const;

  const STEPS = [
    { n: "01", t: strings.steps.step1Title, d: strings.steps.step1Desc },
    { n: "02", t: strings.steps.step2Title, d: strings.steps.step2Desc },
    { n: "03", t: strings.steps.step3Title, d: strings.steps.step3Desc },
    { n: "04", t: strings.steps.step4Title, d: strings.steps.step4Desc },
  ] as const;

  const HIGHLIGHTS = [
    { k: strings.stats.stat1Value, v: strings.stats.stat1Label },
    { k: strings.stats.stat2Value, v: strings.stats.stat2Label },
    { k: strings.stats.stat3Value, v: strings.stats.stat3Label },
    { k: strings.stats.stat4Value, v: strings.stats.stat4Label },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="border-b-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto grid w-full max-w-full items-center gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-14 md:py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">
              {strings.hero.badge}
            </p>
            <h1 className="mt-4 font-display text-3xl leading-tight font-bold md:text-5xl lg:text-6xl">
              {strings.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed opacity-90 md:text-lg">
              {strings.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4" id="start">
              <a
                href="#services"
                className="inline-flex items-center gap-2 bg-accent px-7 py-3.5 text-base font-semibold text-accent-foreground transition-colors hover:bg-accent/90 shadow-sm"
              >
                {strings.startConsultation}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </a>
              <Link
                to="/solution"
                className="inline-flex items-center gap-2 border border-primary-foreground/40 px-7 py-3.5 text-base font-semibold transition-colors hover:bg-primary-dark"
              >
                {strings.loginToMyHealth}
              </Link>
            </div>
          </div>

          <div className="bg-background p-4 shadow-sm">
            <img
              src={journey}
              alt="A patient completing intake at a hospital kiosk, paper records becoming a structured digital summary, and a doctor reviewing it on a terminal"
              width={1200}
              height={912}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* Key figures strip */}
      <div className="border-b border-border bg-surface">
        <dl className="mx-auto grid w-full max-w-full gap-6 px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.k} className="border-l-4 border-accent pl-4">
              <dt className="font-display text-2xl lg:text-3xl font-bold text-primary">{h.k}</dt>
              <dd className="mt-1 text-sm font-medium text-muted-foreground">{h.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Section
        id="services"
        title={strings.services.title}
        lead={strings.services.lead}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article key={s.title} className="gov-panel h-full p-6">
              <s.icon className="h-8 w-8 text-accent" aria-hidden />
              <h3 className="mt-4 font-display text-xl font-bold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title={strings.steps.title}
        lead={strings.steps.lead}
        tone="surface"
      >
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="border border-border bg-card p-6">
              <span className="font-display text-4xl font-bold text-accent">{s.n}</span>
              <h3 className="mt-2 font-display text-lg font-bold text-primary">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={strings.aiSection.title}>
        <div className="grid gap-6 md:grid-cols-3">
          <InfoCard index={strings.aiSection.aiRole} title={strings.aiSection.aiTitle}>
            {strings.aiSection.aiBody}
          </InfoCard>
          <InfoCard index={strings.aiSection.docRole} title={strings.aiSection.docTitle}>
            {strings.aiSection.docBody}
          </InfoCard>
          <InfoCard index={strings.aiSection.consentRole} title={strings.aiSection.consentTitle}>
            {strings.aiSection.consentBody}
          </InfoCard>
        </div>

        <div className="mt-8 flex items-start gap-3 border-l-4 border-accent bg-surface p-5 text-sm md:text-base">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden />
          <p className="text-foreground font-medium">
            {strings.aiSection.redFlagAlert}
          </p>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="bg-primary-dark text-primary-foreground">
        <div className="mx-auto flex w-full max-w-full flex-col items-start justify-between gap-6 px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {strings.proposal.title}
            </h2>
            <p className="mt-2 max-w-2xl text-base opacity-90">
              {strings.proposal.desc}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/problems"
              className="bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              {strings.proposal.readProblem}
            </Link>
            <Link
              to="/solution"
              className="border border-primary-foreground/40 px-6 py-3.5 text-base font-semibold transition-colors hover:bg-primary"
            >
              {strings.proposal.seeSolution}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
