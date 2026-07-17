import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Lock, LogIn, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const formatErr = (d) => {
  if (!d) return "Login failed";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map(e => e?.msg || JSON.stringify(e)).join(" ");
  return d?.msg || JSON.stringify(d);
};

export default function AdminLogin() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e?.preventDefault();
    if (!email || !password) { toast.error("Enter email and password"); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(formatErr(err.response?.data?.detail) || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--na-bg)] text-[var(--na-text)] flex items-center justify-center p-6 relative">
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[var(--na-text-muted)] hover:text-[var(--na-text)] text-sm" data-testid="login-back">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Wordmark />
          <div className="label-eyebrow mt-6">Operator Console</div>
        </div>

        <form onSubmit={submit} className="na-card p-8 tracing-border" data-testid="login-form">
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-4 h-4 text-[var(--na-gold)]" />
              <h1 className="font-display text-2xl font-semibold">Admin sign in</h1>
            </div>
            <p className="text-sm text-[var(--na-text-muted)] mb-6">Restricted access. Only NeuralAtlas operators.</p>

            <div className="space-y-4">
              <div>
                <Label className="text-[var(--na-text-soft)] text-xs uppercase tracking-widest">Email</Label>
                <Input
                  data-testid="login-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="na-input mt-2"
                  placeholder="you@neuralatlas.io"
                />
              </div>
              <div>
                <Label className="text-[var(--na-text-soft)] text-xs uppercase tracking-widest">Password</Label>
                <Input
                  data-testid="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="na-input mt-2"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="btn-gold w-full mt-8 inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Signing in…" : (<>Sign in <LogIn className="w-4 h-4" /></>)}
            </button>

            <p className="text-[10px] text-[var(--na-text-muted)] text-center mt-6 font-mono">
              NEURALATLAS · BANGALORE · DUBAI
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
