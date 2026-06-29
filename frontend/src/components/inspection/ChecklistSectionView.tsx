import { useState } from "react";
import { ChecklistSection, ChecklistItem } from "@/types/inspection";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface Props {
  section: ChecklistSection;
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export const ChecklistSectionView = ({ section, items, onChange }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const filledCount = items.filter((i) => i.medida.trim() !== "").length;
  const hasWarnings = items.some((i) => {
    if (!i.medida.trim() || !i.medidaReferencia.trim()) return false;
    const lower = i.medida.toLowerCase();
    const ref = i.medidaReferencia.toLowerCase();
    if (ref.includes("nenhum vazamento") && lower !== "nenhum") return true;
    if (ref.includes("ausente") && !lower.includes("ausente")) return true;
    return false;
  });

  const updateItem = (idx: number, field: keyof ChecklistItem, value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  // Group items by their grupo field
  const groups: { grupo: string; items: { item: ChecklistItem; idx: number }[] }[] = [];
  let currentGroup = "";
  items.forEach((item, idx) => {
    const g = item.grupo || "";
    if (g !== currentGroup) {
      currentGroup = g;
      groups.push({ grupo: g, items: [] });
    }
    groups[groups.length - 1].items.push({ item, idx });
  });

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 touch-target"
      >
        <div className="flex items-center gap-3">
          {hasWarnings && <AlertTriangle className="h-5 w-5 text-warning animate-pulse-warning" />}
          <div className="text-left">
            <h3 className="font-bold text-foreground">{section.nome}</h3>
            <p className="text-xs text-muted-foreground">
              {filledCount}/{items.length} preenchidos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(filledCount / items.length) * 100}%` }}
            />
          </div>
          {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.grupo && (
                <div className="px-4 py-2 bg-muted/50 border-b border-border/50">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide">{group.grupo}</p>
                </div>
              )}
              {group.items.map(({ item, idx }) => (
                <div
                  key={item.id}
                  className="p-4 border-b border-border/30"
                >
                  <p className="font-medium text-foreground text-sm mb-2">{item.descricao}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Medida</label>
                      <input
                        value={item.medida}
                        onChange={(e) => updateItem(idx, "medida", e.target.value)}
                        className="w-full p-2 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Valor medido"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Referência</label>
                      <div className="w-full p-2 rounded border border-border bg-muted text-muted-foreground text-xs touch-target leading-tight min-h-[40px]">
                        {item.medidaReferencia || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Tempo</label>
                      <input
                        value={item.tempo}
                        onChange={(e) => updateItem(idx, "tempo", e.target.value)}
                        className="w-full p-2 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Tempo"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Observação</label>
                      <input
                        value={item.observacao}
                        onChange={(e) => updateItem(idx, "observacao", e.target.value)}
                        className="w-full p-2 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Obs."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
