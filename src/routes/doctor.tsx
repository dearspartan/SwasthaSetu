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
  Filter,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
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

interface QueuePatient {
  token: string;
  name: string;
  age: string;
  status: "Active Intake Draft" | "Waiting in Queue" | "Completed" | "Red Flag Alert";
  time: string;
  complaint: string;
  abha: string;
}

const INITIAL_QUEUE: QueuePatient[] = [
  { token: "45", name: "Sunita Devi", age: "48 / F", status: "Completed", time: "09:15 AM", complaint: "Mild fever", abha: "91-1234-5678-01" },
  { token: "46", name: "Vikram Singh", age: "62 / M", status: "Completed", time: "09:30 AM", complaint: "Hypertension checkup", abha: "91-2345-6789-02" },
  { token: "47", name: "Ramesh Kumar", age: "54 / M", status: "Active Intake Draft", time: "09:45 AM", complaint: "Chest pain on exertion", abha: "91-8273-9481-22" },
  { token: "48", name: "Priya Sharma", age: "31 / F", status: "Red Flag Alert", time: "10:00 AM", complaint: "Severe dyspnea & tachycardia", abha: "91-3456-7890-03" },
  { token: "49", name: "Abdul Rahim", age: "70 / M", status: "Waiting in Queue", time: "10:15 AM", complaint: "Diabetes follow-up", abha: "91-4567-8901-04" },
];

