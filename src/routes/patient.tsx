import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  User,
  ShieldCheck,
  Calendar,
  Pill,
  FileText,
  ShieldAlert,
  AlertCircle,
  ChevronRight,
  Activity,
  PlusCircle,
} from "lucide-react";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient Overview — SwasthaSetu" },
      {
        name: "description",
        content: "A single unified view of your healthcare records, active intake tokens, medicines and insurance.",
      },
    ],
  }),
  component: PatientPage,
});

const CONSULTATIONS = [
  {
    date: "12 Aug 2026",
    dept: "General Medicine",
    reason: "Fever + persistent cough",
    status: "Completed",
  },
  {
    date: "02 Jul 2026",
    dept: "Cardiology",
    reason: "Routine checkup & Lipid profile",
    status: "Completed",
  },
  {
    date: "18 Jun 2026",
    dept: "Cardiology",
    reason: "Palpitations on exertion",
    status: "Completed",
  },
] as const;

function PatientPage() {
  const { strings } = useLocale();
  const [activeTab, setActiveTab] = useState<"overview" | "consultations" | "medicines" | "documents" | "insurance">("overview");

  return (
    <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-10 lg:px-16 py-8">
      {/* Patient Header Card */}
      <div className="rounded-xl bg-primary text-primary-foreground p-6 shadow-md border border-primary-dark">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xl">
              <User className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{strings.patientPortal.welcome}</h1>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ABHA 12-3456-7890-1234
                </span>
              </div>
              <p className="mt-1 text-xs opacity-85">
                Patient ID: SS-001245 · Linked Aadhaar: XXXX-XXXX-9481
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-4 py-2 text-xs font-semibold hover:bg-primary-dark transition-colors"
          >
            Switch Account / Logout
          </Link>
        </div>

        {/* Dashboard Sub-Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-primary-foreground/20 pt-4 text-xs font-semibold">
          {[
            { id: "overview", label: strings.patientPortal.tabOverview },
            { id: "consultations", label: strings.patientPortal.tabConsultations },
            { id: "medicines", label: strings.patientPortal.tabMedicines },
            { id: "documents", label: strings.patientPortal.tabDocuments },
            { id: "insurance", label: strings.patientPortal.tabInsurance },
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

      {/* Main Content Area */}
      <div className="mt-8 space-y-8">
        {/* Health Alert Banner */}
        <div className="flex items-start gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm text-amber-900">{strings.patientPortal.healthAlertTitle}</h3>
            <p className="text-xs sm:text-sm mt-0.5 text-amber-800">
              {strings.patientPortal.healthAlertBody}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
          >
            View Details →
          </button>
        </div>

        {/* Current Consultation Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent font-bold">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Active Queue</span>
                <h3 className="font-display text-lg font-bold text-primary">{strings.patientPortal.activeConsultationTitle}</h3>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent border border-accent/30">
              {strings.patientPortal.token}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground font-medium">Hospital / Clinic</span>
              <p className="font-bold text-foreground">{strings.patientPortal.hospitalName}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">Department</span>
              <p className="font-bold text-foreground">{strings.patientPortal.dept}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">Status</span>
              <p className="font-bold text-emerald-600">Intake Completed · Awaiting Doctor</p>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Link
              to="/solution"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              {strings.patientPortal.viewConsultation}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Stat Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <div
            onClick={() => setActiveTab("medicines")}
            className="gov-panel p-6 cursor-pointer hover:border-accent transition-all group"
          >
            <div className="flex items-center justify-between">
              <Pill className="h-7 w-7 text-accent" />
              <span className="text-xs font-bold text-muted-foreground group-hover:text-accent">View All →</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-primary">{strings.patientPortal.medicinesStat}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{strings.patientPortal.medicinesSub}</p>
          </div>

          <div
            onClick={() => setActiveTab("documents")}
            className="gov-panel p-6 cursor-pointer hover:border-accent transition-all group"
          >
            <div className="flex items-center justify-between">
              <FileText className="h-7 w-7 text-accent" />
              <span className="text-xs font-bold text-muted-foreground group-hover:text-accent">View All →</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-primary">{strings.patientPortal.documentsStat}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{strings.patientPortal.documentsSub}</p>
          </div>

          <div
            onClick={() => setActiveTab("insurance")}
            className="gov-panel p-6 cursor-pointer hover:border-accent transition-all group"
          >
            <div className="flex items-center justify-between">
              <ShieldAlert className="h-7 w-7 text-accent" />
              <span className="text-xs font-bold text-muted-foreground group-hover:text-accent">View All →</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-primary">{strings.patientPortal.insuranceStat}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{strings.patientPortal.insuranceSub}</p>
          </div>
        </div>

        {/* Recent Consultations List */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              {strings.patientPortal.recentConsultationsTitle}
            </h3>
            <span className="text-xs text-muted-foreground font-medium">3 Total Visits Recorded</span>
          </div>

          <div className="divide-y divide-border">
            {CONSULTATIONS.map((c) => (
              <div key={c.date + c.dept} className="py-3.5 flex flex-wrap items-center justify-between gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{c.dept}</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">{c.date}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Find Care CTA */}
        <div className="rounded-xl bg-surface border border-border p-6 text-center">
          <h3 className="font-display text-lg font-bold text-primary">Need medical care?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Find verified NMC & AYUSH providers and start pre-consultation intake.
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              to="/solution"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-dark transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Start New Pre-Consultation Intake
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
