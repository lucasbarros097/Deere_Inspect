import { useState, useRef } from "react";
import { useAuth } from "@/store/AuthContext";
import { HardHat, ShieldCheck, Eye, EyeOff, Wrench } from "lucide-react";
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-300">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
            <HardHat className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Deere Inspect Pro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plataforma de Análise Técnica
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8">
          {lockedOut && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive text-center animate-in fade-in slide-in-from-top-2">
              Acesso temporariamente bloqueado. Aguarde alguns minutos.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">
                Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-12 px-4 pl-11 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  autoComplete="username"
                  disabled={lockedOut || loading}
                  required
                  placeholder="Seu nome de usuário"
                />
                <Wrench className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
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
                  className="w-full h-12 px-4 pl-11 pr-12 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  autoComplete="current-password"
                  disabled={lockedOut || loading}
                  required
                  placeholder="Sua senha"
                />
                <Wrench className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
              className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Acessar Sistema
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Uso exclusivo para técnicos autorizados.
        </p>
      </div>
    </div>
  );
}