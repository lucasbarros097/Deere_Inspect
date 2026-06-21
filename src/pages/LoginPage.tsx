import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { HardHat, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erro ao fazer login");
      }

      login(data.access_token);
      toast.success("Login realizado com sucesso");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">
                Email / Produtivo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@deere.com"
                className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">
                Senha / Produtivo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha ou produtivo"
                className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
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
