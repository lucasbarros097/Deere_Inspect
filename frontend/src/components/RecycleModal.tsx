import { useState } from "react";
import { RotateCcw, X, Loader } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface RecycleModalProps {
    isOpen: boolean;
    inspectionId: string;
    onClose: () => void;
}

const FIELDS = [
    { key: "header", label: "Dados Iniciais (Cliente, Equipamento, etc)" },
    { key: "analysis_request", label: "Solicitação de Análise" },
    { key: "operating_conditions", label: "Condições Operacionais" },
    { key: "diagnostico", label: "Diagnóstico" },
    { key: "checklist_data", label: "Checklist" },
    { key: "kanban", label: "Kanban" },
    { key: "fotos", label: "Fotos" },
];

export default function RecycleModal({ isOpen, inspectionId, onClose }: RecycleModalProps) {
    const navigate = useNavigate();
    const [selectedFields, setSelectedFields] = useState<Set<string>>(
        new Set(["header"])
    );
    const [loading, setLoading] = useState(false);

    const handleToggle = (field: string) => {
        const newSelected = new Set(selectedFields);
        if (newSelected.has(field)) {
            newSelected.delete(field);
        } else {
            newSelected.add(field);
        }
        setSelectedFields(newSelected);
    };

    const handleSelectAll = () => {
        setSelectedFields(new Set(FIELDS.map((f) => f.key)));
    };

    const handleDeselectAll = () => {
        setSelectedFields(new Set());
    };

    const handleRecycle = async () => {
        if (selectedFields.size === 0) {
            toast.error("Selecione pelo menos um campo");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`/api/inspections/${inspectionId}/recycle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fields_to_keep: Array.from(selectedFields),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Erro ao reciclar");
            }

            const data = await res.json();
            toast.success("Inspeção reciclada com sucesso!");
            onClose();
            navigate(`/ferramentas/analise-tecnica/${data.id}`);
        } catch (err: any) {
            toast.error(err.message || "Erro ao reciclar inspeção");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Reciclar Inspeção</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Info */}
                <div className="p-4 bg-primary/10 border-b border-primary/20">
                    <p className="text-sm text-foreground">
                        Selecione quais campos deseja copiar para a nova inspeção. Os demais serão resetados.
                    </p>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {FIELDS.map((field) => (
                        <label
                            key={field.key}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedFields.has(field.key)}
                                onChange={() => handleToggle(field.key)}
                                className="w-4 h-4 rounded border-border cursor-pointer"
                            />
                            <span className="font-medium text-foreground">{field.label}</span>
                        </label>
                    ))}
                </div>

                {/* Actions */}
                <div className="p-4 bg-muted/30 border-t border-border flex gap-2 text-xs">
                    <button
                        onClick={handleSelectAll}
                        className="px-3 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                        Selecionar Tudo
                    </button>
                    <button
                        onClick={handleDeselectAll}
                        className="px-3 py-1 rounded border border-border hover:bg-muted transition-colors"
                    >
                        Desselecionar Tudo
                    </button>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleRecycle}
                        disabled={loading || selectedFields.size === 0}
                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {loading && <Loader className="h-4 w-4 animate-spin" />}
                        {loading ? "Reciclando..." : "Reciclar"}
                    </button>
                </div>
            </div>
        </div>
    );
}