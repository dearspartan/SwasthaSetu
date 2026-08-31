import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogIn, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, fontSizeLevel, setFontSizeLevel, strings } = useLocale();

  const NAV = [
    { to: "/", label: strings.navigation.home },
    { to: "/patient", label: strings.navigation.patient },
    { to: "/doctor", label: strings.navigation.doctor },
  ] as const;

  return (
    <header>
      {/* Utility strip */}
      <div className="bg-primary-dark text-primary-foreground">
        <div className="mx-auto flex w-full max-w-full flex-wrap items-center justify-between gap-2 px-4 sm:px-6 md:px-10 lg:px-16 py-1.5 text-[11px] sm:text-xs">
          <p className="font-medium tracking-wide uppercase opacity-90">
            {strings.initiative}
          </p>
          <div className="flex items-center gap-4">
            <a href="#services" className="hidden sm:inline opacity-80 hover:opacity-100">
              {strings.skipToMain}
            </a>
            {/* Font scaling controls */}
            <div className="flex items-center gap-1 font-semibold">
              <button
                type="button"
                onClick={() => setFontSizeLevel("sm")}
                title="Small Font Size"
                className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${fontSizeLevel === "sm" ? "bg-accent text-accent-foreground font-bold" : "opacity-75 hover:opacity-100"}`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel("base")}
                title="Normal Font Size"
                className={`px-1.5 py-0.5 rounded text-xs transition-colors ${fontSizeLevel === "base" ? "bg-accent text-accent-foreground font-bold" : "opacity-75 hover:opacity-100"}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel("lg")}
                title="Large Font Size"
                className={`px-1.5 py-0.5 rounded text-sm transition-colors ${fontSizeLevel === "lg" ? "bg-accent text-accent-foreground font-bold" : "opacity-75 hover:opacity-100"}`}
              >
                A+
              </button>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`px-2 py-0.5 rounded ${locale === "en" ? "bg-accent text-accent-foreground font-bold" : "opacity-80 hover:opacity-100"}`}
              >
                English
              </button>
              <span className="opacity-60">|</span>
              <button
                type="button"
                onClick={() => setLocale("hi")}
                className={`px-2 py-0.5 rounded ${locale === "hi" ? "bg-accent text-accent-foreground font-bold" : "opacity-80 hover:opacity-100"}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-4 px-4 sm:px-6 md:px-10 lg:px-16 py-2 sm:py-2.5">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="SwasthaSetu — Bridge to Healthcare logo"
              className="h-10 w-auto sm:h-14 md:h-16 object-contain"
            />
            <span className="hidden border-l border-border pl-3 text-xs leading-tight font-medium text-muted-foreground sm:block">
              {strings.mastheadSubtitle.split("&")[0]}
              <br />
              & {strings.mastheadSubtitle.split("&")[1]}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/intake"
              className="hidden items-center gap-2 bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 sm:inline-flex shadow-sm"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              {strings.startConsultation}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-sm border border-border p-2 lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary navigation */}
      <nav className="relative bg-primary text-primary-foreground border-b-2 border-accent shadow-sm" aria-label="Primary">
        <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-10 lg:px-16">
          <ul className="hidden lg:flex items-center justify-between flex-nowrap">
            {NAV.map((item) => (
              <li key={item.to} className="shrink-0">
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="inline-block border-b-4 border-transparent px-3.5 xl:px-4.5 py-3 text-sm xl:text-base font-semibold tracking-wide whitespace-nowrap transition-all hover:bg-primary-dark hover:border-accent/40 -mb-[2px]"
                  activeProps={{ className: "!border-accent bg-primary-dark font-bold text-white shadow-inner" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="ml-auto flex items-center gap-1.5 py-3 text-xs font-medium opacity-90 whitespace-nowrap shrink-0">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>{strings.dpdpCompliance}</span>
            </li>
          </ul>

          {open && (
            <ul className="flex flex-col py-2 lg:hidden border-t border-primary-dark">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    onClick={() => setOpen(false)}
                    className="block border-l-4 border-transparent px-4 py-3 text-base font-semibold transition-colors hover:bg-primary-dark"
                    activeProps={{ className: "!border-accent bg-primary-dark font-bold" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}
