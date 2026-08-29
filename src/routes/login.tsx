import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { User, Stethoscope, ShieldCheck, KeyRound, ArrowRight, Sparkles, Lock, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — SwasthaSetu" },
      {
        name: "description",
        content: "Secure ABHA-linked sign in for patients and verified health providers.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { strings } = useLocale();
  const navigate = useNavigate();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [abhaId, setAbhaId] = useState("");
  const [otp, setOtp] = useState("");
  const [doctorReg, setDoctorReg] = useState("");
  const [password, setPassword] = useState("");

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/patient" });
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/doctor" });
  };

  return (
    <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:py-16">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl">
            {strings.loginPage.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {strings.loginPage.subtitle}
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="mt-8 grid grid-cols-2 rounded-lg bg-surface p-1 border border-border">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all ${
              role === "patient"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            {strings.loginPage.patientTab}
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all ${
              role === "doctor"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            {strings.loginPage.doctorTab}
          </button>
        </div>

        {/* Form Container */}
        <div className="mt-6 gov-panel p-6 sm:p-8">
          {role === "patient" ? (
            <form onSubmit={handlePatientSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {strings.loginPage.abhaLabel}
                </label>
                <div className="mt-1.5 relative">
                  <input
                    type="text"
                    required
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder={strings.loginPage.abhaPlaceholder}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground font-mono">
                    ABDM
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {strings.loginPage.otpLabel}
                </label>
                <div className="mt-1.5 relative">
                  <input
                    type="password"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={strings.loginPage.otpPlaceholder}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <KeyRound className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 shadow-sm"
              >
                {strings.loginPage.submitPatient}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-2 text-center border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  {(strings.loginPage as any).noAbhaText || "Don't have an ABHA ID?"}{" "}
                  <a
                    href="https://abha.abdm.gov.in/abha/v3/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-accent hover:underline inline-flex items-center gap-1"
                  >
                    {(strings.loginPage as any).registerAbhaLink || "Create / Register Official ABHA ID"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDoctorSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {strings.loginPage.doctorRegLabel}
                </label>
                <div className="mt-1.5 relative">
                  <input
                    type="text"
                    required
                    value={doctorReg}
                    onChange={(e) => setDoctorReg(e.target.value)}
                    placeholder={strings.loginPage.doctorRegPlaceholder}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <Stethoscope className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {strings.loginPage.passwordLabel}
                </label>
                <div className="mt-1.5 relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark shadow-sm"
              >
                {strings.loginPage.submitDoctor}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Instant Quick Demo Triggers */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {strings.loginPage.quickDemoTitle}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/patient" })}
                className="flex items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-accent/20 text-left transition-colors"
              >
                <User className="h-4 w-4 text-accent shrink-0" />
                <span>{strings.loginPage.demoPatientBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/doctor" })}
                className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-primary/20 text-left transition-colors"
              >
                <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                <span>{strings.loginPage.demoDoctorBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
