import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, DataTable, InfoCard, CalloutBar } from "@/components/page-shell";
import { useLocale } from "@/context/LocaleContext";
import {
  User,
  ShieldCheck,
  Clock,
  Activity,
  FileText,
  Heart,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/solution")({
  head: () => ({
    meta: [
      { title: "Our Solution — SwasthaSetu" },
      {
        name: "description",
        content:
          "Four modules — AI clinical history, document digitisation, structured summary and ABDM consent — that complete a patient's intake before the consultation begins.",
      },
      { property: "og:title", content: "Our Solution — SwasthaSetu" },
      {
        property: "og:description",
        content:
          "A voice-and-touch intake platform that hands the physician a ready clinical summary.",
      },
    ],
  }),
  component: SolutionPage,
});

const MODULES = [
  {
    index: "Module A",
    title: "AI Clinical History Engine",
    points: [
      "Voice and touch interview, one question per screen",
      "Eight Indian languages with audio prompts",
      "Adaptive questioning via SOCRATES and OLDCARTS frameworks",
      "Dedicated AYUSH mode (Dashavidha Pariksha)",
      "Red-flag detection for STEMI, stroke, acute abdomen, psychiatric emergency",
    ],
  },
  {
    index: "Module B",
    title: "Document Digitisation & Intelligence",
    points: [
      "Scan or upload prescriptions, lab reports, discharge summaries, imaging",
      "Tiered OCR: printed, handwritten, manual-review flagging",
      "Clinical entity extraction — diagnoses, drugs, dosages, lab values",
      "Chronological timeline with abnormal-value highlighting",
      "Drug interaction and duplicate-test alerts",
    ],
  },
  {
    index: "Module C",
    title: "Structured Summary Generator",
    points: [
      "Physician-ready summary in standard clinical format",
      "Editable draft — accept, amend or reject any section",
      "Bilingual: patient hears their history, clinician reads English/Hindi",
      "Pushed to the consultation terminal when the token is called",
      "Stored as FHIR resources for interoperability",
    ],
  },
  {
    index: "Module D",
    title: "Consent, Privacy & ABDM Layer",
    points: [
      "ABHA authentication, or assisted ABHA creation via Aadhaar OTP",
      "Granular, audio-explained, revocable consent",
      "FHIR push to ABDM HIE and hospital HIS",
      "Session purge of raw voice and scan data after confirmation",
      "DPDP Act 2023 compliant, TLS 1.3 and AES-256 encryption",
    ],
  },
] as const;

const DIFFERENTIATORS = [
  [
    "Online + Offline Sync",
    "Portal works offline in low-connectivity hospital environments; syncs when the connection returns",
  ],
  [
    "Verified Provider Gating",
    "Only NMC / State Council / AYUSH-registered providers can add checkup data — ensuring data credibility",
  ],
  [
    "Provider Adoption Incentive",
    "Patients prefer verified providers whose records appear on the portal, driving organic adoption",
  ],
  [
    "Insurance / Mediclaim Visibility",
    "Policies visible with waiting-period status; hospitals can verify coverage instantly",
  ],
  [
    "Regular Medication Tracker",
    "Chronic medications for thyroid, diabetes, hypertension tracked persistently across visits",
  ],
  [
    "Emergency Fast-Track",
    "Accident and emergency patients processed faster — history available instantly via ABHA lookup",
  ],
] as const;

const JOURNEY = [
  { step: "Step 1", title: "Identify", body: "ABHA login, language selection, audio-guided consent" },
  { step: "Step 2", title: "Converse", body: "AI interview, voice + touch, adaptive questions, AYUSH mode" },
  { step: "Step 3", title: "Scan", body: "Upload documents, OCR and extraction, timeline, abnormal flags" },
  { step: "Step 4", title: "Summarise & Route", body: "Structured summary pushed to HIS and linked to ABHA" },
  { step: "Step 5", title: "Consult", body: "Doctor reviews the draft before the patient enters the room" },
] as const;

