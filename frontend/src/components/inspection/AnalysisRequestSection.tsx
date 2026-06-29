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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHECKBOXES.map((item) => (
          <button
            key={item.key}
            onClick={() => toggle(item.key)}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 touch-target text-left transition-colors ${
              data[item.key]
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}
          >
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                data[item.key] ? "border-primary bg-primary" : "border-muted-foreground"
              }`}
            >
              {data[item.key] && (
                <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="font-medium text-foreground">{item.label}</span>
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
