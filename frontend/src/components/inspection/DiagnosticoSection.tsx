import { DiagnosticoEletronico } from "@/types/inspection";

interface Props {
  data: DiagnosticoEletronico;
  onChange: (data: DiagnosticoEletronico) => void;
}

export const DiagnosticoSection = ({ data, onChange }: Props) => {
  const update = (field: keyof DiagnosticoEletronico, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="font-bold text-foreground mb-4">PROCEDIMENTOS DE DIAGNÓSTICOS EXECUTADOS</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Os procedimentos abaixo foram realizados conforme Manual Técnico John Deere (TM) aplicável ao modelo.
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-2">Diagnóstico Eletrônico</h4>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Ferramentas utilizadas</label>
            <input
              value={data.ferramentasUtilizadas}
              onChange={(e) => update("ferramentasUtilizadas", e.target.value)}
              className="w-full p-3 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="SERVICE ADVISOR"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Manual de Performance</label>
            <input
              value={data.manualPerformance}
              onChange={(e) => update("manualPerformance", e.target.value)}
              className="w-full p-3 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Manual de Performance"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Leitura de códigos de falha (DTC'S)</label>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">Códigos ativos</label>
            <div className="flex gap-4">
              {(["sim", "nao"] as const).map((v) => (
                <label key={v} className="flex items-center gap-2 touch-target cursor-pointer">
                  <input
                    type="radio"
                    name="codigosAtivos"
                    checked={data.codigosAtivos === v}
                    onChange={() => update("codigosAtivos", v)}
                    className="h-5 w-5"
                  />
                  <span className="text-sm text-foreground">{v === "sim" ? "Sim" : "Não"}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Códigos presentes (listar)</label>
            <textarea
              value={data.codigosPresentes}
              onChange={(e) => update("codigosPresentes", e.target.value)}
              rows={4}
              className="w-full p-3 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Listar todos os códigos presentes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
