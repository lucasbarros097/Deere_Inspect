import { useState } from "react";
import { AlertCircle, X } from "lucide-react";

interface EditReasonDialogProps {
    isOpen: boolean;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

export default function EditReasonDialog({ isOpen, onConfirm, onCancel }: EditReasonDialogProps) {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert("Por favor, informe o motivo da edição");
            return;
        }
        onConfirm(reason);
        setReason("");
    };

    const handleCancel = () => {
        setReason("");
        onCancel();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-lg max-w-md w-full">
                {/* Header */}
                <div className="bg-card border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-warning" />
                        <h2 className="text-lg font-bold text-foreground">Motivo da Edição</h2>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Esta inspeção foi finalizada. Para fazer edições, é necessário informar o motivo da alteração.
                        Isso será registrado no histórico de auditoria.
                    </p>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground">
                            Motivo da edição *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Correção de dados incorretos, revisão solicitada, etc..."
                            className="w-full p-3 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            Mínimo 10 caracteres
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-card border-t border-border p-4 flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={reason.length < 10}
                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}