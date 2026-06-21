import { type ReactNode } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-lg space-y-5 flex flex-col items-center text-center">
          <div className="bg-destructive/10 p-4 rounded-full mb-2">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Acesso Negado</h1>
          <p className="text-sm text-muted-foreground">
            Sua conta não tem permissão de administrador. Volte para a página inicial.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 px-4 font-semibold transition-colors mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return <div className="relative">{children}</div>;
}