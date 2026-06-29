import { useState, useEffect } from "react";
import { Share2, X, Loader } from "lucide-react";
import { toast } from "sonner";

interface User {
    uid: string;
    username: string;
    role: string;
}

interface ShareModalProps {
    isOpen: boolean;
    inspectionId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ShareModal({ isOpen, inspectionId, onClose, onSuccess }: ShareModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setFetching(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch("/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Erro ao buscar usuários");

            const data = await res.json();
            setUsers(data);
        } catch (err) {
            toast.error("Erro ao carregar lista de técnicos");
        } finally {
            setFetching(false);
        }
    };

    const handleToggle = (uid: string) => {
        const newSelected = new Set(selectedUids);
        if (newSelected.has(uid)) {
            newSelected.delete(uid);
        } else {
            newSelected.add(uid);
        }
        setSelectedUids(newSelected);
    };

    const handleShare = async () => {
        if (selectedUids.size === 0) {
            toast.error("Selecione pelo menos um técnico");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`/api/inspections/${inspectionId}/share`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    shared_with_uids: Array.from(selectedUids),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Erro ao compartilhar");
            }

            toast.success("Inspeção compartilhada com sucesso!");
            setSelectedUids(new Set());
            onSuccess?.();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erro ao compartilhar inspeção");
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
                        <Share2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Compartilhar Inspeção</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {fetching ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Nenhum técnico disponível
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {users.map((user) => (
                                <label
                                    key={user.uid}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUids.has(user.uid)}
                                        onChange={() => handleToggle(user.uid)}
                                        className="w-4 h-4 rounded border-border cursor-pointer"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">{user.username}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {user.role === "admin" ? "👑 Admin" : "👤 Técnico"}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
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
                        onClick={handleShare}
                        disabled={loading || selectedUids.size === 0}
                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? "Compartilhando..." : "Compartilhar"}
                    </button>
                </div>
            </div>
        </div>
    );
}