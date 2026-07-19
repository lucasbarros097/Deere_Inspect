import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { useNavigate } from "react-router-dom";
import { KeyRound, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface PasswordRule {
  label: string;
  test: (p: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "Mínimo 8 caracteres", test: (p) => p.length >= 8 },
  { label: "Uma letra maiúscula (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Uma letra minúscula (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "Um número (0-9)", test: (p) => /\d/.test(p) },
  { label: "Um caractere especial (!@#$%...)", test: (p) => /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(p) },
];

export default function ChangePasswordPage() {
  const { token, logout, clearMustChangePassword } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPassed) {
      toast.error("A senha não atende aos critérios de segurança");
      return;
    }
    if (!passwordsMatch) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.detail || "Erro ao trocar senha");
        return;
      }
      toast.success("Senha alterada com sucesso! Faça login novamente.");
      clearMustChangePassword();
      logout();
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
            <KeyRound className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Troca de Senha</h1>
          <p className="text-sm text-muted-foreground mt-1">Defina uma nova senha para continuar</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Senha atual</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  autoComplete="current-password" required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Nova senha</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  autoComplete="new-password" required />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {newPassword.length > 0 && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Critérios de segurança</p>
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(newPassword);
                  return (
                    <div key={rule.label} className={`flex items-center gap-2 text-sm ${passed ? "text-green-500" : "text-muted-foreground"}`}>
                      {passed ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0 text-destructive/60" />}
                      {rule.label}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Confirmar nova senha</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-12 px-4 pr-12 rounded-xl border bg-background/50 focus:ring-2 outline-none transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch ? "border-green-500 focus:ring-green-500" : "border-destructive focus:ring-destructive"
                      : "border-input focus:ring-primary"
                  }`}
                  autoComplete="new-password" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
            </div>

            <button type="submit" disabled={loading || !allRulesPassed || !passwordsMatch}
              className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98]">
              {loading ? "Salvando..." : "Definir nova senha"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={logout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
              Sair e fazer login novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}