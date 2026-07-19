import { OperatingConditions } from "@/types/inspection";

interface Props {
  data: OperatingConditions;
  onChange: (data: OperatingConditions) => void;
}

const APP_TYPES = ["Carga", "Transporte", "Pátio", "Outro"];

export const OperatingConditionsSection = ({ data, onChange }: Props) => {
  const toggleApp = (app: string) => {
    const current = data.tipoAplicacao;
    const updated = current.includes(app) ? current.filter((a) => a !== app) : [...current, app];
    onChange({ ...data, tipoAplicacao: updated });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Condições de Operação</h2>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Tipo de Aplicação</label>
        <div className="flex flex-wrap gap-2">
          {APP_TYPES.map((app) => (
            <button
              key={app}
              onClick={() => toggleApp(app)}
              className={`px-4 py-3 rounded-lg border-2 font-medium touch-target transition-colors ${
                data.tipoAplicacao.includes(app)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {app}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Material Manuseado</label>
          <input
            value={data.materialManuseado}
            onChange={(e) => onChange({ ...data, materialManuseado: e.target.value })}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground touch-target focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Condições Ambientais</label>
          <input
            value={data.condicoesAmbientais}
            onChange={(e) => onChange({ ...data, condicoesAmbientais: e.target.value })}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground touch-target focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <YesNoField
          label="Operador treinado conforme padrão JD"
          value={data.operadorTreinado}
          onChange={(v) => onChange({ ...data, operadorTreinado: v })}
        />
        <YesNoField
          label="Plano de manutenção em dia"
          value={data.planoManutencao}
          onChange={(v) => onChange({ ...data, planoManutencao: v })}
        />
      </div>
    </div>
  );
};

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "sim" | "nao" | "";
  onChange: (v: "sim" | "nao") => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      <div className="flex gap-3">
        {(["sim", "nao"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 p-3 rounded-lg border-2 font-medium touch-target transition-colors ${
              value === opt
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {opt === "sim" ? "Sim" : "Não"}
          </button>
        ))}
      </div>
    </div>
  );
}
