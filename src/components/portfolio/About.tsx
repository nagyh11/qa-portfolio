import { GraduationCap, Briefcase, MapPin, Award } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Counter } from "./Counter";
import type { AboutContent } from "@/lib/cms-types";

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap, Briefcase, MapPin, Award,
};

export function About({ data }: { data: AboutContent }) {
  return (
    <section id="about" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="About Me" title="QA mindset. Engineer's discipline." />
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <div className="glass rounded-3xl p-8 shadow-card">
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{data.bio}</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {data.profileDetails.map(({ icon, title, sub }) => {
                const Icon = ICON_MAP[icon] ?? Briefcase;
                return (
                  <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{title}</div>
                      <div className="text-xs text-muted-foreground">{sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data.stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group">
                <div className="text-3xl sm:text-4xl font-bold font-display text-gradient">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-xs sm:text-sm text-muted-foreground leading-tight">{s.label}</div>
                <div className="mt-4 h-0.5 w-8 bg-gradient-primary rounded-full group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
