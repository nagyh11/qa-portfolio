import { Linkedin, Github, Mail } from "lucide-react";
import type { FooterContent } from "@/lib/cms-types";

export function Footer({ data }: { data: FooterContent }) {
  return (
    <footer className="relative border-t border-white/5 py-10 mt-12">
      <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Brand — mirrors the Navbar logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <img
            src="/qa-logo.png"
            alt="QA Logo"
            className="h-9 w-9 object-contain opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_6px_rgba(56,189,248,0.35)] group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]"
          />
          <div className="flex flex-col justify-center leading-none gap-0.5">
            <span className="font-display font-bold text-[13px] tracking-tight text-white/80 group-hover:text-white transition-colors">
              Mohamed Nagy
            </span>
            <span className="flex items-center gap-1">
              <span className="h-px w-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              <span
                className="font-display font-semibold text-[10px] tracking-[0.12em] uppercase"
                style={{
                  background: "linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                QA Engineer
              </span>
            </span>
          </div>
        </a>

        {/* Copyright */}
        <span className="text-xs text-muted-foreground order-last md:order-none">
          © {new Date().getFullYear()} {data.name}. All rights reserved.
        </span>

        {/* Social links */}
        <div className="flex items-center gap-2">
          {[
            { Icon: Linkedin, href: data.linkedin },
            { Icon: Github, href: data.github },
            { Icon: Mail, href: `mailto:${data.email}` },
          ].map(({ Icon, href }, i) => (
            <a key={i} href={href} target="_blank" rel="noreferrer"
              className="grid h-9 w-9 place-items-center rounded-lg glass hover:bg-gradient-primary hover:text-white hover:shadow-glow transition-all">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
