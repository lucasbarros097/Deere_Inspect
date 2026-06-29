import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Target, Eye, Heart, Sparkles } from "lucide-react";

/**
 * Página Sobre Nós – moderna com cards estilizados.
 */
export default function SobreNos() {
  const navigate = useNavigate();

  const valores = [
    {
      icon: Sparkles,
      title: "Excelência",
      desc: "Comprometidos com a qualidade em cada detalhe."
    },
    {
      icon: Heart,
      title: "Integridade",
      desc: "Transparência total em dados e processos."
    },
    {
      icon: Target,
      title: "Segurança",
      desc: "Proteção máxima dos dados em primeiro lugar."
    },
    {
      icon: Eye,
      title: "Inovação",
      desc: "Melhorando constantemente a plataforma."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 relative">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-2">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">Sobre Nós</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Conheça nossa missão, visão e os valores que nos movem.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
        {/* Quem Somos */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Quem Somos</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Somos uma plataforma especializada em <strong className="text-foreground">análise técnica de equipamentos de construção</strong> 
                {" "}linha amarela John Deere.
              </p>
              <p>
                O Grupo Ellos nasceu a partir de um desafio empresarial. O projeto que motivou a união 
                desta equipe chama-se <strong className="text-foreground">"Melhores da Terra"</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Missão */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Missão</h2>
            </div>
            <blockquote className="text-lg text-foreground font-semibold italic text-center border-l-4 border-primary pl-6 py-3 bg-primary/5 rounded-r-xl">
              "Fornecer uma plataforma confiável, intuitiva e segura que capacite técnicos e 
              administradores a realizar análises técnicas de qualidade superior, com rastreabilidade 
              total e suporte completo a decisões operacionais e comerciais."
            </blockquote>
          </div>
        </section>

        {/* Visão */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Visão</h2>
            </div>
            <blockquote className="text-lg text-foreground font-semibold italic text-center border-l-4 border-primary pl-6 py-3 bg-primary/5 rounded-r-xl">
              "Ser a solução de referência em análise técnica digital para equipamentos de construção, 
              permitindo que empresas tomem decisões mais rápidas, precisas e confiáveis através de 
              dados estruturados e históricos auditados."
            </blockquote>
          </div>
        </section>

        {/* Valores */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Valores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {valores.map((valor) => (
              <div key={valor.title} className="glass-card rounded-xl p-6 card-hover">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <valor.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{valor.title}</h3>
                <p className="text-sm text-muted-foreground">{valor.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}