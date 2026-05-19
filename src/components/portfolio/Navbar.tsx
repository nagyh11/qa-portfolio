import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "tools", label: "Tools" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("about");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
      const y = window.scrollY + 140;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= y) { setActive(sections[i].id); break; }
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled ? "py-2" : "py-4",
    )}>
      <div className="mx-auto max-w-6xl px-4">
        <nav className={cn(
          "flex items-center justify-between rounded-2xl px-5 py-2.5 transition-all duration-300",
          scrolled ? "glass-strong shadow-card" : "glass",
        )}>

          {/* Brand */}
          <a
            href="#hero"
            className="flex items-center gap-3 group"
          >
            {/* Logo image */}
            <div className="relative shrink-0">
              <img
                src="/qa-logo.png"
                alt="QA Engineer Logo"
                className="h-10 w-10 object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(56,189,248,0.75)] drop-shadow-[0_0_6px_rgba(56,189,248,0.35)]"
              />
            </div>

            {/* Brand text */}
            <div className="flex flex-col justify-center leading-none gap-0.5">
              <span className="font-display font-bold text-[15px] tracking-tight text-white/90 group-hover:text-white transition-colors whitespace-nowrap">
                Mohamed Nagy
              </span>
              <span className="flex items-center gap-1.5">
                {/* Divider pip */}
                <span className="h-px w-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                <span
                  className="font-display font-semibold text-[11px] tracking-[0.12em] uppercase"
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

          {/* Nav links */}
          <ul className="hidden md:flex items-center gap-0.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={cn(
                    "relative px-3 py-2 rounded-xl transition-all duration-200 hover:text-foreground font-medium",
                    active === l.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {active === l.id && (
                    <span className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20" />
                  )}
                  <span className="relative">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:brightness-110 hover:shadow-lg hover:-translate-y-px transition-all duration-200"
          >
            <span>Hire me</span>
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-3 animate-slide-down">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-3 py-2.5 rounded-xl text-sm transition-all",
                      active === l.id
                        ? "text-foreground bg-primary/10 font-medium"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => { setOpen(false); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold text-center"
                >
                  Hire me
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
