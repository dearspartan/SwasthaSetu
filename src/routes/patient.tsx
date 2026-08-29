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
  Upload,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileUp,
  AlertTriangle,
  Heart,
  Stethoscope,
} from "lucide-react";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient Dashboard — SwasthaSetu" },
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
    id: "C-2026-0812",
    date: "12 Aug 2026",
    dept: "General Medicine",
    doctor: "Dr. Ananya Sharma (NMC #2021-94812)",
    hospital: "Swastha District Hospital",
    reason: "Fever + persistent cough for 4 days",
    diagnosis: "Upper Respiratory Tract Infection (URTI) · Mild Bronchospasm",
    prescription: ["Tab Azithromycin 500mg OD (3 days)", "Syrup Ascoril 10ml TDS (5 days)"],
    status: "Completed",
  },
  {
    id: "C-2026-0702",
    date: "02 Jul 2026",
    dept: "Cardiology",
    doctor: "Dr. Vikram Sethi (NMC #2015-38491)",
    hospital: "Apex Super Speciality Hospital",
    reason: "Routine cardiac follow-up & Lipid profile review",
    diagnosis: "Essential Hypertension · Hypercholesterolemia",
    prescription: ["Tab Amlodipine 5mg OD (Ongoing)", "Tab Atorvastatin 10mg HS (Ongoing)"],
    status: "Completed",
  },
  {
    id: "C-2026-0618",
    date: "18 Jun 2026",
    dept: "Cardiology",
    doctor: "Dr. Vikram Sethi (NMC #2015-38491)",
    hospital: "Apex Super Speciality Hospital",
    reason: "Palpitations on exertion + mild dizziness",
    diagnosis: "Sinus Tachycardia · Mild Stress Induced",
    prescription: ["Tab Metoprolol 25mg BD (14 days)", "ECG & Lipid Profile ordered"],
    status: "Completed",
  },
] as const;

const MEDICINES = [
  {
    name: "Metformin 500mg",
    dosage: "1 Tablet Twice Daily (BD)",
    timing: "After Meals (Breakfast & Dinner)",
    condition: "Type 2 Diabetes Mellitus",
    prescribedBy: "Dr. Ananya Sharma",
    refillDate: "15 Sep 2026",
    status: "Active",
  },
  {
    name: "Amlodipine 5mg",
    dosage: "1 Tablet Once Daily (OD)",
    timing: "Morning after Breakfast",
    condition: "Hypertension",
    prescribedBy: "Dr. Vikram Sethi",
    refillDate: "20 Sep 2026",
    status: "Active",
  },
  {
    name: "Thyroxine 50mcg",
    dosage: "1 Tablet Once Daily (OD)",
    timing: "Early Morning Empty Stomach",
    condition: "Hypothyroidism",
    prescribedBy: "Dr. Ananya Sharma",
    refillDate: "10 Oct 2026",
    status: "Active",
  },
] as const;

const DOCUMENTS = [
  {
    id: "DOC-9481",
    title: "Complete Blood Count & HbA1c Lab Report",
    date: "10 Aug 2026",
    type: "Lab Report",
    facility: "Central Diagnostic Lab",
    flag: "HbA1c 8.4% (ABOVE RANGE)",
    statusColor: "text-destructive border-red-200 bg-red-50",
  },
  {
    id: "DOC-8392",
    title: "OPD Prescription — General Medicine",
    date: "12 Aug 2026",
    type: "Prescription",
    facility: "Swastha District Hospital",
    flag: "Digitised & Linked to ABHA",
    statusColor: "text-emerald-700 border-emerald-200 bg-emerald-50",
  },
  {
    id: "DOC-7201",
    title: "Lipid Profile & Resting ECG Report",
    date: "02 Jul 2026",
    type: "Radiology / ECG",
    facility: "Apex Cardiac Care",
    flag: "LDL 165 mg/dL (ABOVE RANGE)",
    statusColor: "text-amber-800 border-amber-200 bg-amber-50",
  },
  {
    id: "DOC-6110",
    title: "Discharge Summary — Day Care Admission",
    date: "18 Jun 2026",
    type: "Discharge Summary",
    facility: "Swastha District Hospital",
    flag: "Verified Provider Signed",
    statusColor: "text-emerald-700 border-emerald-200 bg-emerald-50",
  },
] as const;

