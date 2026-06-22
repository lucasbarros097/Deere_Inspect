import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Target, Eye, Users } from "lucide-react";

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="industrial-header px-4 py-5 sticky top-0 z-50">
                <div className="container max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition"
                    >
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h1 className="text-xl font-bold text-jd-yellow">Sobre Nós</h1>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-12 space-y-16">
                {/* Quem Somos */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary p-3 rounded-lg">
                            <Users className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Quem Somos</h2>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                        <p className="text-foreground leading-relaxed">
                            Somos uma plataforma especializada em <strong>análise técnica de equipamentos de construção</strong> linha amarela John Deere.
                            Desenvolvemos soluções inovadoras para técnicos e administradores que necessitam de ferramentas eficientes,
                            seguras e acessíveis para realizar inspeções em qualquer local.
                        </p>
                        <p className="text-foreground leading-relaxed">
                            Com foco em <strong>qualidade, rastreabilidade e segurança dos dados</strong>, nosso sistema permite que técnicos
                            registrem inspeções de forma detalhada, compartilhem resultados de forma segura e mantenham um histórico completo
                            de todas as análises realizadas.
                        </p>
                        <p className="text-foreground leading-relaxed">
                            Acreditamos que tecnologia bem aplicada transforma a forma como trabalhos técnicos são realizados,
                            trazendo mais precisão, organização e confiabilidade aos processos.
                        </p>
                    </div>
                </section>

                {/* Missão */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary p-3 rounded-lg">
                            <Target className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Missão</h2>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <p className="text-lg text-foreground font-semibold italic text-center">
                            "Fornecer uma plataforma confiável, intuitiva e segura que capacite técnicos e administradores
                            a realizar análises técnicas de qualidade superior, com rastreabilidade total e suporte completo
                            a decisões operacionais e comerciais."
                        </p>
                    </div>
                </section>

                {/* Visão */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary p-3 rounded-lg">
                            <Eye className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Visão</h2>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <p className="text-lg text-foreground font-semibold italic text-center">
                            "Ser a solução de referência em análise técnica digital para equipamentos de construção,
                            permitindo que empresas tomem decisões mais rápidas, precisas e confiáveis através de
                            dados estruturados e históricos auditados."
                        </p>
                    </div>
                </section>

                {/* Valores */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary p-3 rounded-lg">
                            <Heart className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Valores</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                title: "Excelência",
                                desc: "Comprometidos com a qualidade em cada detalhe de nossas soluções e serviços."
                            },
                            {
                                title: "Integridade",
                                desc: "Transparência total em dados, processos e relacionamento com nossos Clientes."
                            },
                            {
                                title: "Segurança",
                                desc: "Proteção máxima dos dados e privacidade dos Clientes em primeiro lugar."
                            },
                            {
                                title: "Inovação",
                                desc: "Constantemente buscando melhorar e adaptar nossa plataforma às necessidades reais dos nossos Clientes."
                            },
                            {
                                title: "Acessibilidade",
                                desc: "Ferramentas simples, intuitivas e disponíveis em qualquer dispositivo e localização."
                            },
                            {
                                title: "Rastreabilidade",
                                desc: "Registro completo e auditável de todas as ações, edições e decisões tomadas."
                            },
                        ].map((valor) => (
                            <div key={valor.title} className="bg-card border border-border rounded-lg p-5">
                                <h3 className="text-lg font-bold text-primary mb-2">{valor.title}</h3>
                                <p className="text-sm text-muted-foreground">{valor.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-primary/10 border border-primary/30 rounded-xl p-8 text-center space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Pronto para começar?</h2>
                    <p className="text-muted-foreground">
                        Volte à página inicial e crie sua primeira inspeção agora mesmo.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Voltar ao Início
                    </button>
                </section>
            </main>
        </div>
    );
}