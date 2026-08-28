import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-full items-center gap-2 px-4 sm:px-6 md:px-10 lg:px-16 py-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="font-semibold text-primary">{eyebrow}</span>
        </div>
      </div>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:py-16">
          <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-display text-3xl leading-tight font-bold md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed opacity-90 md:text-lg">{intro}</p>
        </div>
      </section>
    </>
  );
}

export function Section({
  id,
  title,
  lead,
  children,
  tone = "default",
}: {
  id?: string;
  title?: string;
  lead?: string;
  children: ReactNode;
  tone?: "default" | "surface";
}) {
  return (
    <section id={id} className={tone === "surface" ? "bg-surface" : "bg-background"}>
      <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:py-16">
        {title && (
          <h2 className="rule-heading font-display text-2xl font-bold text-primary md:text-3xl">
            {title}
          </h2>
        )}
        {lead && <p className="mt-5 max-w-3xl text-muted-foreground">{lead}</p>}
        <div className={title || lead ? "mt-8" : ""}>{children}</div>
      </div>
    </section>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 ? "bg-surface" : "bg-background"}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={
                    "border-t border-border px-4 py-3 align-top " +
                    (j === 0 ? "font-semibold text-primary" : "text-muted-foreground")
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InfoCard({
  title,
  children,
  index,
}: {
  title: string;
  children: ReactNode;
  index?: string;
}) {
  return (
    <article className="gov-panel h-full p-6">
      {index && (
        <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{index}</span>
      )}
      <h3 className="mt-1 font-display text-lg font-bold text-primary">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </article>
  );
}

export function CalloutBar({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-4 border-accent bg-surface p-5 text-sm leading-relaxed text-foreground">
      {children}
    </div>
  );
}
