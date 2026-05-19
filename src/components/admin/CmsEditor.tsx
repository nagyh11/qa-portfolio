import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import {
  Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, AlertCircle, GripVertical,
  User, Briefcase, Wrench, BarChart2, Award, FolderGit2,
  Zap, Phone, Layout, Type, Upload, ImageIcon, X, Eye, EyeOff,
} from "lucide-react";
import { loadCmsFn, saveCmsFn } from "@/server-fns/cms";
import { uploadImageFn } from "@/server-fns/image";
import { CMS_DEFAULTS } from "@/lib/cms-defaults";
import type {
  CmsContent, HeroContent, AboutContent, Experience, ToolCategory,
  SkillGroup, Certification, Project, Achievement, ContactContent, FooterContent,
  StatItem, ProfileDetail, Skill,
} from "@/lib/cms-types";
import { cn } from "@/lib/utils";

const PasswordCtx = createContext<string>("");

type SectionKey = keyof CmsContent;

const SECTIONS: { key: SectionKey; label: string; Icon: React.ElementType }[] = [
  { key: "hero", label: "Hero", Icon: User },
  { key: "about", label: "About & Stats", Icon: Type },
  { key: "experiences", label: "Experience", Icon: Briefcase },
  { key: "tools", label: "Tools", Icon: Wrench },
  { key: "skills", label: "Skills", Icon: BarChart2 },
  { key: "certifications", label: "Certifications", Icon: Award },
  { key: "projects", label: "Projects", Icon: FolderGit2 },
  { key: "achievements", label: "Achievements", Icon: Zap },
  { key: "contact", label: "Contact Info", Icon: Phone },
  { key: "footer", label: "Footer", Icon: Layout },
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

function useSection<T>(key: SectionKey, cmsData: CmsContent | null) {
  const [data, setData] = useState<T | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (cmsData) setData(cmsData[key] as T);
  }, [cmsData, key]);

  return { data, setData, saveStatus, setSaveStatus };
}

