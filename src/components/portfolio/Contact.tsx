import { useState } from "react";
import { Mail, Phone, MapPin, Linkedin, Github, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Button } from "@/components/ui/button";
import { submitContactFn } from "@/server-fns/contact";
import type { ContactContent } from "@/lib/cms-types";

interface FormState {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const INITIAL: FormState = { name: "", email: "", company: "", subject: "", message: "" };

const HTML_PATTERN = /<[^>]*>|javascript\s*:/i;

function containsHtml(value: string): boolean {
  return HTML_PATTERN.test(value);
}

function validateForm(data: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name.trim() || data.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  else if (containsHtml(data.name)) errors.name = "Name contains invalid characters.";
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email address.";
  if (data.company && containsHtml(data.company)) errors.company = "Company contains invalid characters.";
  if (!data.subject.trim() || data.subject.trim().length < 3) errors.subject = "Subject must be at least 3 characters.";
  else if (containsHtml(data.subject)) errors.subject = "Subject contains invalid characters.";
  if (!data.message.trim() || data.message.trim().length < 10) errors.message = "Message must be at least 10 characters.";
  else if (containsHtml(data.message)) errors.message = "Message contains invalid characters.";
  return errors;
}

const CONTACT_ICONS: Record<string, React.ElementType> = { Mail, Phone, MapPin, Linkedin, Github };

export function Contact({ contactData }: { contactData: ContactContent }) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const contacts = [
    { icon: "Mail", label: "Email", value: contactData.email, href: `mailto:${contactData.email}` },
    { icon: "Phone", label: "Phone", value: contactData.phone, href: `tel:${contactData.phone.replace(/\s/g, "")}` },
    { icon: "MapPin", label: "Location", value: contactData.location, href: "#" },
    { icon: "Linkedin", label: "LinkedIn", value: contactData.linkedin.replace("https://", ""), href: contactData.linkedin },
    { icon: "Github", label: "GitHub", value: contactData.github.replace("https://", ""), href: contactData.github },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fieldErrors = validateForm(form);
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setStatus("loading"); setErrorMsg("");
    try {
      await submitContactFn({ data: form });
      setStatus("success"); setForm(INITIAL); setErrors({});
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <section id="contact" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Contact" title="Let's build quality together." subtitle="Open to QA Engineer, Software Testing, and Automation roles." />
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <div className="glass rounded-3xl p-8 space-y-3">
            {contacts.map(({ icon, label, value, href }) => {
              const Icon = CONTACT_ICONS[icon] ?? Mail;
              return (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-all group">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-gradient-primary group-hover:text-white group-hover:shadow-glow transition-all">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-medium truncate">{value}</div>
                  </div>
                </a>
              );
            })}
          </div>

          <form onSubmit={submit} className="glass rounded-3xl p-8 space-y-4 glow-border" noValidate>
            {status === "success" && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-up">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Message sent successfully! I'll get back to you soon.
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name *" name="name" value={form.name} onChange={handleChange} placeholder="Recruiter or Hiring Manager" error={errors.name} />
              <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" error={errors.email} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company" name="company" value={form.company} onChange={handleChange} placeholder="Your company name" />
              <Field label="Subject *" name="subject" value={form.subject} onChange={handleChange} placeholder="QA opportunity at ..." error={errors.subject} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Message *</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={5}
                className={`mt-1.5 w-full px-4 py-3 rounded-xl bg-white/[0.03] border focus:bg-white/[0.05] outline-none focus:shadow-glow transition-all text-sm resize-none ${errors.message ? "border-rose-500/50" : "border-white/10 focus:border-primary/60"}`}
                placeholder="Tell me about the role..." />
              {errors.message && <p className="mt-1 text-xs text-rose-400">{errors.message}</p>}
            </div>
            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={status === "loading" || status === "success"}>
              {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                : status === "success" ? <><CheckCircle2 className="h-4 w-4" /> Sent!</>
                : <><Send className="h-4 w-4" /> Send Message</>}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <input {...props} className={`mt-1.5 w-full px-4 py-3 rounded-xl bg-white/[0.03] border focus:bg-white/[0.05] outline-none focus:shadow-glow transition-all text-sm ${error ? "border-rose-500/50" : "border-white/10 focus:border-primary/60"}`} />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
