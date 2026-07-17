import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

const empty = {
  slug: "", title: "", subtitle: "", client_name: "", industry: "", region: "",
  provider_name: "", tier: "growth", hero_image: "", summary: "",
  challenge: "", solution: "", metricsText: "", quote: "", quote_author: "", published: false,
};

const metricsToText = (arr) => (arr || []).map(m => `${m.label} | ${m.value}`).join("\n");
const textToMetrics = (t) => t.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
  const [label, ...rest] = l.split("|");
  return { label: (label || "").trim(), value: (rest.join("|") || "").trim() };
}).filter(m => m.label && m.value);

const slugify = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export default function AdminCaseStudies() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/case-studies?include_drafts=true");
      setItems(data);
    } catch { toast.error("Failed to load case studies"); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (cs) => {
    setEditing(cs);
    setForm({ ...cs, metricsText: metricsToText(cs.metrics) });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.slug || !form.client_name || !form.industry) {
      toast.error("Title, slug, client, industry are required"); return;
    }
    setSaving(true);
    const payload = {
      slug: form.slug, title: form.title, subtitle: form.subtitle,
      client_name: form.client_name, industry: form.industry, region: form.region || "",
      provider_name: form.provider_name || "", tier: form.tier,
      hero_image: form.hero_image || "", summary: form.summary || "",
      challenge: form.challenge || "", solution: form.solution || "",
      metrics: textToMetrics(form.metricsText || ""),
      quote: form.quote || "", quote_author: form.quote_author || "",
      published: !!form.published,
    };
    try {
      if (editing) await api.patch(`/case-studies/${editing.id}`, payload);
      else await api.post("/case-studies", payload);
      toast.success(editing ? "Updated" : "Created");
      setOpen(false); load();
    } catch (e) {
      const detail = e.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Save failed");
    } finally { setSaving(false); }
  };

  const togglePublish = async (cs) => {
    try {
      await api.patch(`/case-studies/${cs.id}`, { published: !cs.published });
      toast.success(cs.published ? "Unpublished" : "Published");
      load();
    } catch { toast.error("Update failed"); }
  };

  const del = async (cs) => {
    if (!window.confirm(`Delete "${cs.title}"?`)) return;
    try { await api.delete(`/case-studies/${cs.id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="label-eyebrow">Case studies</div>
          <p className="text-sm text-[var(--na-text-muted)] mt-1">Wins showcased on the site. Only published ones appear publicly.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button onClick={openNew} className="btn-gold inline-flex items-center gap-2 text-sm" data-testid="cs-new-btn">
              <Plus className="w-3.5 h-3.5" /> New case study
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="cs-dialog">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit case study" : "New case study"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label>Title</Label>
                <Input data-testid="cs-title" className="na-input mt-1" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input data-testid="cs-slug" className="na-input mt-1" value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} />
              </div>
              <div className="md:col-span-2">
                <Label>Subtitle</Label>
                <Input data-testid="cs-subtitle" className="na-input mt-1" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div>
                <Label>Client name</Label>
                <Input data-testid="cs-client" className="na-input mt-1" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
              </div>
              <div>
                <Label>Provider name</Label>
                <Input data-testid="cs-provider" className="na-input mt-1" value={form.provider_name} onChange={e => setForm({ ...form, provider_name: e.target.value })} />
              </div>
              <div>
                <Label>Industry</Label>
                <Input data-testid="cs-industry" className="na-input mt-1" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
              </div>
              <div>
                <Label>Region</Label>
                <Input data-testid="cs-region" className="na-input mt-1" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
              </div>
              <div>
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={v => setForm({ ...form, tier: v })}>
                  <SelectTrigger data-testid="cs-tier" className="na-input mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hero image URL</Label>
                <Input data-testid="cs-hero" className="na-input mt-1" placeholder="https://…" value={form.hero_image} onChange={e => setForm({ ...form, hero_image: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Short summary</Label>
                <Textarea data-testid="cs-summary" rows={2} className="na-input mt-1" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Challenge</Label>
                <Textarea data-testid="cs-challenge" rows={4} className="na-input mt-1" value={form.challenge} onChange={e => setForm({ ...form, challenge: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Solution</Label>
                <Textarea data-testid="cs-solution" rows={4} className="na-input mt-1" value={form.solution} onChange={e => setForm({ ...form, solution: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Metrics <span className="text-[var(--na-text-muted)] text-xs">— one per line, format: <code className="font-mono">Label | Value</code></span></Label>
                <Textarea data-testid="cs-metrics" rows={4} placeholder={"False positives | -42%\nHandling time | -31%\nTime to prod | 8 weeks"}
                  className="na-input mt-1 font-mono text-sm" value={form.metricsText} onChange={e => setForm({ ...form, metricsText: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Quote</Label>
                <Textarea data-testid="cs-quote" rows={3} className="na-input mt-1" value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Quote author</Label>
                <Input data-testid="cs-quote-author" className="na-input mt-1" placeholder="Head of Fraud, Meridian Bank" value={form.quote_author} onChange={e => setForm({ ...form, quote_author: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex items-center justify-between mt-2 pt-4 border-t border-[var(--na-border)]">
                <div className="flex items-center gap-3">
                  <Switch data-testid="cs-publish" checked={!!form.published} onCheckedChange={v => setForm({ ...form, published: v })} />
                  <Label>Published</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <button data-testid="cs-save" onClick={save} disabled={saving} className="btn-gold text-sm">{saving ? "Saving…" : (editing ? "Save changes" : "Create")}</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="na-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--na-surface-2)] text-[var(--na-text-muted)] text-xs uppercase tracking-widest">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Client × Provider</th>
                <th className="text-left p-4">Industry</th>
                <th className="text-left p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-[var(--na-text-muted)] italic">No case studies yet</td></tr>
              )}
              {items.map(cs => (
                <tr key={cs.id} className="border-t border-[var(--na-border)]" data-testid={`cs-row-${cs.id}`}>
                  <td className="p-4">
                    <div className="text-[var(--na-text)] font-medium">{cs.title}</div>
                    <div className="text-xs text-[var(--na-text-muted)] font-mono">/case-studies/{cs.slug}</div>
                  </td>
                  <td className="p-4 text-[var(--na-text-soft)]">{cs.client_name}{cs.provider_name && <><span className="text-[var(--na-text-muted)]"> × </span>{cs.provider_name}</>}</td>
                  <td className="p-4 text-[var(--na-text-soft)]">{cs.industry}</td>
                  <td className="p-4">
                    <button onClick={() => togglePublish(cs)} className="flex items-center gap-1" data-testid={`cs-toggle-${cs.id}`}>
                      {cs.published
                        ? <span className="text-[10px] uppercase tracking-widest border rounded-full px-2 py-1 text-emerald-500 border-emerald-500/40"><Eye className="w-3 h-3 inline mr-1" /> Published</span>
                        : <span className="text-[10px] uppercase tracking-widest border rounded-full px-2 py-1 text-[var(--na-text-muted)] border-[var(--na-border-strong)]"><EyeOff className="w-3 h-3 inline mr-1" /> Draft</span>}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      {cs.published && (
                        <a href={`/case-studies/${cs.slug}`} target="_blank" rel="noreferrer" className="text-[var(--na-text-muted)] hover:text-[var(--na-text)]" title="View" data-testid={`cs-view-${cs.id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(cs)} className="text-[var(--na-text-muted)] hover:text-[var(--na-text)]" title="Edit" data-testid={`cs-edit-${cs.id}`}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => del(cs)} className="text-[var(--na-text-muted)] hover:text-rose-500" title="Delete" data-testid={`cs-delete-${cs.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