function SaveBar({ label, status, onSave, onReset }: { label: string; status: SaveStatus; onSave: () => void; onReset: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 mb-6">
      <h2 className="text-lg font-bold">{label}</h2>
      <div className="flex items-center gap-2">
        {status === "saved" && (
          <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Saved</span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1 text-rose-400 text-xs"><AlertCircle className="h-3.5 w-3.5" /> Error</span>
        )}
        <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-white/5 transition-all">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
        <button onClick={onSave} disabled={status === "saving"}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-primary text-white text-xs font-medium hover:brightness-110 transition-all disabled:opacity-60 shadow-glow">
          {status === "saving" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          {status === "saving" ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, multiline = false, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  const cls = "mt-1 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/60 outline-none focus:shadow-glow transition-all text-sm";
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder} className={`${cls} resize-none`} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/60 outline-none text-sm transition-all" />
    </div>
  );
}

function compressImage(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 1400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const mimeType = "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, 0.85);
      const data = dataUrl.split(",")[1];
      resolve({ data, mimeType });
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const password = useContext(PasswordCtx);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setUploadError("");
    try {
      const { data, mimeType } = await compressImage(file);
      const result = await uploadImageFn({ data: { password, data, mimeType } });
      onChange(result.url);
    } catch (err) {
      console.error("[ImageField] upload error:", err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isDbUrl = value.startsWith("/api/img");
  const isDataUrl = value.startsWith("data:");

  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      {value && (
        <div className="mt-2 relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 group">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {!value && (
        <div className="mt-2 flex items-center justify-center w-28 h-28 rounded-xl border border-dashed border-white/20 text-muted-foreground/40">
          <ImageIcon className="h-7 w-7" />
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <input
          value={isDataUrl || isDbUrl ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL..."
          className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/60 outline-none text-sm transition-all"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
      {uploadError && <p className="mt-1 text-[10px] text-rose-400">{uploadError}</p>}
      {isDbUrl && <p className="mt-1 text-[10px] text-emerald-400/70">Stored in database ✓</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function ArrayTagEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim(); if (!v) return;
    onChange([...items, v]); setInput("");
  };
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="mt-1 flex flex-wrap gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 min-h-[48px]">
        {items.map((it, i) => (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
            {it}
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="hover:text-rose-400 transition-colors ml-1">×</button>
          </span>
        ))}
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter..."
          className="flex-1 min-w-[100px] bg-transparent outline-none text-xs placeholder:text-muted-foreground/50" />
      </div>
    </div>
  );
}

function BulletListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const onDragStart = (i: number) => { dragIndex.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); if (dragOver !== i) setDragOver(i); };
  const onDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) { setDragOver(null); return; }
    onChange(reorderItems(items, from, i));
    dragIndex.current = null;
    setDragOver(null);
  };
  const onDragEnd = () => { dragIndex.current = null; setDragOver(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-muted-foreground font-medium">{label}</label>
        <button onClick={() => onChange([...items, ""])}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDrop={(e) => onDrop(e, i)}
            onDragEnd={onDragEnd}
            onDragLeave={() => { if (dragOver === i) setDragOver(null); }}
            className={cn("flex gap-2 items-center rounded-lg transition-all duration-150", dragOver === i && "ring-2 ring-primary/40 bg-primary/5")}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing" title="Drag to reorder" />
            <input value={it} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary/60 outline-none text-sm transition-all" />
            <button onClick={() => i > 0 && onChange(moveItem(items, i, i - 1))} disabled={i === 0}
              title="Move up" className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-20">
              <ChevronUp className="h-3 w-3" />
            </button>
            <button onClick={() => i < items.length - 1 && onChange(moveItem(items, i, i + 1))} disabled={i === items.length - 1}
              title="Move down" className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-20">
              <ChevronDown className="h-3 w-3" />
            </button>
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-all">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollapsibleCard({ title, badge, children, onDelete, onMoveUp, onMoveDown, isFirst, isLast, dragHandlers, isDragOver }: {
  title: string; badge?: string; children: React.ReactNode;
  onDelete?: () => void; onMoveUp?: () => void; onMoveDown?: () => void;
  isFirst?: boolean; isLast?: boolean;
  dragHandlers?: React.HTMLAttributes<HTMLDivElement>;
  isDragOver?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn("glass rounded-2xl overflow-hidden border transition-all duration-150", isDragOver ? "border-primary/60 ring-2 ring-primary/20 bg-primary/5" : "border-white/5")}
      {...dragHandlers}
    >
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-all" onClick={() => setOpen(!open)}>
        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing" title="Drag to reorder" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{title}</span>
          {badge && <span className="ml-2 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono">{badge}</span>}
        </div>
        <div className="flex items-center gap-1">
          {!isFirst && <button onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }} title="Move up" className="p-1 hover:bg-white/5 rounded text-muted-foreground hover:text-foreground transition-all"><ChevronUp className="h-3.5 w-3.5" /></button>}
          {!isLast && <button onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }} title="Move down" className="p-1 hover:bg-white/5 rounded text-muted-foreground hover:text-foreground transition-all"><ChevronDown className="h-3.5 w-3.5" /></button>}
          {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-rose-500/10 rounded text-muted-foreground hover:text-rose-400 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>}
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      {open && <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">{children}</div>}
    </div>
  );
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const n = [...arr];
  [n[from], n[to]] = [n[to], n[from]];
  return n;
}

function reorderItems<T>(arr: T[], from: number, to: number): T[] {
  const n = [...arr];
  const [removed] = n.splice(from, 1);
  n.splice(to, 0, removed);
  return n;
}

function useDragReorder<T>(items: T[], onChange: (items: T[]) => void) {
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const getDragHandlers = (i: number): React.HTMLAttributes<HTMLDivElement> => ({
    draggable: true,
    onDragStart: (e) => {
      dragIndex.current = i;
      (e as React.DragEvent).dataTransfer.effectAllowed = "move";
    },
    onDragOver: (e) => {
      (e as React.DragEvent).preventDefault();
      if (dragOver !== i) setDragOver(i);
    },
    onDrop: (e) => {
      (e as React.DragEvent).preventDefault();
      const from = dragIndex.current;
      if (from === null || from === i) { setDragOver(null); return; }
      onChange(reorderItems(items, from, i));
      dragIndex.current = null;
      setDragOver(null);
    },
    onDragEnd: () => { dragIndex.current = null; setDragOver(null); },
    onDragLeave: () => { if (dragOver === i) setDragOver(null); },
  });

  return { getDragHandlers, dragOver };
}