function DoctorPage() {
  const { strings } = useLocale();
  const [queue, setQueue] = useState<QueuePatient[]>(INITIAL_QUEUE);
  const [selectedToken, setSelectedToken] = useState("47");
  const [activeTab, setActiveTab] = useState<"overview" | "queue" | "alerts" | "records">("overview");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active Intake Draft" | "Waiting in Queue" | "Completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionDone, setActionDone] = useState<string | null>(null);

  const selectedPatient = queue.find((p) => p.token === selectedToken) || queue[2];

  const handleAction = (action: "accepted" | "amended" | "rejected") => {
    setQueue((prev) =>
      prev.map((p) =>
        p.token === selectedToken ? { ...p, status: "Completed" } : p
      )
    );
    setActionDone(`Patient Token #${selectedToken} (${selectedPatient.name}) summary successfully ${action}!`);
    setTimeout(() => setActionDone(null), 4000);
  };

  const filteredQueue = queue.filter((p) => {
    const matchesFilter = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.token.includes(searchQuery) ||
      p.abha.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

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

      {/* Action Done Notification Toast */}
      {actionDone && (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {actionDone}
          </span>
          <button type="button" onClick={() => setActionDone(null)} className="text-xs opacity-80 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Dynamic Tab Views */}
      <div className="mt-8">
        {/* OVERVIEW / QUEUE & SUMMARY */}
        {(activeTab === "overview" || activeTab === "queue") && (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Column: Queue & Search */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    {strings.doctorPortal.queueTitle}
                  </h3>
                  <span className="text-xs font-bold text-accent bg-accent/15 px-2 py-0.5 rounded">
                    {queue.filter((q) => q.status !== "Completed").length} Active
                  </span>
                </div>

                {/* Queue Search & Filter */}
                <div className="space-y-2 mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Token, Name, ABHA..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex gap-1 text-[11px] font-semibold">
                    {(["all", "Active Intake Draft", "Waiting in Queue", "Completed"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setStatusFilter(f)}
                        className={`px-2 py-1 rounded transition-colors ${
                          statusFilter === f
                            ? "bg-accent text-accent-foreground font-bold"
                            : "bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f === "all" ? "All" : f.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient List */}
                <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                  {filteredQueue.map((q) => (
                    <div
                      key={q.token}
                      onClick={() => setSelectedToken(q.token)}
                      className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedToken === q.token
                          ? "border-accent bg-accent/10 shadow-sm"
                          : "border-border bg-surface hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-primary font-mono">Token #{q.token}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          q.status === "Red Flag Alert"
                            ? "bg-red-500 text-white font-bold animate-pulse"
                            : q.status === "Active Intake Draft"
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
                      <p className="mt-1 text-[11px] text-muted-foreground truncate">{q.complaint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Active Patient Intake Review Card */}
            <div className="lg:col-span-8">
              <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden">
                {/* Header Banner */}
                <div className="bg-primary px-6 py-4 text-primary-foreground flex flex-wrap items-center justify-between gap-4 border-b border-primary-dark">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold">{selectedPatient.name} ({selectedPatient.age})</h3>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          ABHA: {selectedPatient.abha}
                        </span>
                      </div>
                      <p className="text-xs opacity-85 mt-0.5">
                        Dept: General Medicine · Token #{selectedPatient.token} · Arrival: {selectedPatient.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent border border-accent/40">
                      <Clock className="h-3.5 w-3.5" />
                      {selectedPatient.status}
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
                      "{selectedPatient.complaint}"
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
                            <span className="rounded bg-primary/10 px-2.5 py-1 font-semibold text-primary">Type 2 DM (2018)</span>
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
                      Prior Scanned Lab Reports
                    </h4>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="text-muted-foreground border-b border-border">
                            <th className="pb-2 font-semibold">Test Name</th>
                            <th className="pb-2 font-semibold">Recorded Value</th>
                            <th className="pb-2 font-semibold">Date</th>
                            <th className="pb-2 font-semibold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="py-2 font-semibold text-foreground">HbA1c</td>
                            <td className="py-2 font-bold text-destructive">7.8 %</td>
                            <td className="py-2 text-muted-foreground">3 months ago</td>
                            <td className="py-2 text-right">
                              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">ABOVE RANGE</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-foreground">LDL Cholesterol</td>
                            <td className="py-2 font-bold text-destructive">165 mg/dL</td>
                            <td className="py-2 text-muted-foreground">3 months ago</td>
                            <td className="py-2 text-right">
                              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">ABOVE RANGE</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* DOCTOR-ONLY AI CLINICAL INSIGHTS & DIFFERENTIAL DIAGNOSES BOX */}
                  <div className="rounded-xl border-2 border-accent bg-accent/5 p-5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-accent/20 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-accent" />
                        <h5 className="font-display text-sm font-bold text-primary uppercase tracking-wider">
                          DOCTOR-ONLY AI CLINICAL INSIGHTS & DIFFERENTIAL DIAGNOSES
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                        CONFIDENTIAL TO PHYSICIAN
                      </span>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">Differential Diagnoses for Doctor Consideration:</span>
                        <ul className="mt-1 space-y-1">
                          <li className="font-bold text-primary flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 1. Stable Angina Pectoris / Ischemic Heart Disease (ICD-10 I20.9)
                          </li>
                          <li className="font-bold text-primary flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 2. Gastroesophageal Reflux Disease (GERD) (ICD-10 K21.9)
                          </li>
                          <li className="font-bold text-primary flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 3. Musculoskeletal Chest Wall Pain
                          </li>
                        </ul>
                      </div>

                      <div className="border-t border-accent/20 pt-2">
                        <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">Recommended Clinical Workup:</span>
                        <p className="font-semibold text-foreground mt-0.5">
                          • Stat 12-lead Electrocardiogram (ECG) · Serum Troponin I · Lipid Profile & Fasting HbA1c
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Triage Alert Banner */}
                  <div className="flex items-start gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-900 shadow-sm">
                    <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-sm text-red-800">TRIAGE ALERT / RED FLAG DETECTED</h5>
                      <p className="text-xs sm:text-sm mt-0.5">
                        Exertional chest pain + family history of MI → Urgent cardiac evaluation recommended.
                      </p>
                    </div>
                  </div>

                  {/* Physician Decision Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleAction("accepted")}
                        className="inline-flex items-center gap-2 rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Accept & Confirm Summary
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("amended")}
                        className="inline-flex items-center gap-2 rounded border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                      >
                        <Edit3 className="h-4 w-4" /> Amend / Edit Notes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("rejected")}
                        className="inline-flex items-center gap-2 rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" /> Reject Draft
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Token #{selectedPatient.token} · Clinical Responsibility Maintained
                    </span>
                  </div>

                  {/* START ACTUAL PHYSICIAN CONSULTATION SECTION */}
                  <div className="rounded-xl border-2 border-accent bg-accent/5 p-6 space-y-5 mt-6">
                    <div className="flex items-center justify-between border-b border-accent/20 pb-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-accent" />
                        <h4 className="font-display text-base font-bold text-primary">Actual Physician Consultation & Prescription</h4>
                      </div>
                      <span className="text-xs font-bold text-accent bg-accent/15 px-3 py-1 rounded">
                        Clinician Decision Mode
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Clinical Assessment / Diagnosis</label>
                        <input
                          type="text"
                          defaultValue="Stable Angina Pectoris · Uncontrolled HbA1c"
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-bold text-primary outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Follow-up Schedule</label>
                        <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-accent">
                          <option value="7">7 Days Follow-up</option>
                          <option value="14" selected>14 Days Follow-up (Recommended)</option>
                          <option value="30">30 Days Follow-up</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Prescribed Medication List</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <input type="text" defaultValue="Tab Sorbitrate 5mg Sublingual (PRN for Pain)" className="flex-1 rounded border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground" />
                          <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-1 text-[11px] font-bold">STAT</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <input type="text" defaultValue="Tab Atorvastatin 20mg HS (Bedtime)" className="flex-1 rounded border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground" />
                          <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-1 text-[11px] font-bold">DAILY</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-accent/20 pt-4">
                      <span className="text-xs text-muted-foreground font-medium">Digital Signature Stamp: Dr. Ananya Sharma (NMC #2021-94812)</span>
                      <button
                        type="button"
                        onClick={() => handleAction("accepted")}
                        className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 shadow-md transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Consultation & Finalize Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLINICAL ALERTS TAB */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-xl font-bold text-primary">High-Priority Clinical Triage Alerts</h2>
              <p className="text-xs text-muted-foreground">Automated AI detection of STEMI, acute abdomen, stroke, and critical lab values.</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border-l-4 border-red-500 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded">Token #48 · Priya Sharma (31 / F)</span>
                  <span className="text-xs font-mono text-muted-foreground">10:00 AM</span>
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-primary">Severe Dyspnea & Acute Tachycardia Alert</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Intake speech analysis detected acute respiratory distress. Fast-track cardiac & oxygen saturation check recommended.
                </p>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => { setSelectedToken("48"); setActiveTab("overview"); }} className="text-xs font-bold text-accent hover:underline">
                    Inspect Patient Record →
                  </button>
                </div>
              </div>

              <div className="rounded-xl border-l-4 border-amber-500 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">Token #47 · Ramesh Kumar (54 / M)</span>
                  <span className="text-xs font-mono text-muted-foreground">09:45 AM</span>
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-primary">Exertional Chest Pain + Family History of MI</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Combine history of retrosternal pain with paternal MI at age 55. Stat ECG ordered.
                </p>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => { setSelectedToken("47"); setActiveTab("overview"); }} className="text-xs font-bold text-accent hover:underline">
                    Inspect Patient Record →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VERIFIED RECORDS TAB */}
        {activeTab === "records" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-xl font-bold text-primary">Verified Provider Records & Audit Log</h2>
              <p className="text-xs text-muted-foreground">Only NMC / AYUSH verified clinicians can append signed consultation notes.</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-accent" />
                  Recent Signed Consultation Records
                </h3>
                <span className="text-xs font-mono text-muted-foreground">NMC #2021-94812</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="pb-2 font-semibold">Date</th>
                      <th className="pb-2 font-semibold">Patient Name</th>
                      <th className="pb-2 font-semibold">ABHA ID</th>
                      <th className="pb-2 font-semibold">Department</th>
                      <th className="pb-2 font-semibold text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2.5 font-mono text-muted-foreground">12 Aug 2026</td>
                      <td className="py-2.5 font-semibold text-foreground">Rahul Sharma</td>
                      <td className="py-2.5 font-mono text-xs text-muted-foreground">12-3456-7890-1234</td>
                      <td className="py-2.5 text-foreground">General Medicine</td>
                      <td className="py-2.5 text-right">
                        <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">NMC SIGNED</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-muted-foreground">28 Aug 2026</td>
                      <td className="py-2.5 font-semibold text-foreground">Sunita Devi</td>
                      <td className="py-2.5 font-mono text-xs text-muted-foreground">91-1234-5678-01</td>
                      <td className="py-2.5 text-foreground">General Medicine</td>
                      <td className="py-2.5 text-right">
                        <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">NMC SIGNED</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
