import { Link } from "@tanstack/react-router";
import { useLocale } from "@/context/LocaleContext";

export function SiteFooter() {
  const { strings } = useLocale();

  const COLUMNS = [
    {
      title: strings.footer.colPlatform,
      links: [
        { label: strings.navigation.patient, to: "/patient" },
        { label: strings.navigation.doctor, to: "/doctor" },
        { label: strings.startConsultation, to: "/login" },
      ],
    },
  ] as const;

  return (
    <footer className="mt-16 border-t-4 border-accent bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-full gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl font-bold">SwasthaSetu</h2>
          <p className="mt-1 text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
            {strings.footer.tagline}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed opacity-90">
            {strings.footer.desc}
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-bold tracking-wide uppercase">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="opacity-85 transition-opacity hover:opacity-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex w-full max-w-full flex-col gap-2 px-4 sm:px-6 md:px-10 lg:px-16 py-4 text-xs opacity-80 sm:flex-row sm:items-center sm:justify-between">
          <p>{strings.footer.disclaimer}</p>
          <p>{strings.footer.accessibilityLinks}</p>
        </div>
      </div>
    </footer>
  );
}
