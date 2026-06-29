import { useNavigate } from "react-router-dom";
import { HomeIcon, ArrowRight, ClipboardCheck, Shield, FileText } from "lucide-react";

/**
 * Home page – modern landing page with feature highlights.
 */
export default function Home() {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: ClipboardCheck,
      title: "Inspeções Detalhadas",
      desc: "Registre informações completas dos equipamentos com checklist dinâmico por tipo de máquina."
    },
    {
      icon: Shield,
      title: "Segurança e Rastreabilidade",
      desc: "Histórico completo de edições, compartilhamento seguro e rastreabilidade total."
    },
    {
      icon: FileText,
      title: "Relatórios Automáticos",
      desc: "Gere PDFs profissionais com todas as informações da inspeção para entregar ao cliente."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 relative">
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-2">
              <HomeIcon className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Análise Técnica</span>
              <br />
              <span className="text-foreground">de Equipamentos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A Análise Técnica (TA) é uma inspeção totalmente detalhada de equipamentos 
              linha amarela John Deere. Registre informações, gere relatórios e garanta 
              rastreabilidade de todas as etapas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => navigate("/ferramentas")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:from-primary/90 hover:to-primary transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              >
                Ir para Ferramentas
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/sobre-nos")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all active:scale-[0.98]"
              >
                Sobre Nós
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card rounded-xl p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="glass-card rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-6">
            Acesse a ferramenta de análise técnica e crie sua primeira inspeção.
          </p>
          <button
            onClick={() => navigate("/ferramentas/analise-tecnica")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:from-primary/90 hover:to-primary transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            Criar Nova Inspeção
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}