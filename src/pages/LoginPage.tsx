import { useState, useRef } from "react";
import { useAuth } from "@/store/AuthContext";
import { HardHat, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// Rate limiting no frontend: máx 5 tentativas em 15 min (OWASP A07)
const ATTEMPT_LIMIT = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Controle de tentativas local
  const attemptsRef = useRef<number>(
    Number(sessionStorage.getItem("login_attempts") || "0")
  );
  const lockedUntilRef = useRef<number>(
    Number(sessionStorage.getItem("login_locked_until") || "0")
  );

  const isLockedOut = () => Date.now() < lockedUntilRef.current;

  const recordAttempt = () => {
    attemptsRef.current += 1;
    sessionStorage.setItem("login_attempts", String(attemptsRef.current));
    if (attemptsRef.current >= ATTEMPT_LIMIT) {
      lockedUntilRef.current = Date.now() + LOCKOUT_MS;
      sessionStorage.setItem("login_locked_until", String(lockedUntilRef.current));
      attemptsRef.current = 0;
      sessionStorage.setItem("login_attempts", "0");
    }
  };

  const clearAttempts = () => {
    attemptsRef.current = 0;
    lockedUntilRef.current = 0;
    sessionStorage.removeItem("login_attempts");
    sessionStorage.removeItem("login_locked_until");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut()) {
      const mins = Math.ceil((lockedUntilRef.current - Date.now()) / 60000);
      toast.error(`Muitas tentativas. Aguarde ${mins} minuto(s) antes de tentar novamente.`);
      return;
    }

    if (!username.trim() || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Não loga senha (OWASP A09)
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password: password,
        }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Resposta inválida do servidor");
      }

      if (res.status === 429) {
        toast.error(data?.detail || "Conta bloqueada temporariamente. Tente mais tarde.");
        return;
      }

      if (!res.ok) {
        recordAttempt();
        const remaining = ATTEMPT_LIMIT - attemptsRef.current;
        const msg = data?.detail || "Credenciais inválidas";
        // Não revela detalhes de qual campo está errado (OWASP A07)
        toast.error(remaining > 0
          ? `${msg} (${remaining} tentativa(s) restante(s))`
          : msg
        );
        return;
      }

      if (!data?.access_token) {
        throw new Error("Token não recebido do servidor");
      }

      clearAttempts();
      login(data.access_token, data.must_change_password === true, data.username || "");
      toast.success("Login realizado com sucesso");
    } catch (err: any) {
      recordAttempt();
      toast.error(err?.message || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const lockedOut = isLockedOut();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="bg-jd-yellow p-8 flex flex-col items-center justify-center">
          <div className="bg-industrial-dark p-3 rounded-full mb-4">
            <HardHat className="h-10 w-10 text-jd-yellow" />
          </div>
          <h1 className="text-2xl font-bold text-industrial-dark">Deere Inspect Pro</h1>
          <p className="text-industrial-dark/80 text-sm mt-1 text-center font-medium">
            Plataforma de Análise Técnica
          </p>
        </div>

        <div className="p-8">
          {lockedOut && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive text-center">
              Acesso temporariamente bloqueado. Aguarde alguns minutos.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                autoComplete="username"
                disabled={lockedOut || loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-12 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  autoComplete="current-password"
                  disabled={lockedOut || loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockedOut}
              className="w-full h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                "Entrando..."
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Acessar Sistema
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mt-8">
        Uso exclusivo para técnicos autorizados.
      </p>
    </div>
  );
}