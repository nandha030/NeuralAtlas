import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, Building2, Rocket, Sparkles, TrendingUp, Compass, RefreshCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STATUS_COLORS = {
  new: "text-[#00E5FF] border-[#00E5FF]/30",
  reviewing: "text-[#C5A059] border-[#C5A059]/30",
  assessing: "text-[#C5A059] border-[#C5A059]/30",
  matched: "text-emerald-400 border-emerald-400/30",
  approved: "text-emerald-400 border-emerald-400/30",
  rejected: "text-rose-400 border-rose-400/30",
  closed: "text-white/50 border-white/20",
};

const StatCard = ({ label, value, sub, icon: Icon }) => (
  <div className="na-card p-6" data-testid={`stat-${label.toLowerCase().replace(/\s+/g,"-")}`}>
    <div className="flex items-center justify-between">
      <div className="label-eyebrow">{label}</div>
      <Icon className="w-4 h-4 text-[#C5A059]" />
    </div>
    <div className="mt-4 font-display text-4xl">{value}</div>
    {sub && <div className="text-xs text-white/50 mt-2">{sub}</div>}
  </div>
);

const KanbanCol = ({ title, items, onMove, statuses, keyName }) => (
  <div className="na-card p-5" data-testid={`kanban-col-${keyName}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="label-eyebrow">{title}</div>
      <span className="text-xs text-white/40">{items.length}</span>
    </div>
    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
      {items.length === 0 && <div className="text-xs text-white/30 italic">No records</div>}
      {items.map((it) => (
        <div key={it.id} className="border border-white/8 rounded-lg p-3 bg-[#0A0E17]/60">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-white">{it.company_name}</div>
              <div className="text-xs text-white/50 mt-0.5">{it.tier_interest ? `Tier: ${it.tier_interest}` : it.industry}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white/50 hover:text-white text-xs" data-testid={`move-${it.id}`}>Move ▾</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#111827] border-white/10 text-white">
                {statuses.map(s => (
                  <DropdownMenuItem key={s} onClick={() => onMove(it.id, s)} className="cursor-pointer">
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-xs text-white/60 mt-2 line-clamp-2">{it.specializations || it.project_description}</div>
          <div className="text-[10px] text-white/30 mt-2 font-mono">{it.email}</div>
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
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, e, p, a] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/enterprise/intake"),
        api.get("/provider/application"),
        api.get("/assessment"),
      ]);
      setStats(s.data);
      setEnterprises(e.data);
      setProviders(p.data);
      setAssessments(a.data);
    } catch {
      toast.error("Failed to load admin data");
    } finally { setLoading(false); }
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

  const provStatuses = ["new","assessing","approved","rejected"];
  const entStatuses = ["new","reviewing","matched","closed"];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white" data-testid="admin-page">
      <header className="border-b border-white/5 na-glass sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white" data-testid="admin-back">
              <ArrowLeft className="w-4 h-4" /> <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#C5A059] to-[#00E5FF] flex items-center justify-center">
                <Compass className="w-4 h-4 text-[#0A0E17]" />
              </div>
              <span className="font-display text-lg">NeuralAtlas · Admin</span>
            </div>
          </div>
          <button onClick={load} className="btn-ghost text-sm flex items-center gap-2" data-testid="admin-refresh">
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="label-eyebrow mb-3">Operator dashboard</div>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">Pipeline &amp; Vetting</h1>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-5">
          <StatCard label="Enterprises" value={stats?.enterprises.total ?? "–"} sub={`${stats?.enterprises.new ?? 0} new · ${stats?.enterprises.matched ?? 0} matched`} icon={Building2} />
          <StatCard label="Providers" value={stats?.providers.total ?? "–"} sub={`${stats?.providers.approved ?? 0} approved`} icon={Rocket} />
          <StatCard label="Assessments" value={stats?.assessments_total ?? "–"} sub="AI reports generated" icon={Sparkles} />
          <StatCard label="Estimated ARR" value={`$${(stats?.estimated_arr_usd ?? 0).toLocaleString()}`} sub="from approved providers" icon={TrendingUp} />
        </div>

        <div className="mt-12">
          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="bg-[#111827] border border-white/8">
              <TabsTrigger value="providers" data-testid="tab-providers">Provider Vetting</TabsTrigger>
              <TabsTrigger value="enterprises" data-testid="tab-enterprises">Enterprise Leads</TabsTrigger>
              <TabsTrigger value="assessments" data-testid="tab-assessments">AI Assessments</TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {provStatuses.map(st => (
                  <KanbanCol
                    key={st}
                    keyName={st}
                    title={st.toUpperCase()}
                    items={providers.filter(p => p.status === st)}
                    onMove={moveProvider}
                    statuses={provStatuses.filter(s => s !== st)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="enterprises" className="mt-8">
              <div className="na-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#111827] text-white/60 text-xs uppercase tracking-widest">
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
                        <tr><td colSpan={7} className="p-8 text-center text-white/40 italic">No enterprise intakes yet</td></tr>
                      )}
                      {enterprises.map(e => (
                        <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.02]" data-testid={`row-ent-${e.id}`}>
                          <td className="p-4 text-white">{e.company_name}</td>
                          <td className="p-4 text-white/70">{e.contact_name}<div className="text-xs text-white/40 font-mono">{e.email}</div></td>
                          <td className="p-4 text-white/70">{e.industry}</td>
                          <td className="p-4 text-white/70">{e.company_size}</td>
                          <td className="p-4 text-white/70">{e.budget_range}</td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase tracking-widest border rounded-full px-2 py-1 ${STATUS_COLORS[e.status] || ""}`}>{e.status}</span>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="text-xs h-8" data-testid={`ent-update-${e.id}`}>Update ▾</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-[#111827] border-white/10 text-white">
                                {entStatuses.map(s => (
                                  <DropdownMenuItem key={s} onClick={() => moveEnterprise(e.id, s)}>{s}</DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {assessments.length === 0 && <div className="text-white/40 italic">No assessments generated yet</div>}
                {assessments.map(a => (
                  <div key={a.id} className="na-card p-6" data-testid={`asmt-${a.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-display text-xl">{a.company_name}</div>
                        <div className="text-xs text-white/50 mt-1">{a.industry} · {a.email}</div>
                      </div>
                      <div className="font-display text-3xl text-[#C5A059]">{a.score}<span className="text-xs text-white/40">/100</span></div>
                    </div>
                    <details className="mt-4">
                      <summary className="text-xs text-[#00E5FF] cursor-pointer">View report</summary>
                      <pre className="whitespace-pre-wrap text-sm text-white/75 mt-3 font-sans leading-relaxed">{a.report_markdown}</pre>
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
