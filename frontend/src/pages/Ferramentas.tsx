import { useNavigate } from "react-router-dom";
import { Settings, ClipboardCheck, ArrowRight } from "lucide-react";

/**
 * Ferramentas hub – modern tools page with feature cards.
 */
export default function Ferramentas() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 relative">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-2">
              <Settings className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">Ferramentas</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Selecione a ferramenta desejada para começar.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 pb-20">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate("/ferramentas/analise-tecnica")}
            className="group w-full glass-card rounded-2xl p-8 card-hover text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg flex items-center justify-center mb-5">
              <ClipboardCheck className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              Análise Técnica
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Registre inspeções completas com checklist dinâmico, fotos e assinatura digital.
              Crie uma nova Análise Técnica (TA) para equipamentos linha amarela.
            </p>
            <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Criar nova inspeção
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}