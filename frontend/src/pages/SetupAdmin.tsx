import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HardHat, ShieldCheck, Eye, EyeOff } from "lucide-react";

/** Simple admin setup page shown only when the backend has no users. */
export default function SetupAdmin() {
  const navigate = useNavigate();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/api/setup/needs")
      .then((res) => res.json())
      .then((data) => {
        if (data.needs_setup) {
          setNeedsSetup(true);
        } else {
          navigate("/", { replace: true });
        }
      })
      .catch(() => {
        toast.error("Erro ao verificar necessidade de setup");
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Preencha usuário e senha");
      return;
    }
    if (password !== confirm) {
      toast.error("Senhas não coincidem");
      return;
    }
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/setup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: crypto.randomUUID(), username, password, role: "admin", ativo: true }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      toast.success("Admin criado com sucesso. Faça login.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Falha ao criar admin");
    }
  };

  if (needsSetup === false) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
            <HardHat className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Configuração Inicial</h1>
          <p className="text-sm text-muted-foreground mt-1">Crie o primeiro administrador do sistema</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Usuário</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Nome do administrador"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Senha do administrador"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">Confirmar Senha</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repita a senha"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              <ShieldCheck className="h-5 w-5" />
              Criar Administrador
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}