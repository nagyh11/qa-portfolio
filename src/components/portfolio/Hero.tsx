import { useState } from "react";
import { ArrowDown, Download, Mail, FolderGit2, CheckCircle2, Bug, Code2, Terminal, Network, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import profileImg from "@/assets/profile.jpg";
import type { HeroContent } from "@/lib/cms-types";

const FLOAT_ICONS = [
  { Icon: Bug, top: "12%", left: "8%", delay: "0s" },
  { Icon: Code2, top: "22%", right: "10%", delay: "1.2s" },
  { Icon: Terminal, bottom: "20%", left: "12%", delay: "2.1s" },
  { Icon: Network, top: "40%", right: "6%", delay: "0.6s" },
  { Icon: ShieldCheck, bottom: "28%", right: "14%", delay: "1.8s" },
  { Icon: CheckCircle2, top: "60%", left: "5%", delay: "0.9s" },
];

export function Hero({ data }: { data: HeroContent }) {
  const [cvLoading, setCvLoading] = useState(false);

  const handleDownloadCv = () => {
    setCvLoading(true);
    const link = document.createElement("a");
    link.href = "/assets/cv/Mohamed_Nagy_Hassan_CV.pdf";
    link.download = "Mohamed_Nagy_Hassan_CV.pdf";
    link.click();
    setTimeout(() => setCvLoading(false), 1500);
  };

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-glow-pulse" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      {FLOAT_ICONS.map(({ Icon, ...pos }, i) => (
        <div key={i} className="absolute hidden lg:grid place-items-center h-12 w-12 rounded-2xl glass animate-float" style={{ ...pos, animationDelay: pos.delay }}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      ))}

      <div className="relative mx-auto max-w-6xl px-4 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {data.badge}
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            {data.title1}
            <span className="block mt-2 text-gradient">{data.title2}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            {data.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <a href="#projects"><FolderGit2 className="h-4 w-4" /> View Projects</a>
            </Button>
            <Button variant="neon" size="xl" onClick={handleDownloadCv} disabled={cvLoading}>
              {cvLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Downloading...</> : <><Download className="h-4 w-4" /> Download CV</>}
            </Button>
            <Button variant="glass" size="xl" onClick={scrollToContact}>
              <Mail className="h-4 w-4" /> Contact Me
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <span>{data.location}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>{data.certification}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>{data.experience}</span>
          </div>
        </div>

        <div className="relative mx-auto lg:mx-0 w-full max-w-sm animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative aspect-square">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-accent blur-2xl opacity-50 animate-glow-pulse" />
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden glass-strong glow-border shadow-card">
              <img src={data.profileImage || profileImg} alt={data.name} width={768} height={768} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 via-background/50 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{data.name}</div>
                    <div className="text-xs text-muted-foreground">QC Engineer @ AGI</div>
                  </div>
                  <div className="px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-mono uppercase tracking-wider">QA</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 glass rounded-2xl px-3 py-2 text-xs font-mono shadow-glow animate-float">
              <span className="text-emerald-400">PASS</span> 500+ tests
            </div>
            <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-3 py-2 text-xs font-mono shadow-glow-purple animate-float" style={{ animationDelay: "1s" }}>
              <span className="text-cyan-300">200</span> <span className="text-rose-400">OK</span>
            </div>
          </div>
        </div>
      </div>

      <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <span>Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