function SolutionPage() {
  const { strings } = useLocale();

  return (
    <>
      <PageHeader
        eyebrow={strings.solutionPage.eyebrow}
        title={strings.solutionPage.title}
        intro={strings.solutionPage.intro}
      />

      <Section
        title={strings.solutionPage.modulesTitle}
        lead={strings.solutionPage.modulesLead}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {MODULES.map((m) => (
            <InfoCard key={m.index} index={m.index} title={m.title}>
              <ul className="space-y-2">
                {m.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          ))}
        </div>
      </Section>

      <Section title={strings.solutionPage.journeyTitle} tone="surface">
        <ol className="grid gap-4 md:grid-cols-5">
          {JOURNEY.map((s) => (
            <li key={s.step} className="border border-border bg-card p-5">
              <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
                {s.step}
              </span>
              <h3 className="mt-1 font-display text-base font-bold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title={strings.solutionPage.diffTitle}
        lead={strings.solutionPage.diffLead}
      >
        <DataTable headers={[strings.solutionPage.featureHeader, strings.solutionPage.purposeHeader]} rows={DIFFERENTIATORS} />
      </Section>

      <Section title={strings.solutionPage.summaryTitle} tone="surface">
        <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden">
          {/* Header Masthead */}
          <div className="bg-primary px-6 py-4 text-primary-foreground flex flex-wrap items-center justify-between gap-4 border-b border-primary-dark">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold">Ramesh Kumar (M / 54 yrs)</h3>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    ABHA: 91-8273-9481-22
                  </span>
                </div>
                <p className="text-xs opacity-85 mt-0.5">
                  Dept: General Medicine · Token #47 · Kiosk Intake #1024
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent border border-accent/40">
                <Clock className="h-3.5 w-3.5" />
                AI Intake Draft — Awaiting Review
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Chief Complaint */}
            <div className="rounded-lg border-l-4 border-accent bg-accent/5 p-4">
              <span className="text-xs font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> Chief Complaint
              </span>
              <p className="mt-1 text-base font-bold text-foreground">
                "Chest pain for 3 days, worsening on exertion"
              </p>
            </div>

            {/* Grid for HPI and History */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* History of Present Illness */}
              <div className="rounded-lg border border-border bg-surface p-4">
                <h4 className="font-display text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                  <FileText className="h-4 w-4 text-accent" /> History of Present Illness (HPI)
                </h4>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <dt className="text-muted-foreground font-medium">Onset</dt>
                    <dd className="font-semibold text-foreground">3 days ago, gradual</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Character</dt>
                    <dd className="font-semibold text-foreground">Squeezing, retrosternal</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Radiation</dt>
                    <dd className="font-semibold text-foreground">Left arm</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Aggravating</dt>
                    <dd className="font-semibold text-foreground">Exertion, climbing stairs</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Relieving</dt>
                    <dd className="font-semibold text-foreground">Rest</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Severity</dt>
                    <dd className="font-semibold text-destructive">6 / 10</dd>
                  </div>
                </dl>
              </div>

              {/* Past Medical & Family History */}
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-surface p-4">
                  <h4 className="font-display text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                    <Heart className="h-4 w-4 text-accent" /> Past Medical & Family History
                  </h4>
                  <div className="mt-3 space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-muted-foreground font-medium">Conditions:</span>
                      <span className="rounded bg-primary/10 px-2.5 py-1 font-semibold text-primary">Type 2 Diabetes Mellitus (2018)</span>
                      <span className="rounded bg-primary/10 px-2.5 py-1 font-semibold text-primary">Hypertension (2020)</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-muted-foreground font-medium">Family History:</span>
                      <p className="font-medium text-foreground mt-0.5">Father: MI at age 55 · Mother: Type 2 DM</p>
                    </div>
                  </div>
                </div>

                {/* Regular Medication & Allergies */}
                <div className="rounded-lg border border-border bg-surface p-4">
                  <h4 className="font-display text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                    <Pill className="h-4 w-4 text-accent" /> Medications & Allergies
                  </h4>
                  <div className="mt-3 space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="rounded bg-accent/15 px-2.5 py-1 font-semibold text-foreground border border-accent/20">Tab Metformin 500mg BD</span>
                      <span className="rounded bg-accent/15 px-2.5 py-1 font-semibold text-foreground border border-accent/20">Tab Amlodipine 5mg OD</span>
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Allergies:</span>
                      <span className="rounded bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold border border-red-200">
                        Sulfonamides (Rash)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prior Investigations */}
            <div className="rounded-lg border border-border bg-surface p-4">
              <h4 className="font-display text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-2">
                Prior Investigations (Extracted from Scanned Documents)
              </h4>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="pb-2 font-semibold">Test Name</th>
                      <th className="pb-2 font-semibold">Recorded Value</th>
                      <th className="pb-2 font-semibold">Date</th>
                      <th className="pb-2 font-semibold text-right">Status Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2.5 font-semibold text-foreground">HbA1c</td>
                      <td className="py-2.5 font-bold text-destructive">7.8 %</td>
                      <td className="py-2.5 text-muted-foreground">3 months ago</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">ABOVE RANGE</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-foreground">LDL Cholesterol</td>
                      <td className="py-2.5 font-bold text-destructive">165 mg/dL</td>
                      <td className="py-2.5 text-muted-foreground">3 months ago</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">ABOVE RANGE</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-foreground">Resting ECG</td>
                      <td className="py-2.5 text-foreground">Normal sinus rhythm</td>
                      <td className="py-2.5 text-muted-foreground">6 months ago</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">NORMAL</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Red Flag Alert Banner */}
            <div className="flex items-start gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-900 shadow-sm">
              <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm text-red-800">TRIAGE ALERT / RED FLAG DETECTED</h5>
                <p className="text-xs sm:text-sm mt-0.5">
                  Exertional chest pain + family history of MI → Recommend urgent cardiac evaluation & stat ECG.
                </p>
              </div>
            </div>

            {/* Physician Decision Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="inline-flex items-center gap-2 rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 shadow-sm">
                  <CheckCircle2 className="h-4 w-4" /> Accept & Confirm Summary
                </button>
                <button type="button" className="inline-flex items-center gap-2 rounded border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
                  <Edit3 className="h-4 w-4" /> Amend / Edit Notes
                </button>
                <button type="button" className="inline-flex items-center gap-2 rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                  <XCircle className="h-4 w-4" /> Reject Draft
                </button>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Decision Support Mode · Doctor responsibility unchanged
              </span>
            </div>

            <CalloutBar>
              <strong className="text-primary">{strings.solutionPage.physicianNote}</strong>{" "}
              {strings.solutionPage.physicianDisclaimer}
            </CalloutBar>
          </div>
        </div>
      </Section>
    </>
  );
}
