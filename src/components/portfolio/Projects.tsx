import { Github, ExternalLink } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Button } from "@/components/ui/button";
import postmanImg from "@/assets/project-postman.jpg";
import aiImg from "@/assets/project-ai.jpg";
import type { Project } from "@/lib/cms-types";

const FALLBACK_IMAGES = [postmanImg, aiImg];

export function Projects({ data }: { data: Project[] }) {
  return (
    <section id="projects" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Projects" title="Selected work." subtitle="Case studies that showcase QA depth, API automation, and applied ML engineering." />
        <div className="grid lg:grid-cols-2 gap-6">
          {data.map((p, idx) => {
            const showGithub = p.showGithubLink !== false;
            const showLive = p.showLiveUrl !== false;
            const hasLinks = showGithub || showLive;
            return (
              <article key={p.title} className="group glass rounded-3xl overflow-hidden hover:shadow-glow transition-all duration-500 glow-border flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent z-10" />
                  <img
                    src={p.image || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
                    alt={p.title}
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-md glass-strong text-[11px] font-mono uppercase tracking-wider text-primary">
                    {p.badge}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary">{t}</span>
                    ))}
                  </div>
                  {hasLinks && (
                    <div className="mt-6 flex gap-3 pt-4 border-t border-white/5">
                      {showGithub && (
                        <Button asChild variant="neon" size="sm">
                          <a href={p.github || "#"} target="_blank" rel="noreferrer"><Github /> GitHub</a>
                        </Button>
                      )}
                      {showLive && (
                        <Button asChild variant="ghost" size="sm">
                          <a href={p.link || "#"} target="_blank" rel="noreferrer">View Details <ExternalLink /></a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