// ─── SECTION EDITORS ──────────────────────────────────────────────────────────

function HeroEditor({ data, setData }: { data: HeroContent; setData: (d: HeroContent) => void }) {
  const set = (k: keyof HeroContent) => (v: string) => setData({ ...data, [k]: v });
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <ImageField label="Profile Photo" value={data.profileImage ?? ""} onChange={set("profileImage")} />
      </div>
      <TextField label="Full Name" value={data.name} onChange={set("name")} />
      <TextField label="Status Badge" value={data.badge} onChange={set("badge")} placeholder="Currently Open to Opportunities" />
      <TextField label="Title Line 1" value={data.title1} onChange={set("title1")} placeholder="Software Testing Engineer" />
      <TextField label="Title Line 2 (gradient)" value={data.title2} onChange={set("title2")} placeholder="Manual • API • Automation" />
      <div className="sm:col-span-2">
        <TextField label="Description" value={data.description} onChange={set("description")} multiline />
      </div>
      <TextField label="Location Tag" value={data.location} onChange={set("location")} placeholder="Based in Giza, Egypt" />
      <TextField label="Certification Tag" value={data.certification} onChange={set("certification")} placeholder="ISTQB CTFL Certified" />
      <TextField label="Experience Tag" value={data.experience} onChange={set("experience")} placeholder="1+ Years" />
    </div>
  );
}

