import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { useNavigate } from "react-router-dom";
import { KeyRound, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
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
  { label: "Um caractere especial (!@#$%...)", test: (p) => /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(p) },
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
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.detail || "Erro ao trocar senha");
        return;
      }

      toast.success("Senha alterada com sucesso! Faça login novamente.");
      clearMustChangePassword();
      // Força novo login com nova senha
      logout();
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="bg-primary p-8 flex flex-col items-center justify-center">
          <div className="bg-primary-foreground/10 p-3 rounded-full mb-4">
            <KeyRound className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Troca de Senha</h1>
          <p className="text-primary-foreground/80 text-sm mt-1 text-center">
            Por segurança, defina uma nova senha para continuar.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Senha atual */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Senha atual</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-12 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Nova senha */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Nova senha</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-12 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Checklist de critérios */}
            {newPassword.length > 0 && (
              <div className="bg-muted/40 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Critérios de segurança</p>
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(newPassword);
                  return (
                    <div key={rule.label} className={`flex items-center gap-2 text-sm ${passed ? "text-green-500" : "text-muted-foreground"}`}>
                      {passed
                        ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        : <XCircle className="h-4 w-4 flex-shrink-0 text-destructive/60" />
                      }
                      {rule.label}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirmar senha */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-11 px-4 pr-12 rounded-lg border bg-background focus:ring-2 outline-none transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-green-500 focus:ring-green-500"
                        : "border-destructive focus:ring-destructive"
                      : "border-input focus:ring-primary"
                  }`}
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !allRulesPassed || !passwordsMatch}
              className="w-full h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Salvando..." : "Definir nova senha"}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={logout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Sair e fazer login novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
