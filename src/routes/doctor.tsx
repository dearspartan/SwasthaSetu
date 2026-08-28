import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  Stethoscope,
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
  Users,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor Workspace — SwasthaSetu" },
      {
        name: "description",
        content: "Clinician consultation terminal featuring real-time AI intake summaries, OPD queue management, and red-flag alerts.",
      },
    ],
  }),
  component: DoctorPage,
});

const QUEUE = [
  { token: "45", name: "Sunita Devi", age: "48 / F", status: "Completed", time: "09:15 AM" },
  { token: "46", name: "Vikram Singh", age: "62 / M", status: "Completed", time: "09:30 AM" },
  { token: "47", name: "Ramesh Kumar", age: "54 / M", status: "Active Intake Draft", time: "09:45 AM", current: true },
  { token: "48", name: "Priya Sharma", age: "31 / F", status: "Waiting in Queue", time: "10:00 AM" },
  { token: "49", name: "Abdul Rahim", age: "70 / M", status: "Waiting in Queue", time: "10:15 AM" },
] as const;

function DoctorPage() {
  const { strings } = useLocale();
  const [activeToken, setActiveToken] = useState("47");
  const [activeTab, setActiveTab] = useState<"overview" | "queue" | "alerts" | "records">("overview");

  return (
    <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-10 lg:px-16 py-8">
      {/* Doctor Header Banner */}
      <div className="rounded-xl bg-primary text-primary-foreground p-6 shadow-md border border-primary-dark">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xl">
              <Stethoscope className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{strings.doctorPortal.docName}</h1>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  NMC Verified Provider
                </span>
              </div>
              <p className="mt-1 text-xs opacity-85">
                {strings.doctorPortal.docInfo}
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-4 py-2 text-xs font-semibold hover:bg-primary-dark transition-colors"
          >
            Sign Out of Terminal
          </Link>
        </div>

        {/* Dashboard Sub-Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-primary-foreground/20 pt-4 text-xs font-semibold">
          {[
            { id: "overview", label: strings.doctorPortal.tabOverview },
            { id: "queue", label: strings.doctorPortal.tabQueue },
            { id: "alerts", label: strings.doctorPortal.tabAlerts },
            { id: "records", label: strings.doctorPortal.tabRecords },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === t.id
                  ? "bg-accent text-accent-foreground font-bold"
                  : "opacity-80 hover:opacity-100 hover:bg-primary-dark"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Today's Patient OPD Queue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                {strings.doctorPortal.queueTitle}
              </h3>
              <span className="text-xs font-bold text-accent bg-accent/15 px-2 py-0.5 rounded">
                5 Total
              </span>
            </div>

            <div className="space-y-2.5">
              {QUEUE.map((q) => (
                <div
                  key={q.token}
                  onClick={() => setActiveToken(q.token)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    activeToken === q.token
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-primary font-mono">Token #{q.token}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      q.current
                        ? "bg-accent text-accent-foreground font-bold"
                        : q.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">{q.name}</span>
                    <span className="text-muted-foreground font-mono">{q.age}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Patient Intake Review */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden">
            {/* Patient Bar Header */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
