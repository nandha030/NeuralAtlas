import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--na-bg)] text-[var(--na-text-muted)]">
        <div className="text-sm animate-pulse">Verifying session…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};
