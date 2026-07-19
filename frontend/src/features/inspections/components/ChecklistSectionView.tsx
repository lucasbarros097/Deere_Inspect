import { useState } from "react";
import { ChecklistSection, ChecklistItem } from "@/types/inspection";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface Props {
  section: ChecklistSection;
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const parseOptions = (ref: string): string[] => {
  if (!ref) return [];
  const matches = [...ref.matchAll(/\(\s*\)\s*([^()]+?)(?=\(\s*\)|$)/g)];
  if (matches.length > 0) {
    return matches.map((m) => m[1].trim());
  }
  return [];
};

const ChecklistItemRow = ({
  item,
  idx,
  updateItem,
}: {
  item: ChecklistItem;
  idx: number;
  updateItem: (idx: number, field: keyof ChecklistItem, value: string) => void;
}) => {
  const options = parseOptions(item.medidaReferencia);
  const hasOptions = options.length > 0;

  const isCustomTempoValue = (item.tempo || "").trim() !== "" && !["5", "10", "15", "30"].includes(item.tempo || "");
  const hasObs = (item.observacao || "").trim() !== "";
  const [showDetails, setShowDetails] = useState(isCustomTempoValue || hasObs);

  return (
    <div className="p-4 border-b border-border/30">
      <div className="mb-3">
        <p className="font-medium text-foreground text-sm leading-tight">{item.descricao}</p>
        {item.medidaReferencia && (
          <p className="text-xs text-muted-foreground mt-1">Ref: {item.medidaReferencia}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-xs text-muted-foreground block mb-2">Medida</label>
        {hasOptions ? (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => updateItem(idx, "medida", item.medida === opt ? "" : opt)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border touch-target ${
                  item.medida === opt
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            value={item.medida}
            onChange={(e) => updateItem(idx, "medida", e.target.value)}
            className="w-full p-2 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Digite o valor medido..."
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-2">Tempo (min)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {["5", "10", "15", "30"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  updateItem(idx, "tempo", item.tempo === t ? "" : t);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border touch-target flex-1 min-w-[3.5rem] ${
                  item.tempo === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {t}m
              </button>
            ))}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`w-9 h-9 flex-shrink-0 rounded-md text-sm font-medium transition-colors border touch-target flex items-center justify-center ${
                showDetails || isCustomTempoValue || hasObs
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
            >
              ✏️
            </button>
          </div>
          {showDetails && (
            <input
              value={item.tempo}
              onChange={(e) => updateItem(idx, "tempo", e.target.value)}
              className="w-full p-2 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tempo (personalizado)"
              inputMode="decimal"
            />
          )}
        </div>
        
        {showDetails && (
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Observação</label>
            <input
              value={item.observacao}
              onChange={(e) => updateItem(idx, "observacao", e.target.value)}
              className="w-full p-2 rounded border border-border bg-background text-foreground text-sm touch-target focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Alguma observação?"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const ChecklistSectionView = ({ section, items, onChange }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const filledCount = items.filter((i) => (i.medida || "").trim() !== "").length;
  const hasWarnings = items.some((i) => {
    if (!(i.medida || "").trim() || !(i.medidaReferencia || "").trim()) return false;
    const lower = (i.medida || "").toLowerCase();
    const ref = (i.medidaReferencia || "").toLowerCase();
    if (ref.includes("nenhum vazamento") && lower !== "nenhum") return true;
    if (ref.includes("ausente") && !lower.includes("ausente")) return true;
    if (lower === "não conforme" || lower === "falha" || lower === "ruim") return true;
    return false;
  });

  const updateItem = (idx: number, field: keyof ChecklistItem, value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

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
              style={{ width: `${items.length > 0 ? (filledCount / items.length) * 100 : 0}%` }}
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
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  idx={idx}
                  updateItem={updateItem}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
