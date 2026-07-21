const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const chatApi = {
  ask: async (messages: ChatMessage[]) => {
    const response = await fetch(`${API_BASE}/api/chat/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    if (!response.ok) throw new Error("Failed to fetch chat");
    return response.json();
  }
};
