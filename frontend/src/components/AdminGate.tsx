import { type ReactNode } from "react";
import { ShieldAlert, ArrowLeft, HardHat } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useNavigate } from "react-router-dom";

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { role } = useAuth();
  const navigate = useNavigate();

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/10 pointer-events-none" />
        <div className="w-full max-w-sm relative animate-in fade-in zoom-in-95 duration-300">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sua conta não tem permissão de administrador.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted h-12 px-4 font-semibold transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}