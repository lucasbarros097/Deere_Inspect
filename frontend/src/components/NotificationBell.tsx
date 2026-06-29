import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    related_inspection_id?: string;
    related_user?: string;
    read: boolean;
    created_at: number;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Erro ao buscar notificações:", err);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem("access_token");
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchNotifications();
        } catch (err) {
            toast.error("Erro ao marcar como lida");
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-all active:scale-[0.95]"
                title="Notificações"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-destructive/30">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-hidden animate-in fade-in zoom-in-95 origin-top-right duration-200">
                        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                            <h3 className="font-bold text-foreground">Notificações</h3>
                            <button onClick={() => setShowDropdown(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="text-sm">Nenhuma notificação no momento</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${!notif.read ? "bg-primary/5" : ""}`}
                                            onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-foreground text-sm">{notif.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                                                    {notif.related_user && (
                                                        <p className="text-xs text-primary mt-1">Usuário: {notif.related_user}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {new Date(notif.created_at * 1000).toLocaleDateString("pt-BR")}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}