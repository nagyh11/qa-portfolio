import * as Icons from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Counter } from "./Counter";
import type { Achievement } from "@/lib/cms-types";

export function Achievements({ data }: { data: Achievement[] }) {
  return (
    <section id="achievements" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Impact" title="QA Achievements" subtitle="Numbers that translate into product confidence." />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {data.map((it, i) => {
            const Icon = (Icons as unknown as Record<string, React.ElementType>)[it.icon] ?? Icons.Star;
            return (
              <div key={i} className="glass rounded-2xl p-6 text-center hover:shadow-glow-purple transition-all duration-300 group">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-white shadow-glow group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-4 text-2xl sm:text-3xl font-bold font-display text-gradient min-h-[2.25rem]">
                  {!it.text && it.value !== undefined
                    ? <Counter to={it.value} suffix={it.suffix ?? ""} />
                    : <span className="text-base">✓</span>}
                </div>
                <div className="mt-1 text-xs text-muted-foreground leading-tight">{it.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
