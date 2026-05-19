import * as Icons from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import type { Certification } from "@/lib/cms-types";

export function Certifications({ data }: { data: Certification[] }) {
  return (
    <section id="certifications" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Certifications" title="Verified credentials." subtitle="Continuous learning across QA fundamentals and modern automation." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((c) => {
            const Icon = (Icons as unknown as Record<string, React.ElementType>)[c.icon] ?? Icons.Award;
            return (
              <div key={c.name} className="group glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-accent shadow-glow-purple">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.issuer}</p>
                <div className="mt-4 h-px bg-gradient-to-r from-primary/40 via-accent/40 to-transparent" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