function PatientPage() {
  const { strings } = useLocale();
  const [activeTab, setActiveTab] = useState<"overview" | "consultations" | "medicines" | "documents" | "insurance">("overview");
  const [uploadModal, setUploadModal] = useState(false);
  const [docFilter, setDocFilter] = useState<"all" | "Prescription" | "Lab Report">("all");

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
                Patient ID: SS-001245 · Linked Aadhaar: XXXX-XXXX-9481 · DOB: 14 Aug 1972
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
              className={`px-3.5 py-2 rounded-md transition-all ${
                activeTab === t.id
                  ? "bg-accent text-accent-foreground font-bold shadow-sm"
                  : "opacity-80 hover:opacity-100 hover:bg-primary-dark"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Contents */}
      <div className="mt-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
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

            {/* Current Active OPD Consultation Card */}
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
                  to="/intake"
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
                <button
                  type="button"
                  onClick={() => setActiveTab("consultations")}
                  className="text-xs font-bold text-accent hover:underline"
                >
                  View All History →
                </button>
              </div>

              <div className="divide-y divide-border">
                {CONSULTATIONS.map((c) => (
                  <div key={c.id} className="py-3.5 flex flex-wrap items-center justify-between gap-4 text-sm">
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
          </div>
        )}

        {/* CONSULTATIONS TAB */}
        {activeTab === "consultations" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-primary">Consultation History & Summaries</h2>
                <p className="text-xs text-muted-foreground">All completed outpatient and inpatient visits linked to your ABHA.</p>
              </div>
              <Link
                to="/intake"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Start New Intake
              </Link>
            </div>

            <div className="space-y-4">
              {CONSULTATIONS.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent">{c.id}</span>
                      <h3 className="font-display text-lg font-bold text-primary">{c.dept}</h3>
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">
                        {c.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{c.date}</span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-muted-foreground font-medium">Attending Physician:</span>
                      <p className="font-bold text-foreground">{c.doctor}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">Facility:</span>
                      <p className="font-bold text-foreground">{c.hospital}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground font-medium">Chief Reason for Visit:</span>
                      <p className="font-semibold text-foreground">{c.reason}</p>
                    </div>
                    <div className="md:col-span-2 rounded-lg bg-surface p-3 border border-border">
                      <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Clinical Diagnosis:</span>
                      <p className="font-bold text-primary mt-0.5">{c.diagnosis}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground font-medium">Prescribed Therapy:</span>
                      <ul className="mt-1 space-y-1">
                        {c.prescription.map((p) => (
                          <li key={p} className="flex items-center gap-2 font-mono text-xs font-semibold text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEDICINES TAB */}
        {activeTab === "medicines" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-xl font-bold text-primary">Active Prescription & Regular Medications</h2>
              <p className="text-xs text-muted-foreground">Track ongoing daily medicines for chronic care & upcoming refills.</p>
            </div>

            {/* Daily Schedule Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {MEDICINES.map((m) => (
                <div key={m.name} className="rounded-xl border border-border bg-card p-5 shadow-sm relative border-l-4 border-accent">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">{m.status}</span>
                    <Pill className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-primary">{m.name}</h3>
                  <p className="text-xs font-semibold text-foreground mt-1">{m.dosage}</p>

                  <div className="mt-4 space-y-2 text-xs border-t border-border pt-3">
                    <div>
                      <span className="text-muted-foreground font-medium">Timing:</span>
                      <p className="font-bold text-foreground">{m.timing}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">Indication:</span>
                      <p className="font-medium text-foreground">{m.condition}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">Next Refill Due:</span>
                      <p className="font-mono font-bold text-accent">{m.refillDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-surface border border-border p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-accent shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Drug Safety Alert:</strong> Always take Thyroxine on an empty stomach at least 30 minutes before breakfast. Do not double doses if missed.
              </p>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-primary">Scanned Medical Records & Reports</h2>
                <p className="text-xs text-muted-foreground">Digitised prescriptions, lab investigation reports and discharge summaries.</p>
              </div>
              <button
                type="button"
                onClick={() => setUploadModal(true)}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm"
              >
                <Upload className="h-4 w-4" />
                Upload New Document (OCR)
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {DOCUMENTS.map((d) => (
                <div key={d.id} className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-accent">{d.id}</span>
                      <span className="text-xs font-mono text-muted-foreground">{d.date}</span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-primary">{d.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.facility} · {d.type}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded border ${d.statusColor}`}>
                      {d.flag}
                    </span>
                    <button type="button" className="text-xs font-bold text-accent hover:underline">
                      View PDF →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Modal Simulation */}
            {uploadModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-2xl border border-border">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
                      <FileUp className="h-5 w-5 text-accent" /> Upload Document for OCR Scan
                    </h3>
                    <button type="button" onClick={() => setUploadModal(false)} className="text-xs font-bold text-muted-foreground">✕</button>
                  </div>

                  <div className="mt-4 border-2 border-dashed border-accent/40 bg-accent/5 rounded-xl p-6 text-center">
                    <Upload className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="text-xs font-bold text-foreground">Drag and drop prescription or lab PDF / Image here</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Supports PNG, JPG, PDF up to 10MB</p>
                    <button
                      type="button"
                      onClick={() => {
                        alert("OCR Scan Complete! Extracted 2 Lab Values & 1 Prescription.");
                        setUploadModal(false);
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-bold text-accent-foreground"
                    >
                      Simulate OCR File Upload
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INSURANCE TAB */}
        {activeTab === "insurance" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-xl font-bold text-primary">Insurance Policies & PMJAY Coverage</h2>
              <p className="text-xs text-muted-foreground">Active government health coverage and private mediclaim details.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* PMJAY Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded">Active Government Coverage</span>
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-primary">Pradhan Mantri Jan Arogya Yojana (PMJAY)</h3>
                <p className="text-xs font-mono text-muted-foreground">ABHA Card Linked · Ayushman Bharat</p>

                <div className="mt-4 space-y-2 text-xs border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Family Sum Insured:</span>
                    <span className="font-bold text-emerald-700">₹ 5,00,000 / year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Waiting Period:</span>
                    <span className="font-bold text-foreground">Zero (Pre-existing covered)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Empaneled Hospitals:</span>
                    <span className="font-bold text-foreground">28,000+ Nationwide</span>
                  </div>
                </div>
              </div>

              {/* Private Mediclaim */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative border-l-4 border-accent">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent bg-accent/15 px-2.5 py-0.5 rounded">Private Mediclaim</span>
                  <ShieldAlert className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-primary">Star Health Optima Insurance</h3>
                <p className="text-xs font-mono text-muted-foreground">Policy # SH-9481-2025</p>

                <div className="mt-4 space-y-2 text-xs border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Sum Insured:</span>
                    <span className="font-bold text-primary">₹ 7,50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Cardiac Waiting Period:</span>
                    <span className="font-bold text-emerald-600">Passed (36 Months Completed)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Cashless Verification:</span>
                    <span className="font-bold text-foreground">Instant via Hospital Desk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
