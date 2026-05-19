import * as Icons from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import type { ToolCategory } from "@/lib/cms-types";

export function Tools({ data }: { data: ToolCategory[] }) {
  return (
    <section id="tools" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Stack"
          title="Testing Tools & Technologies"
          subtitle="Hands-on experience with industry-standard QA, API, automation, and software testing tools."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((cat) => {
            const Icon = (Icons as unknown as Record<string, React.ElementType>)[cat.icon] ?? Icons.Wrench;
            return (
              <div key={cat.title} className="group relative glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 glow-border overflow-hidden">
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{cat.title}</h3>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {cat.items.map((it) => (
                    <span key={it} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all cursor-default">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
