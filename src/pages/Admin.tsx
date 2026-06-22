import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft, UserPlus, Users, Power, PowerOff, Link2, Copy, Smartphone, HardHat } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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
  const [activeTab, setActiveTab] = useState<"tecnicos" | "usuarios">("tecnicos");

  // States: Users
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("user");
  const [isCreating, setIsCreating] = useState(false);

  // States: Técnicos (username + produtivo)
  const [tecUsername, setTecUsername] = useState("");
  const [tecProdutivo, setTecProdutivo] = useState("");
  const [isCreatingTec, setIsCreatingTec] = useState(false);

  const navigate = useNavigate();
  const installUrl = typeof window !== "undefined" ? window.location.origin : "";

  const apiFetch = async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE}${path}`;
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...init,
      headers,
    });

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
        .map((item) => ({
          uid: item.uid,
          username: item.username,
          role: item.role as Role,
          ativo: item.ativo,
          criadoEm: item.criado_em,
        }))
        .sort((a, b) => {
          if (a.role === "admin" && b.role !== "admin") return -1;
          if (a.role !== "admin" && b.role === "admin") return 1;
          return b.criadoEm - a.criadoEm;
        });
      setUsersList(users);
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error);
      setUsersError("Erro ao buscar usuários: " + (error?.message || "desconhecido"));
      toast.error("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const handleCreateTecnico = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = tecUsername.trim().toLowerCase();
    const cleanProd = tecProdutivo.trim();
    if (!cleanUsername || !cleanProd) {
      toast.error("Informe nome de usuário e produtivo do técnico.");
      return;
    }
    if (cleanProd.length < 2) {
      toast.error("Produtivo deve ter pelo menos 2 caracteres.");
      return;
    }

    setIsCreatingTec(true);
    try {
      const newUser = {
        uid: crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
        username: cleanUsername,
        role: "user" as Role,
        ativo: true,
      };

      await apiFetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify({ uid: newUser.uid, username: newUser.username, password: cleanProd, role: newUser.role, ativo: newUser.ativo }),
      });

      toast.success(`Técnico ${cleanUsername} cadastrado!`);

      setTecUsername("");
      setTecProdutivo("");
      fetchUsers();
    } catch (error: any) {
      const message = error?.message || "Erro desconhecido";
      if (message.includes("Nome de usuário já está em uso")) {
        toast.error("Este nome de usuário já está cadastrado.");
      } else {
        toast.error("Erro ao cadastrar: " + message);
      }
    } finally {
      setIsCreatingTec(false);
    }
  };

  const copyInstallLink = async () => {
    try {
      await navigator.clipboard.writeText(installUrl);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast.error("Preencha usuário e senha para criar usuário.");
      return;
    }

    setIsCreating(true);
    try {
      await apiFetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify({
          uid: crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
          username: newUsername.trim().toLowerCase(),
          password: newPassword.trim(),
          role: newRole,
          ativo: true,
        }),
      });

      toast.success("Usuário criado com sucesso!");

      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      fetchUsers();
    } catch (error: any) {
      const message = error?.message || "Erro desconhecido";
      if (message.includes("Nome de usuário já está em uso")) {
        toast.error("Este nome de usuário já está em uso.");
      } else {
        toast.error("Erro ao criar usuário: " + message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleAtivo = async (userToUpdate: UserData) => {
    if (userToUpdate.role === 'admin' && userToUpdate.ativo) {
      const activeAdmins = usersList.filter(u => u.role === 'admin' && u.ativo);
      if (activeAdmins.length <= 1) {
        toast.error("Deve existir pelo menos um administrador ativo.");
        return;
      }
    }
    try {
      await apiFetch(`/api/users/${userToUpdate.uid}`, {
        method: "PUT",
        body: JSON.stringify({ ativo: !userToUpdate.ativo }),
      });
      toast.success(userToUpdate.ativo ? "Acesso desativado." : "Acesso ativado.");
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao alterar acesso.");
    }
  };

  const handleToggleRole = async (userToUpdate: UserData) => {
    const newRoleObj = userToUpdate.role === 'admin' ? 'user' : 'admin';
    try {
      await apiFetch(`/api/users/${userToUpdate.uid}`, {
        method: "PUT",
        body: JSON.stringify({ role: newRoleObj }),
      });
      toast.success("Permissões atualizadas com sucesso.");
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao alterar permissões.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-5 border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/")} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="text-primary h-6 w-6" />
              Painel de Administração
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie acessos e usuários do sistema.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("tecnicos")}
            className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'tecnicos' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Cadastrar Técnico
          </button>
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'usuarios' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Controle de Usuários
          </button>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">

        {activeTab === "tecnicos" && (
          <>
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-1">
                <HardHat className="h-5 w-5 text-primary" />
                Cadastrar Técnico
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                O técnico fará login com o <strong>nome de usuário</strong> + <strong>produtivo</strong> abaixo. Permissão padrão: somente inspeções.
              </p>
              <form onSubmit={handleCreateTecnico} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nome de usuário</label>
                  <input
                    type="text"
                    required
                    value={tecUsername}
                    onChange={(e) => setTecUsername(e.target.value)}
                    placeholder="usuario_tecnico"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Produtivo (senha)</label>
                  <input
                    type="text"
                    required
                    value={tecProdutivo}
                    onChange={(e) => setTecProdutivo(e.target.value)}
                    placeholder="Ex.: 12345"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingTec}
                  className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  {isCreatingTec ? "Cadastrando..." : "Cadastrar"}
                </button>
              </form>
            </section>

            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-1">
                <Smartphone className="h-5 w-5 text-primary" />
                Link de instalação do app
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Compartilhe com o técnico. Ele abre no celular e instala como aplicativo (PWA).
              </p>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      readOnly
                      value={installUrl}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <button
                    onClick={copyInstallLink}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar link
                  </button>
                  <div className="text-xs text-muted-foreground space-y-1 pt-2">
                    <p><strong>Como instalar:</strong></p>
                    <p>1. Abra o link no celular (Chrome/Safari)</p>
                    <p>2. Toque em "Adicionar à tela inicial"</p>
                    <p>3. Faça login com nome de usuário + produtivo</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg flex-shrink-0 mx-auto md:mx-0">
                  <QRCodeSVG value={installUrl} size={140} level="M" />
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "usuarios" && (
          <>
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
                <UserPlus className="h-5 w-5 text-primary" />
                Adicionar Novo Usuário
              </h2>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-muted-foreground">Nome de usuário</label>
                  <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="usuario123" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-muted-foreground">Senha</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Produtivo ou senha" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-muted-foreground">Permissão</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="user">Usuário Padrão</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button type="submit" disabled={isCreating} className="md:col-span-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  {isCreating ? "Criando..." : "Criar Usuário"}
                </button>
              </form>
            </section>

            <section>
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
                <Users className="h-5 w-5 text-primary" />
                Usuários Registrados
              </h2>

              {loadingUsers ? (
                <p className="text-sm text-muted-foreground">Carregando usuários...</p>
              ) : usersError ? (
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
                  <p className="font-semibold mb-1">Não foi possível listar os usuários.</p>
                  <p className="text-destructive/90 whitespace-pre-wrap">{usersError}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {usersList.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
                  )}
                  {usersList.map((u) => (
                    <div key={u.uid} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border ${u.ativo ? 'bg-card border-border' : 'bg-destructive/5 border-destructive/20'} transition-all`}>
                      <div className="mb-3 sm:mb-0">
                        <p className={`font-medium flex items-center gap-2 ${u.ativo ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                          {u.username}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Role: <span className="font-semibold text-primary">{u.role.toUpperCase()}</span> • Status: <span className={u.ativo ? "text-green-500" : "text-destructive"}>{u.ativo ? "ATIVO" : "INATIVO"}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleRole(u)} className="px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition-colors">
                          Tornar {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>

                        <button onClick={() => handleToggleAtivo(u)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${u.ativo ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                          {u.ativo ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                          {u.ativo ? "Bloquear" : "Ativar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}