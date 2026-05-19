import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "./SectionHeader";
import type { SkillGroup } from "@/lib/cms-types";

function SkillBar({ name, level }: { name: string; level: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(level); }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, [level]);
  return (
    <div ref={ref}>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground font-mono text-xs">{v}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out shadow-glow" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function Skills({ data }: { data: SkillGroup[] }) {
  return (
    <section id="skills" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Skills" title="Calibrated for QA excellence." subtitle="A balanced toolkit across testing, automation, and engineering fundamentals." />
        <div className="grid lg:grid-cols-3 gap-5">
          {data.map((g) => (
            <div key={g.title} className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
              <h3 className="font-semibold mb-5">{g.title}</h3>
              <div className="space-y-4">
                {g.skills.map((s) => <SkillBar key={s.name} {...s} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
