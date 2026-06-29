import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft, UserPlus, Users, Power, PowerOff } from "lucide-react";

type Role = "admin" | "user";

interface UserData {
  uid: string;
  username: string;
  role: Role;
  ativo: boolean;
  criadoEm: number;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export default function Admin() {
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("user");
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  const apiFetch = async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE}${path}`;
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, { ...init, headers });
    if (!response.ok) {
      const text = await response.text();
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
      throw new Error(text || `API request failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const data = await apiFetch<{ uid: string; username: string; role: string; ativo: boolean; criado_em: number; }[]>("/api/users");
      const users = data
        .map((item) => ({ uid: item.uid, username: item.username, role: item.role as Role, ativo: item.ativo, criadoEm: item.criado_em }))
        .sort((a, b) => {
          if (a.role === "admin" && b.role !== "admin") return -1;
          if (a.role !== "admin" && b.role === "admin") return 1;
          return b.criadoEm - a.criadoEm;
        });
      setUsersList(users);
    } catch (error: any) {
      setUsersError("Erro ao buscar usuários: " + (error?.message || "desconhecido"));
      toast.error("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) { toast.error("Preencha usuário e senha para criar usuário."); return; }
    setIsCreating(true);
    try {
      await apiFetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify({
          uid: crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
          username: newUsername.trim().toLowerCase(), password: newPassword.trim(), role: newRole, ativo: true,
        }),
      });
      toast.success("Usuário criado com sucesso!");
      setNewUsername(""); setNewPassword(""); setNewRole("user");
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message?.includes("Nome de usuário já está em uso") ? "Este nome de usuário já está em uso." : "Erro ao criar usuário: " + (error?.message || "Erro"));
    } finally { setIsCreating(false); }
  };

  const handleToggleAtivo = async (userToUpdate: UserData) => {
    if (userToUpdate.role === 'admin' && userToUpdate.ativo) {
      const activeAdmins = usersList.filter(u => u.role === 'admin' && u.ativo);
      if (activeAdmins.length <= 1) { toast.error("Deve existir pelo menos um administrador ativo."); return; }
    }
    try {
      await apiFetch(`/api/users/${userToUpdate.uid}`, { method: "PUT", body: JSON.stringify({ ativo: !userToUpdate.ativo }) });
      toast.success(userToUpdate.ativo ? "Acesso desativado." : "Acesso ativado.");
      fetchUsers();
    } catch { toast.error("Erro ao alterar acesso."); }
  };

  const handleToggleRole = async (userToUpdate: UserData) => {
    const newRoleObj = userToUpdate.role === 'admin' ? 'user' : 'admin';
    try {
      await apiFetch(`/api/users/${userToUpdate.uid}`, { method: "PUT", body: JSON.stringify({ role: newRoleObj }) });
      toast.success("Permissões atualizadas com sucesso.");
      fetchUsers();
    } catch { toast.error("Erro ao alterar permissões."); }
  };

  const roleLabel = (role: Role) => role === "admin" ? "Administrador" : "Técnico";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-2">
              <ShieldCheck className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">Administração</h1>
            <p className="text-muted-foreground">Gerencie acessos e usuários do sistema.</p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
        <section className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
            <UserPlus className="h-5 w-5 text-primary" /> Adicionar Novo Usuário
          </h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nome de usuário</label>
              <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="usuario123"
                className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Senha</label>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Senha do usuário"
                className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Permissão</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}
                className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                <option value="user">Técnico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit" disabled={isCreating}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary h-11 px-4 disabled:opacity-60 active:scale-[0.98] shadow-lg shadow-primary/20">
              {isCreating ? "Criando..." : "Criar Usuário"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
            <Users className="h-5 w-5 text-primary" /> Usuários Registrados
          </h2>

          {loadingUsers ? (
            <p className="text-sm text-muted-foreground">Carregando usuários...</p>
          ) : usersError ? (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
              <p className="font-semibold mb-1">Não foi possível listar os usuários.</p>
              <p className="text-destructive/90 whitespace-pre-wrap">{usersError}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {usersList.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
              )}
              {usersList.map((u) => (
                <div key={u.uid} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${
                  u.ativo ? 'glass-card' : 'bg-destructive/5 border-destructive/20'
                } transition-all`}>
                  <div className="mb-3 sm:mb-0">
                    <p className={`font-medium flex items-center gap-2 ${u.ativo ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                      {u.username}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Perfil: <span className="font-semibold text-primary">{roleLabel(u.role)}</span> • Status: <span className={u.ativo ? "text-green-500" : "text-destructive"}>{u.ativo ? "ATIVO" : "INATIVO"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleRole(u)}
                      className="px-3 py-1.5 text-xs font-semibold bg-card border border-border hover:bg-muted text-foreground rounded-lg transition-all active:scale-[0.95]">
                      Tornar {u.role === 'admin' ? 'Técnico' : 'Admin'}
                    </button>
                    <button onClick={() => handleToggleAtivo(u)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-[0.95] ${
                        u.ativo ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                      }`}>
                      {u.ativo ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                      {u.ativo ? "Bloquear" : "Ativar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}