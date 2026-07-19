import { KanbanItem, SystemEvaluation } from "@/types/inspection";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  items: KanbanItem[];
  onChange: (items: KanbanItem[]) => void;
}

const EVALUATIONS: { value: SystemEvaluation; label: string; icon: React.ReactNode; className: string }[] = [
  {
    value: "aprovado",
    label: "Aprovado",
    icon: <CheckCircle className="h-5 w-5" />,
    className: "border-green-400 bg-status-ok-bg text-green-800",
  },
  {
    value: "ressalvas",
    label: "Aprovado c/ ressalvas",
    icon: <AlertTriangle className="h-5 w-5" />,
    className: "border-amber-400 bg-status-warning-bg text-amber-800",
  },
  {
    value: "reprovado",
    label: "Reprovado",
    icon: <XCircle className="h-5 w-5" />,
    className: "border-red-400 bg-status-fail-bg text-red-800",
  },
];

export const KanbanSection = ({ items, onChange }: Props) => {
  const setEval = (idx: number, avaliacao: SystemEvaluation) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], avaliacao };
    onChange(updated);
  };

  const approved = items.filter((i) => i.avaliacao === "aprovado").length;
  const withIssues = items.filter((i) => i.avaliacao === "ressalvas").length;
  const failed = items.filter((i) => i.avaliacao === "reprovado").length;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Kanban da Inspeção</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-status-ok-bg text-center">
          <p className="text-2xl font-bold text-green-800">{approved}</p>
          <p className="text-xs text-green-700">Aprovados</p>
        </div>
        <div className="p-3 rounded-lg bg-status-warning-bg text-center">
          <p className="text-2xl font-bold text-amber-800">{withIssues}</p>
          <p className="text-xs text-amber-700">Ressalvas</p>
        </div>
        <div className="p-3 rounded-lg bg-status-fail-bg text-center">
          <p className="text-2xl font-bold text-red-800">{failed}</p>
          <p className="text-xs text-red-700">Reprovados</p>
        </div>
      </div>

      {/* Per system */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.sistemaId} className="bg-card rounded-lg border border-border p-4">
            <p className="font-medium text-foreground mb-3">{item.sistemaNome}</p>
            <div className="grid grid-cols-3 gap-2">
              {EVALUATIONS.map((ev) => (
                <button
                  key={ev.value}
                  onClick={() => setEval(idx, ev.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all touch-target text-xs font-medium ${
                    item.avaliacao === ev.value
                      ? ev.className
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {ev.icon}
                  <span className="hidden sm:inline">{ev.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
