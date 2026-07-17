import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedRoute><AdminDashboard /></ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
          <Toaster theme="dark" position="top-right" richColors />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
