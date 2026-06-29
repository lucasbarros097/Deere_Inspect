import { useState, useEffect } from "react";

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    related_inspection_id?: string;
    related_user?: string;
    read: boolean;
    created_at: number;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (err) {
            console.error("Erro ao buscar notificações:", err);
        }
    };

    useEffect(() => {
        fetch();
        const interval = setInterval(fetch, 30000);
        return () => clearInterval(interval);
    }, []);

    return { notifications, refetch: fetch, loading };
}