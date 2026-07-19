import { AnalysisRequest } from "@/types/inspection";

interface Props {
  data: AnalysisRequest;
  onChange: (data: AnalysisRequest) => void;
}

const CHECKBOXES: { key: keyof Omit<AnalysisRequest, "descricaoReclamacao">; label: string }[] = [
  { key: "falhaFuncional", label: "Falha funcional" },
  { key: "quebraComponente", label: "Quebra de componente" },
  { key: "analiseGarantia", label: "Análise de garantia" },
  { key: "analisePreventiva", label: "Análise preventiva" },
  { key: "tradeIn", label: "Trade-in" },
  { key: "reforma", label: "Reforma" },
  { key: "sinistro", label: "Sinistro" },
  { key: "outros", label: "Outros" },
];

export const AnalysisRequestSection = ({ data, onChange }: Props) => {
  const toggle = (key: keyof AnalysisRequest) => {
    onChange({ ...data, [key]: !data[key as keyof typeof data] });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Solicitação de Análise</h2>

      <div className="flex flex-wrap gap-2">
        {CHECKBOXES.map((item) => (
          <button
            key={item.key}
            onClick={() => toggle(item.key)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border touch-target ${
              data[item.key]
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Descrição da reclamação do cliente
        </label>
        <textarea
          value={data.descricaoReclamacao}
          onChange={(e) => onChange({ ...data, descricaoReclamacao: e.target.value })}
          rows={4}
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Descreva a reclamação..."
        />
      </div>
    </div>
  );
};
