import { InspectionHeader as HeaderType, EquipmentType, EQUIPMENT_LABELS } from "@/types/inspection";
import { AlertCircle } from "lucide-react";

interface Props {
  header: HeaderType;
  onChange: (header: HeaderType) => void;
  isFinalized?: boolean;
}

export const InspectionHeader = ({ header, onChange, isFinalized }: Props) => {
  const update = (field: keyof HeaderType, value: string) => {
    onChange({ ...header, [field]: value });
  };

  const PLACEHOLDER_MODELO: Record<EquipmentType, string> = {
    "escavadeira": "Ex: 130P",
    "trator-esteira": "Ex: 750J",
    "retroescavadeira": "Ex: 310P",
    "pa-carregadeira": "Ex: 524K",
    "motoniveladora": "Ex: 670G",
  };

  // Valida campos obrigatórios
  const requiredFields = ["cliente", "marcaModelo", "ano", "numeroOs", "numeroSerie", "tecnicoResponsavel", "data"];
  const missingFields = requiredFields.filter(
    (field) => !header[field as keyof HeaderType]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Dados Iniciais</h2>
        {header.rastreabilidade > 0 && (
          <span className="bg-primary/20 text-primary px-3 py-1 text-sm font-bold rounded-lg border border-primary/30">
            Tracker: Nº {String(header.rastreabilidade).padStart(5, '0')}
          </span>
        )}
      </div>

      {/* Alert de campos obrigatórios */}
      {missingFields.length > 0 && !isFinalized && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Campos obrigatórios faltando:</p>
            <p className="text-xs text-destructive/80">
              {missingFields.map((f) => {
                const labels: Record<string, string> = {
                  cliente: "Cliente",
                  marcaModelo: "Marca/Modelo",
                  ano: "Ano",
                  numeroOs: "Nº de O.S",
                  numeroSerie: "Número de Série",
                  tecnicoResponsavel: "Técnico Responsável",
                  data: "Data",
                };
                return labels[f] || f;
              }).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Cliente"
          required
          value={header.cliente}
          onChange={(v) => update("cliente", v)}
          disabled={isFinalized}
        />

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Tipo de Equipamento
          </label>
          <select
            value={header.tipoEquipamento}
            disabled
            className="w-full p-3 rounded-lg border border-border bg-muted text-foreground touch-target"
          >
            {(Object.keys(EQUIPMENT_LABELS) as EquipmentType[]).map((t) => (
              <option key={t} value={t}>{EQUIPMENT_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <Field
          label="Marca / Modelo John Deere"
          required
          value={header.marcaModelo}
          onChange={(v) => update("marcaModelo", v)}
          placeholder={PLACEHOLDER_MODELO[header.tipoEquipamento] || "Ex: 310L"}
          disabled={isFinalized}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Ano"
            required
            value={header.ano}
            onChange={(v) => update("ano", v)}
            type="number"
            disabled={isFinalized}
          />
          <Field
            label="Nº de O.S"
            required
            value={header.numeroOs}
            onChange={(v) => update("numeroOs", v)}
            disabled={isFinalized}
          />
        </div>

        <Field
          label="Número de Série"
          required
          value={header.numeroSerie}
          onChange={(v) => update("numeroSerie", v)}
          disabled={isFinalized}
        />

        <Field
          label="Horímetro"
          value={header.horimetro}
          onChange={(v) => update("horimetro", v)}
          disabled={isFinalized}
        />

        <Field
          label="Local da Inspeção"
          value={header.localInspecao}
          onChange={(v) => update("localInspecao", v)}
          disabled={isFinalized}
        />

        <Field
          label="Aplicação"
          value={header.aplicacao}
          onChange={(v) => update("aplicacao", v)}
          disabled={isFinalized}
        />

        <Field
          label="Técnico Responsável"
          required
          value={header.tecnicoResponsavel}
          onChange={(v) => update("tecnicoResponsavel", v)}
          disabled={isFinalized}
        />

        <Field
          label="Data"
          required
          value={header.data}
          onChange={(v) => update("data", v)}
          type="date"
          disabled={isFinalized}
        />

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Orçamento
          </label>
          <div className="flex gap-3">
            {(["sim", "nao"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => update("orcamento", opt)}
                disabled={isFinalized}
                className={`flex-1 p-3 rounded-lg border-2 font-medium touch-target transition-colors disabled:opacity-50 ${header.orcamento === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                  }`}
              >
                {opt === "sim" ? "Sim" : "Não"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-3 rounded-lg border border-border bg-card text-foreground touch-target focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}