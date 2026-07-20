import type { ReactNode } from "react";

export function PageHero({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`page-hero section ${className}`.trim()} data-reveal="hero">
      <div>{children}</div>
    </section>
  );
}

export function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="section-heading" data-reveal="heading">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function ActionGroup({ children }: { children: ReactNode }) {
  return <div className="actions">{children}</div>;
}
