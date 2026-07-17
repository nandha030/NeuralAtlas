import { useEffect, useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, Rocket, Sparkles, TrendingUp, RefreshCcw, LogOut, Wand2, ChevronDown, ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_COLORS = {
  new: "text-[var(--na-cyan)] border-[var(--na-cyan)]/40",
  reviewing: "text-[var(--na-gold)] border-[var(--na-gold)]/40",
  assessing: "text-[var(--na-gold)] border-[var(--na-gold)]/40",
  matched: "text-emerald-500 border-emerald-500/40",
  approved: "text-emerald-500 border-emerald-500/40",
  rejected: "text-rose-500 border-rose-500/40",
  closed: "text-[var(--na-text-muted)] border-[var(--na-border-strong)]",
};

const StatCard = ({ label, value, sub, icon: Icon }) => (
  <div className="na-card p-6" data-testid={`stat-${label.toLowerCase().replace(/\s+/g,"-")}`}>
    <div className="flex items-center justify-between">
      <div className="label-eyebrow">{label}</div>
      <Icon className="w-4 h-4 text-[var(--na-gold)]" />
    </div>
    <div className="mt-4 font-display text-4xl font-semibold text-[var(--na-text)]">{value}</div>
    {sub && <div className="text-xs text-[var(--na-text-muted)] mt-2">{sub}</div>}
  </div>
);

const KanbanCol = ({ title, items, onMove, statuses, keyName }) => (
  <div className="na-card p-5" data-testid={`kanban-col-${keyName}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="label-eyebrow">{title}</div>
      <span className="text-xs text-[var(--na-text-muted)]">{items.length}</span>
    </div>
    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
      {items.length === 0 && <div className="text-xs text-[var(--na-text-muted)] italic">No records</div>}
      {items.map((it) => (
        <div key={it.id} className="border border-[var(--na-border)] rounded-lg p-3 bg-[var(--na-bg-subtle)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-[var(--na-text)]">{it.company_name}</div>
              <div className="text-xs text-[var(--na-text-muted)] mt-0.5">{it.tier_interest ? `Tier: ${it.tier_interest}` : it.industry}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[var(--na-text-muted)] hover:text-[var(--na-text)] text-xs" data-testid={`move-${it.id}`}>Move ▾</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {statuses.map(s => (
                  <DropdownMenuItem key={s} onClick={() => onMove(it.id, s)} className="cursor-pointer capitalize">{s}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-xs text-[var(--na-text-soft)] mt-2 line-clamp-2">{it.specializations || it.project_description}</div>
          <div className="text-[10px] text-[var(--na-text-muted)] mt-2 font-mono">{it.email}</div>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [enterprises, setEnterprises] = useState([]);
  const [providers, setProviders] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [regenLoading, setRegenLoading] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [s, e, p, a] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/enterprise/intake"),
        api.get("/provider/application"),
        api.get("/assessment"),
      ]);
      setStats(s.data); setEnterprises(e.data); setProviders(p.data); setAssessments(a.data);
    } catch { toast.error("Failed to load admin data"); }
  };

  useEffect(() => { load(); }, []);

  const moveEnterprise = async (id, status) => {
    try { await api.patch(`/enterprise/intake/${id}`, { status }); toast.success("Updated"); load(); }
    catch { toast.error("Update failed"); }
  };
  const moveProvider = async (id, status) => {
    try { await api.patch(`/provider/application/${id}`, { status }); toast.success("Updated"); load(); }
    catch { toast.error("Update failed"); }
  };
  const regenShortlist = async (id) => {
    setRegenLoading(s => ({ ...s, [id]: true }));
    try {
      const { data } = await api.post(`/enterprise/intake/${id}/shortlist`);
      setEnterprises(list => list.map(e => e.id === id ? { ...e, shortlist: data.shortlist } : e));
      setExpanded(s => ({ ...s, [id]: true }));
      toast.success((data.shortlist || []).length ? "Shortlist regenerated" : "No approved providers yet");
    } catch { toast.error("Shortlist failed"); }
    finally { setRegenLoading(s => ({ ...s, [id]: false })); }
  };
  const toggleExpand = (id) => setExpanded(s => ({ ...s, [id]: !s[id] }));

  const doLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/admin/login", { replace: true });
  };

  const provStatuses = ["new","assessing","approved","rejected"];
  const entStatuses = ["new","reviewing","matched","closed"];

  return (
    <div className="min-h-screen bg-[var(--na-bg)] text-[var(--na-text)]" data-testid="admin-page">
      <header className="border-b border-[var(--na-border)] na-glass sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-[var(--na-text-muted)] hover:text-[var(--na-text)]" data-testid="admin-back">
              <ArrowLeft className="w-4 h-4" /> <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Wordmark />
              <span className="text-xs uppercase tracking-widest text-[var(--na-text-muted)] ml-2">· Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={load} className="btn-ghost text-sm flex items-center gap-2" data-testid="admin-refresh">
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={doLogout} className="btn-ghost text-sm flex items-center gap-2" data-testid="admin-logout">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="label-eyebrow mb-3">Operator dashboard</div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-[var(--na-text)]">Pipeline &amp; Vetting</h1>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-5">
          <StatCard label="Enterprises" value={stats?.enterprises.total ?? "–"} sub={`${stats?.enterprises.new ?? 0} new · ${stats?.enterprises.matched ?? 0} matched`} icon={Building2} />
          <StatCard label="Providers" value={stats?.providers.total ?? "–"} sub={`${stats?.providers.approved ?? 0} approved`} icon={Rocket} />
          <StatCard label="Assessments" value={stats?.assessments_total ?? "–"} sub="AI reports generated" icon={Sparkles} />
          <StatCard label="Estimated ARR" value={`$${(stats?.estimated_arr_usd ?? 0).toLocaleString()}`} sub="from approved providers" icon={TrendingUp} />
        </div>

        <div className="mt-12">
          <Tabs defaultValue="providers" className="w-full">
            <TabsList>
              <TabsTrigger value="providers" data-testid="tab-providers">Provider Vetting</TabsTrigger>
              <TabsTrigger value="enterprises" data-testid="tab-enterprises">Enterprise Leads</TabsTrigger>
              <TabsTrigger value="assessments" data-testid="tab-assessments">AI Assessments</TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {provStatuses.map(st => (
                  <KanbanCol key={st} keyName={st} title={st.toUpperCase()}
                    items={providers.filter(p => p.status === st)}
                    onMove={moveProvider}
                    statuses={provStatuses.filter(s => s !== st)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="enterprises" className="mt-8">
              <div className="na-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--na-surface-2)] text-[var(--na-text-muted)] text-xs uppercase tracking-widest">
                      <tr>
                        <th className="text-left p-4">Company</th>
                        <th className="text-left p-4">Contact</th>
                        <th className="text-left p-4">Industry</th>
                        <th className="text-left p-4">Size</th>
                        <th className="text-left p-4">Budget</th>
                        <th className="text-left p-4">Status</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {enterprises.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center text-[var(--na-text-muted)] italic">No enterprise intakes yet</td></tr>
                      )}
                      {enterprises.map(e => (
                        <Fragment key={e.id}>
                          <tr className="border-t border-[var(--na-border)]" data-testid={`row-ent-${e.id}`}>
                            <td className="p-4 text-[var(--na-text)]">
                              <button
                                className="flex items-center gap-1 text-left hover:text-[var(--na-gold)]"
                                onClick={() => toggleExpand(e.id)}
                                data-testid={`row-ent-expand-${e.id}`}
                              >
                                {expanded[e.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                {e.company_name}
                                {(e.shortlist?.length || 0) > 0 && (
                                  <span className="ml-2 text-[10px] uppercase tracking-widest text-[var(--na-cyan)] border border-[var(--na-cyan)]/40 rounded-full px-1.5 py-0.5">
                                    {e.shortlist.length} match{e.shortlist.length > 1 ? "es" : ""}
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="p-4 text-[var(--na-text-soft)]">{e.contact_name}<div className="text-xs text-[var(--na-text-muted)] font-mono">{e.email}</div></td>
                            <td className="p-4 text-[var(--na-text-soft)]">{e.industry}</td>
                            <td className="p-4 text-[var(--na-text-soft)]">{e.company_size}</td>
                            <td className="p-4 text-[var(--na-text-soft)]">{e.budget_range}</td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase tracking-widest border rounded-full px-2 py-1 ${STATUS_COLORS[e.status] || ""}`}>{e.status}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => regenShortlist(e.id)}
                                  disabled={regenLoading[e.id]}
                                  className="text-xs h-8 px-3 rounded-full border border-[var(--na-border-strong)] hover:border-[var(--na-gold)] flex items-center gap-1 disabled:opacity-50"
                                  data-testid={`ent-shortlist-${e.id}`}
                                  title="Regenerate AI shortlist"
                                >
                                  <Wand2 className="w-3 h-3" /> {regenLoading[e.id] ? "…" : "Match"}
                                </button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="text-xs h-8" data-testid={`ent-update-${e.id}`}>Status ▾</Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    {entStatuses.map(s => (
                                      <DropdownMenuItem key={s} onClick={() => moveEnterprise(e.id, s)} className="capitalize">{s}</DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                          {expanded[e.id] && (
                            <tr className="bg-[var(--na-bg-subtle)]" data-testid={`row-ent-detail-${e.id}`}>
                              <td colSpan={7} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <div className="label-eyebrow mb-2">Project brief</div>
                                    <p className="text-sm text-[var(--na-text-soft)] leading-relaxed">{e.project_description}</p>
                                    <div className="mt-3 text-xs text-[var(--na-text-muted)]">
                                      Timeline: {e.timeline} · Region: {e.region}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="label-eyebrow mb-2 flex items-center gap-2"><Wand2 className="w-3 h-3" /> AI Shortlist</div>
                                    {(e.shortlist?.length || 0) === 0 ? (
                                      <p className="text-xs text-[var(--na-text-muted)] italic">
                                        No matches yet. {providers.filter(p => p.status === "approved").length === 0
                                          ? "Approve at least one provider, then click Match."
                                          : "Click Match to generate a shortlist."}
                                      </p>
                                    ) : (
                                      <ol className="space-y-3">
                                        {e.shortlist.map((m, idx) => (
                                          <li key={m.provider_id} className="border border-[var(--na-border)] rounded-lg p-3 bg-[var(--na-surface)]">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="text-sm font-medium text-[var(--na-text)]">
                                                <span className="text-[var(--na-gold)] font-mono mr-2">#{idx + 1}</span>
                                                {m.name}
                                              </div>
                                              <span className="text-[10px] uppercase tracking-widest text-[var(--na-gold)] border border-[var(--na-gold)]/40 rounded-full px-2 py-0.5">{m.tier}</span>
                                            </div>
                                            <p className="mt-2 text-xs text-[var(--na-text-soft)] leading-relaxed">{m.fit_reason}</p>
                                          </li>
                                        ))}
                                      </ol>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {assessments.length === 0 && <div className="text-[var(--na-text-muted)] italic">No assessments generated yet</div>}
                {assessments.map(a => (
                  <div key={a.id} className="na-card p-6" data-testid={`asmt-${a.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-display text-xl font-semibold text-[var(--na-text)]">{a.company_name}</div>
                        <div className="text-xs text-[var(--na-text-muted)] mt-1">{a.industry} · {a.email}</div>
                      </div>
                      <div className="font-display text-3xl font-semibold text-[var(--na-gold)]">{a.score}<span className="text-xs text-[var(--na-text-muted)]">/100</span></div>
                    </div>
                    <details className="mt-4">
                      <summary className="text-xs text-[var(--na-cyan)] cursor-pointer">View report</summary>
                      <pre className="whitespace-pre-wrap text-sm text-[var(--na-text-soft)] mt-3 font-sans leading-relaxed">{a.report_markdown}</pre>
                    </details>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