function AboutEditor({ data, setData }: { data: AboutContent; setData: (d: AboutContent) => void }) {
  return (
    <div className="space-y-6">
      <TextField label="Bio Paragraph" value={data.bio} onChange={(v) => setData({ ...data, bio: v })} multiline />

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Stats Grid</label>
          <button onClick={() => setData({ ...data, stats: [...data.stats, { value: 0, suffix: "+", label: "New Stat" }] })}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"><Plus className="h-3 w-3" /> Add Stat</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.stats.map((s, i) => (
            <div key={i} className="glass rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Stat {i + 1}</span>
                <button onClick={() => setData({ ...data, stats: data.stats.filter((_, idx) => idx !== i) })}
                  className="p-1 rounded hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-all"><Trash2 className="h-3 w-3" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <NumberField label="Value" value={s.value} onChange={(v) => { const n = [...data.stats]; n[i] = { ...s, value: v }; setData({ ...data, stats: n }); }} />
                <TextField label="Suffix" value={s.suffix} onChange={(v) => { const n = [...data.stats]; n[i] = { ...s, suffix: v }; setData({ ...data, stats: n }); }} />
                <TextField label="Label" value={s.label} onChange={(v) => { const n = [...data.stats]; n[i] = { ...s, label: v }; setData({ ...data, stats: n }); }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Profile Details</label>
          <button onClick={() => setData({ ...data, profileDetails: [...data.profileDetails, { icon: "Briefcase", title: "", sub: "" }] })}
            className="flex items-center gap-1 text-xs text-primary transition-colors"><Plus className="h-3 w-3" /> Add</button>
        </div>
        <div className="space-y-3">
          {data.profileDetails.map((d, i) => (
            <div key={i} className="glass rounded-xl p-4 grid sm:grid-cols-3 gap-3 items-start">
              <TextField label="Icon Name" value={d.icon} onChange={(v) => { const n = [...data.profileDetails]; n[i] = { ...d, icon: v }; setData({ ...data, profileDetails: n }); }} placeholder="Briefcase" />
              <TextField label="Title" value={d.title} onChange={(v) => { const n = [...data.profileDetails]; n[i] = { ...d, title: v }; setData({ ...data, profileDetails: n }); }} />
              <div className="flex gap-2 items-end">
                <div className="flex-1"><TextField label="Subtitle" value={d.sub} onChange={(v) => { const n = [...data.profileDetails]; n[i] = { ...d, sub: v }; setData({ ...data, profileDetails: n }); }} /></div>
                <button onClick={() => setData({ ...data, profileDetails: data.profileDetails.filter((_, idx) => idx !== i) })}
                  className="mb-0.5 p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExperienceEditor({ data, setData }: { data: Experience[]; setData: (d: Experience[]) => void }) {
  const add = () => setData([...data, { company: "New Company", position: "Position", duration: "Month YYYY — Present", current: true, items: [""] }]);
  const { getDragHandlers, dragOver } = useDragReorder(data, setData);
  return (
    <div className="space-y-3">
      {data.map((exp, i) => (
        <CollapsibleCard key={i} title={exp.company} badge={exp.current ? "Current" : exp.duration}
          onDelete={() => setData(data.filter((_, idx) => idx !== i))}
          onMoveUp={() => setData(moveItem(data, i, i - 1))} onMoveDown={() => setData(moveItem(data, i, i + 1))}
          isFirst={i === 0} isLast={i === data.length - 1}
          dragHandlers={getDragHandlers(i)} isDragOver={dragOver === i}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Company" value={exp.company} onChange={(v) => { const n = [...data]; n[i] = { ...exp, company: v }; setData(n); }} />
            <TextField label="Position" value={exp.position} onChange={(v) => { const n = [...data]; n[i] = { ...exp, position: v }; setData(n); }} />
            <TextField label="Duration" value={exp.duration} onChange={(v) => { const n = [...data]; n[i] = { ...exp, duration: v }; setData(n); }} />
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id={`current-${i}`} checked={exp.current} onChange={(e) => { const n = [...data]; n[i] = { ...exp, current: e.target.checked }; setData(n); }} className="h-4 w-4 rounded" />
              <label htmlFor={`current-${i}`} className="text-sm">Current position</label>
            </div>
          </div>
          <BulletListEditor label="Responsibilities" items={exp.items} onChange={(items) => { const n = [...data]; n[i] = { ...exp, items }; setData(n); }} />
        </CollapsibleCard>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all w-full justify-center">
        <Plus className="h-4 w-4" /> Add Experience
      </button>
    </div>
  );
}

function ToolsEditor({ data, setData }: { data: ToolCategory[]; setData: (d: ToolCategory[]) => void }) {
  const add = () => setData([...data, { title: "New Category", icon: "Wrench", items: [] }]);
  const { getDragHandlers, dragOver } = useDragReorder(data, setData);
  return (
    <div className="space-y-3">
      {data.map((cat, i) => (
        <CollapsibleCard key={i} title={cat.title} badge={cat.icon}
          onDelete={() => setData(data.filter((_, idx) => idx !== i))}
          onMoveUp={() => setData(moveItem(data, i, i - 1))} onMoveDown={() => setData(moveItem(data, i, i + 1))}
          isFirst={i === 0} isLast={i === data.length - 1}
          dragHandlers={getDragHandlers(i)} isDragOver={dragOver === i}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Category Title" value={cat.title} onChange={(v) => { const n = [...data]; n[i] = { ...cat, title: v }; setData(n); }} />
            <TextField label="Icon Name (Lucide)" value={cat.icon} onChange={(v) => { const n = [...data]; n[i] = { ...cat, icon: v }; setData(n); }} placeholder="Wrench" />
          </div>
          <ArrayTagEditor label="Items (press Enter to add)" items={cat.items} onChange={(items) => { const n = [...data]; n[i] = { ...cat, items }; setData(n); }} />
        </CollapsibleCard>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all w-full justify-center">
        <Plus className="h-4 w-4" /> Add Category
      </button>
    </div>
  );
}

function SkillsEditor({ data, setData }: { data: SkillGroup[]; setData: (d: SkillGroup[]) => void }) {
  const addGroup = () => setData([...data, { title: "New Group", skills: [] }]);
  const { getDragHandlers, dragOver } = useDragReorder(data, setData);
  return (
    <div className="space-y-3">
      {data.map((group, gi) => (
        <CollapsibleCard key={gi} title={group.title} badge={`${group.skills.length} skills`}
          onDelete={() => setData(data.filter((_, idx) => idx !== gi))}
          onMoveUp={() => setData(moveItem(data, gi, gi - 1))} onMoveDown={() => setData(moveItem(data, gi, gi + 1))}
          isFirst={gi === 0} isLast={gi === data.length - 1}
          dragHandlers={getDragHandlers(gi)} isDragOver={dragOver === gi}>
          <TextField label="Group Title" value={group.title} onChange={(v) => { const n = [...data]; n[gi] = { ...group, title: v }; setData(n); }} />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground font-medium">Skills</label>
              <button onClick={() => { const n = [...data]; n[gi] = { ...group, skills: [...group.skills, { name: "", level: 80 }] }; setData(n); }}
                className="flex items-center gap-1 text-xs text-primary transition-colors"><Plus className="h-3 w-3" /> Add Skill</button>
            </div>
            {group.skills.map((sk, si) => (
              <div key={si} className="flex items-center gap-3 glass rounded-xl px-3 py-2">
                <div className="flex-1">
                  <input value={sk.name} onChange={(e) => { const n = [...data]; n[gi].skills[si] = { ...sk, name: e.target.value }; setData(n); }}
                    placeholder="Skill name" className="w-full bg-transparent outline-none text-sm" />
                </div>
                <div className="flex items-center gap-2 w-36">
                  <input type="range" min={0} max={100} value={sk.level} onChange={(e) => { const n = [...data]; n[gi].skills[si] = { ...sk, level: Number(e.target.value) }; setData(n); }}
                    className="flex-1 h-1 accent-primary" />
                  <span className="text-xs font-mono text-primary w-8 text-right">{sk.level}%</span>
                </div>
                <button onClick={() => { const n = [...data]; n[gi].skills = group.skills.filter((_, idx) => idx !== si); setData(n); }}
                  className="p-1 hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground rounded transition-all"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      ))}
      <button onClick={addGroup} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all w-full justify-center">
        <Plus className="h-4 w-4" /> Add Skill Group
      </button>
    </div>
  );
}

function CertificationsEditor({ data, setData }: { data: Certification[]; setData: (d: Certification[]) => void }) {
  const add = () => setData([...data, { name: "New Certification", issuer: "Issuer", icon: "Award" }]);
  return (
    <div className="space-y-3">
      {data.map((c, i) => (
        <div key={i} className="glass rounded-xl p-4 grid sm:grid-cols-3 gap-3 items-end">
          <TextField label="Name" value={c.name} onChange={(v) => { const n = [...data]; n[i] = { ...c, name: v }; setData(n); }} />
          <TextField label="Issuer" value={c.issuer} onChange={(v) => { const n = [...data]; n[i] = { ...c, issuer: v }; setData(n); }} />
          <div className="flex gap-2 items-end">
            <div className="flex-1"><TextField label="Icon (Lucide)" value={c.icon} onChange={(v) => { const n = [...data]; n[i] = { ...c, icon: v }; setData(n); }} /></div>
            <button onClick={() => setData(data.filter((_, idx) => idx !== i))}
              className="mb-0.5 p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all w-full justify-center">
        <Plus className="h-4 w-4" /> Add Certification
      </button>
    </div>
  );
}

function ProjectsEditor({ data, setData }: { data: Project[]; setData: (d: Project[]) => void }) {
  const add = () => setData([...data, { title: "New Project", description: "", tech: [], badge: "Project", github: "#", link: "#", image: "", showGithubLink: true, showLiveUrl: true }]);
  const { getDragHandlers, dragOver } = useDragReorder(data, setData);
  const upd = (i: number, patch: Partial<Project>) => { const n = [...data]; n[i] = { ...n[i], ...patch }; setData(n); };
  return (
    <div className="space-y-3">
      {data.map((p, i) => (
        <CollapsibleCard key={i} title={p.title} badge={p.badge}
          onDelete={() => setData(data.filter((_, idx) => idx !== i))}
          onMoveUp={() => setData(moveItem(data, i, i - 1))} onMoveDown={() => setData(moveItem(data, i, i + 1))}
          isFirst={i === 0} isLast={i === data.length - 1}
          dragHandlers={getDragHandlers(i)} isDragOver={dragOver === i}>
          <ImageField label="Project Image" value={p.image ?? ""} onChange={(v) => upd(i, { image: v })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Title" value={p.title} onChange={(v) => upd(i, { title: v })} />
            <TextField label="Badge" value={p.badge} onChange={(v) => upd(i, { badge: v })} />
            <TextField label="GitHub URL" value={p.github} onChange={(v) => upd(i, { github: v })} />
            <TextField label="Live URL" value={p.link} onChange={(v) => upd(i, { link: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 px-1">
            <label className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all", p.showGithubLink !== false ? "border-primary/40 bg-primary/5 text-foreground" : "border-white/10 text-muted-foreground")}>
              <input type="checkbox" checked={p.showGithubLink !== false} onChange={(e) => upd(i, { showGithubLink: e.target.checked })} className="h-3.5 w-3.5 rounded accent-primary" />
              {p.showGithubLink !== false ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span className="text-xs font-medium">Show GitHub link</span>
            </label>
            <label className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all", p.showLiveUrl !== false ? "border-primary/40 bg-primary/5 text-foreground" : "border-white/10 text-muted-foreground")}>
              <input type="checkbox" checked={p.showLiveUrl !== false} onChange={(e) => upd(i, { showLiveUrl: e.target.checked })} className="h-3.5 w-3.5 rounded accent-primary" />
              {p.showLiveUrl !== false ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span className="text-xs font-medium">Show Live URL</span>
            </label>
          </div>
          <TextField label="Description" value={p.description} onChange={(v) => upd(i, { description: v })} multiline />
          <ArrayTagEditor label="Tech Tags (press Enter to add)" items={p.tech} onChange={(tech) => upd(i, { tech })} />
        </CollapsibleCard>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all w-full justify-center">
        <Plus className="h-4 w-4" /> Add Project
      </button>
    </div>
  );
}

function AchievementsEditor({ data, setData }: { data: Achievement[]; setData: (d: Achievement[]) => void }) {
  const add = () => setData([...data, { value: 0, suffix: "+", label: "New Achievement", icon: "Star" }]);
  return (
    <div className="space-y-3">
      {data.map((a, i) => (
        <div key={i} className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Achievement {i + 1}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={!!a.text} onChange={(e) => { const n = [...data]; n[i] = { ...a, text: e.target.checked }; setData(n); }} className="h-3 w-3 rounded" />
                Text only (no number)
              </label>
              <button onClick={() => setData(data.filter((_, idx) => idx !== i))}
                className="p-1 rounded hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-all"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            {!a.text && (
              <>
                <NumberField label="Value" value={a.value ?? 0} onChange={(v) => { const n = [...data]; n[i] = { ...a, value: v }; setData(n); }} />
                <TextField label="Suffix" value={a.suffix ?? "+"} onChange={(v) => { const n = [...data]; n[i] = { ...a, suffix: v }; setData(n); }} />
              </>
            )}
            <div className={a.text ? "sm:col-span-3" : ""}>
              <TextField label="Label" value={a.label} onChange={(v) => { const n = [...data]; n[i] = { ...a, label: v }; setData(n); }} />
            </div>
            <TextField label="Icon (Lucide)" value={a.icon} onChange={(v) => { const n = [...data]; n[i] = { ...a, icon: v }; setData(n); }} />
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all w-full justify-center">
        <Plus className="h-4 w-4" /> Add Achievement
      </button>
    </div>
  );
}

function ContactEditor({ data, setData }: { data: ContactContent; setData: (d: ContactContent) => void }) {
  const set = (k: keyof ContactContent) => (v: string) => setData({ ...data, [k]: v });
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <TextField label="Email" value={data.email} onChange={set("email")} />
      <TextField label="Phone" value={data.phone} onChange={set("phone")} />
      <TextField label="Location" value={data.location} onChange={set("location")} />
      <div />
      <TextField label="LinkedIn URL" value={data.linkedin} onChange={set("linkedin")} />
      <TextField label="GitHub URL" value={data.github} onChange={set("github")} />
    </div>
  );
}

function FooterEditor({ data, setData }: { data: FooterContent; setData: (d: FooterContent) => void }) {
  const set = (k: keyof FooterContent) => (v: string) => setData({ ...data, [k]: v });
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <TextField label="Display Name" value={data.name} onChange={set("name")} />
      <TextField label="Email" value={data.email} onChange={set("email")} />
      <TextField label="LinkedIn URL" value={data.linkedin} onChange={set("linkedin")} />
      <TextField label="GitHub URL" value={data.github} onChange={set("github")} />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function CmsEditor({ password }: { password: string }) {
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
  const [localData, setLocalData] = useState<CmsContent | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<SectionKey, SaveStatus>>({} as Record<SectionKey, SaveStatus>);

  useEffect(() => {
    loadCmsFn().then((data) => {
      setCmsData(data);
      setLocalData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateSection = useCallback(<K extends SectionKey>(key: K, value: CmsContent[K]) => {
    setLocalData((prev) => prev ? { ...prev, [key]: value } : prev);
  }, []);

  const saveSection = async (key: SectionKey) => {
    if (!localData) return;
    setSaveStatus((prev) => ({ ...prev, [key]: "saving" }));
    try {
      await saveCmsFn({ data: { password, section: key, content: localData[key] } });
      setCmsData(localData);
      setSaveStatus((prev) => ({ ...prev, [key]: "saved" }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, [key]: "idle" })), 2500);
    } catch {
      setSaveStatus((prev) => ({ ...prev, [key]: "error" }));
    }
  };

  const resetSection = (key: SectionKey) => {
    if (!cmsData) return;
    setLocalData((prev) => prev ? { ...prev, [key]: cmsData[key] } : prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading content...
      </div>
    );
  }

  if (!localData) {
    return <div className="text-center py-12 text-rose-400 text-sm">Failed to load CMS content.</div>;
  }

  const active = SECTIONS.find((s) => s.key === activeSection)!;
  const status = saveStatus[activeSection] ?? "idle";

  return (
    <PasswordCtx.Provider value={password}>
    <div className="flex gap-0 min-h-[600px]">
      {/* Left nav */}
      <nav className="w-52 shrink-0 pr-4 border-r border-white/5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3 px-2">Sections</p>
        {SECTIONS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className={cn(
              "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all text-left mb-1",
              activeSection === key
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            {(saveStatus[key] === "saved") && <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Editor area */}
      <div className="flex-1 pl-6 overflow-y-auto">
        <SaveBar
          label={active.label}
          status={status}
          onSave={() => saveSection(activeSection)}
          onReset={() => resetSection(activeSection)}
        />

        {activeSection === "hero" && <HeroEditor data={localData.hero} setData={(d) => updateSection("hero", d)} />}
        {activeSection === "about" && <AboutEditor data={localData.about} setData={(d) => updateSection("about", d)} />}
        {activeSection === "experiences" && <ExperienceEditor data={localData.experiences} setData={(d) => updateSection("experiences", d)} />}
        {activeSection === "tools" && <ToolsEditor data={localData.tools} setData={(d) => updateSection("tools", d)} />}
        {activeSection === "skills" && <SkillsEditor data={localData.skills} setData={(d) => updateSection("skills", d)} />}
        {activeSection === "certifications" && <CertificationsEditor data={localData.certifications} setData={(d) => updateSection("certifications", d)} />}
        {activeSection === "projects" && <ProjectsEditor data={localData.projects} setData={(d) => updateSection("projects", d)} />}
        {activeSection === "achievements" && <AchievementsEditor data={localData.achievements} setData={(d) => updateSection("achievements", d)} />}
        {activeSection === "contact" && <ContactEditor data={localData.contact} setData={(d) => updateSection("contact", d)} />}
        {activeSection === "footer" && <FooterEditor data={localData.footer} setData={(d) => updateSection("footer", d)} />}
      </div>
    </div>
    </PasswordCtx.Provider>
  );
}
