import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import {
  Search, Trash2, Eye, EyeOff, Download, LogOut, Shield,
  Mail, Building2, Calendar, Tag, Loader2, RefreshCw, LayoutDashboard, FileEdit,
} from "lucide-react";
import { adminLoginFn, getMessagesFn, updateStatusFn, deleteMessageFn } from "@/server-fns/admin";
import { cn } from "@/lib/utils";

const CmsEditor = lazy(() =>
  import("@/components/admin/CmsEditor").then((m) => ({ default: m.CmsEditor }))
);

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Message {
  id: number;
  name: string;
  email: string;
  company: string | null;
  subject: string;
  message: string;
  created_at: string;
  status: "read" | "unread";
}

type Tab = "messages" | "cms";

function AdminPage() {
  const [password, setPassword] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") ?? "" : ""
  );
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("messages");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      await adminLoginFn({ data: { password } });
      sessionStorage.setItem("admin_pw", password);
      setAuthed(true);
    } catch {
      setLoginError("Incorrect password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_pw");
    setAuthed(false);
    setPassword("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative w-full max-w-sm">
          <div className="glass-strong rounded-3xl p-8 glow-border shadow-card">
            <div className="flex flex-col items-center mb-8">
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-4">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter password to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/60 outline-none focus:shadow-glow transition-all text-sm" />
                {loginError && <p className="mt-2 text-xs text-rose-400">{loginError}</p>}
              </div>
              <button type="submit" disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-gradient-primary text-white text-sm font-medium shadow-glow hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                {loginLoading ? "Verifying..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
            <button onClick={() => setTab("messages")}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                tab === "messages" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground")}>
              <LayoutDashboard className="h-4 w-4" /> Messages
            </button>
            <button onClick={() => setTab("cms")}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                tab === "cms" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground")}>
              <FileEdit className="h-4 w-4" /> Content CMS
            </button>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === "messages" && <MessagesPanel password={password} />}
        {tab === "cms" && (
          <div className="glass rounded-3xl p-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-24 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  Loading editor…
                </div>
              }
            >
              <CmsEditor password={password} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesPanel({ password }: { password: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");
  const [filterDate, setFilterDate] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { messages: msgs } = await getMessagesFn({ data: { password } });
      setMessages(msgs as unknown as Message[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleStatus = async (msg: Message) => {
    const next = msg.status === "read" ? "unread" : "read";
    setActionLoading(msg.id);
    try {
      await updateStatusFn({ data: { password, id: msg.id, status: next } });
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: next } : m));
      if (selected?.id === msg.id) setSelected({ ...selected, status: next });
    } finally { setActionLoading(null); }
  };

  const deleteMsg = async (id: number) => {
    if (!confirm("Delete this message permanently?")) return;
    setActionLoading(id);
    try {
      await deleteMessageFn({ data: { password, id } });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } finally { setActionLoading(null); }
  };

  const filtered = useMemo(() => messages.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) ||
      (m.company ?? "").toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    const matchDate = !filterDate || m.created_at.startsWith(filterDate);
    return matchSearch && matchStatus && matchDate;
  }), [messages, search, filterStatus, filterDate]);

  const exportCsv = () => {
    const headers = ["ID", "Name", "Email", "Company", "Subject", "Message", "Date", "Status"];
    const rows = filtered.map((m) => [m.id, `"${m.name}"`, `"${m.email}"`, `"${m.company ?? ""}"`,
      `"${m.subject}"`, `"${m.message.replace(/"/g, '""')}"`, new Date(m.created_at).toLocaleString(), m.status]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `contact_messages_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center justify-between w-full">
          <p className="text-sm text-muted-foreground">{messages.length} total · {messages.filter((m) => m.status === "unread").length} unread</p>
          <div className="flex gap-2">
            <button onClick={fetchMessages} disabled={loading}
              className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all" title="Refresh">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
            <button onClick={exportCsv}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name, email, company..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/60 outline-none text-sm transition-all" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | "read" | "unread")}
          className="px-3 py-2.5 rounded-xl bg-[#0d1117] text-white border border-white/10 focus:border-primary/60 outline-none text-sm transition-all">
          <option value="all" className="bg-[#0d1117] text-white">All Status</option>
          <option value="unread" className="bg-[#0d1117] text-white">Unread</option>
          <option value="read" className="bg-[#0d1117] text-white">Read</option>
        </select>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-[#0d1117] text-white border border-white/10 focus:border-primary/60 outline-none text-sm transition-all [color-scheme:dark]" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading messages...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No messages found.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
          <div className="space-y-3">
            {filtered.map((msg) => (
              <div key={msg.id} onClick={() => setSelected(msg)}
                className={cn("glass rounded-2xl p-5 cursor-pointer transition-all hover:border-primary/30 border",
                  selected?.id === msg.id ? "border-primary/40 shadow-glow" : "border-white/5",
                  msg.status === "unread" && "border-l-2 border-l-primary")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {msg.status === "unread" && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      <span className="font-semibold text-sm truncate">{msg.name}</span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium",
                        msg.status === "unread" ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground")}>
                        {msg.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {msg.email}</span>
                      {msg.company && <span className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> {msg.company}</span>}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground font-medium flex items-center gap-1"><Tag className="h-3 w-3" /> {msg.subject}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); toggleStatus(msg); }} disabled={actionLoading === msg.id}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all">
                        {actionLoading === msg.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : msg.status === "read" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteMsg(msg.id); }} disabled={actionLoading === msg.id}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected ? (
            <div className="glass rounded-2xl p-6 h-fit sticky top-24">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-bold">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                  {selected.company && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Building2 className="h-3 w-3" /> {selected.company}</p>}
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium",
                  selected.status === "unread" ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground")}>
                  {selected.status}
                </span>
              </div>
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Tag className="h-3 w-3" /> Subject</p>
                <p className="text-sm font-medium">{selected.subject}</p>
              </div>
              <div className="mb-5">
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {selected.message}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-5 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date(selected.created_at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
              </p>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(selected)} disabled={actionLoading === selected.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-primary/10 hover:text-primary border border-white/10 text-sm transition-all">
                  {selected.status === "read" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  Mark {selected.status === "read" ? "Unread" : "Read"}
                </button>
                <button onClick={() => deleteMsg(selected.id)} disabled={actionLoading === selected.id}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 text-sm transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 flex items-center justify-center h-64 text-muted-foreground text-sm">
              Select a message to view details
            </div>
          )}
        </div>
      )}
    </>
  );
}
