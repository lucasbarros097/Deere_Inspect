import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/10 pointer-events-none" />
      <div className="text-center max-w-md relative animate-in fade-in zoom-in-95 duration-300">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-destructive/10 mb-6">
          <span className="text-5xl font-bold text-destructive">404</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          A rota <code className="text-xs bg-muted px-2 py-1 rounded">{location.pathname}</code> não existe no sistema.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:from-primary/90 hover:to-primary transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Página Inicial
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;