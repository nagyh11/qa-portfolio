import { Briefcase, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import type { Experience as ExperienceType } from "@/lib/cms-types";

export function Experience({ data }: { data: ExperienceType[] }) {
  return (
    <section id="experience" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Experience"
          title="A track record of shipping quality."
          subtitle="Real-world QA on enterprise assessment platforms and education systems."
        />
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-accent/40 to-transparent" />
          <div className="space-y-10">
            {data.map((exp, i) => (
              <div key={exp.company} className={`relative md:grid md:grid-cols-2 md:gap-12 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-6 h-4 w-4 rounded-full bg-gradient-primary shadow-glow ring-4 ring-background" />
                <div className="pl-12 md:pl-0 md:pr-10 md:text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono">
                    <Briefcase className="h-3 w-3" /> {exp.duration}
                    {exp.current && <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px]">NOW</span>}
                  </div>
                  <h3 className="mt-3 text-xl font-bold">{exp.position}</h3>
                  <div className="text-sm text-primary mt-1">{exp.company}</div>
                </div>
                <div className="pl-12 md:pl-10 mt-4 md:mt-0">
                  <div className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
                    <ul className="space-y-2.5">
                      {exp.items.map((it) => (
                        <li key={it} className="flex gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
