import { useState, useEffect } from "react";
import { History, X, Loader } from "lucide-react";
import { toast } from "sonner";

interface EditLog {
    id: string;
    edited_by: string;
    edited_at: number;
    field_changed: string;
    old_value?: string;
    new_value?: string;
    edit_reason?: string;
}

interface EditHistoryProps {
    isOpen: boolean;
    inspectionId: string;
    onClose: () => void;
}

export default function EditHistory({ isOpen, inspectionId, onClose }: EditHistoryProps) {
    const [edits, setEdits] = useState<EditLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchEdits();
        }
    }, [isOpen, inspectionId]);

    const fetchEdits = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`/api/inspections/${inspectionId}/edits`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Erro ao buscar histórico");

            const data = await res.json();
            setEdits(data);
        } catch (err) {
            toast.error("Erro ao carregar histórico de edições");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getFieldLabel = (field: string) => {
        const labels: Record<string, string> = {
            header: "Dados Iniciais",
            analysis_request: "Solicitação de Análise",
            operating_conditions: "Condições Operacionais",
            diagnostico: "Diagnóstico",
            checklist_data: "Checklist",
            kanban: "Kanban",
            fotos: "Fotos",
            status: "Status",
            assinatura_tecnico: "Assinatura",
        };
        return labels[field] || field;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Histórico de Edições</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : edits.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhuma edição registrada
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {edits.map((edit, idx) => (
                                <div
                                    key={edit.id}
                                    className="border border-border rounded-lg p-4 space-y-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {getFieldLabel(edit.field_changed)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Editado por <span className="font-medium">{edit.edited_by}</span> em{" "}
                                                <span className="font-medium">{formatDate(edit.edited_at)}</span>
                                            </p>
                                        </div>
                                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                            {idx === 0 ? "Mais recente" : ""}
                                        </div>
                                    </div>

                                    {edit.edit_reason && (
                                        <div className="bg-muted/40 rounded p-2 border-l-2 border-primary">
                                            <p className="text-sm font-medium text-foreground">Motivo:</p>
                                            <p className="text-sm text-muted-foreground">{edit.edit_reason}</p>
                                        </div>
                                    )}

                                    {(edit.old_value || edit.new_value) && (
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {edit.old_value && (
                                                <div className="bg-destructive/5 border border-destructive/20 rounded p-2">
                                                    <p className="font-medium text-destructive mb-1">Anterior:</p>
                                                    <p className="text-foreground break-words">
                                                        {edit.old_value.substring(0, 100)}
                                                        {edit.old_value.length > 100 ? "..." : ""}
                                                    </p>
                                                </div>
                                            )}
                                            {edit.new_value && (
                                                <div className="bg-status-ok-bg/20 border border-status-ok-bg rounded p-2">
                                                    <p className="font-medium text-foreground mb-1">Novo:</p>
                                                    <p className="text-foreground break-words">
                                                        {edit.new_value.substring(0, 100)}
                                                        {edit.new_value.length > 100 ? "..." : ""}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}