import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllInspections } from "@/store/inspectionStore";
import { Inspection, EQUIPMENT_LABELS } from "@/types/inspection";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft, UserPlus, Users, Power, PowerOff, FileText, Search, Download, HardHat, Link2, Copy, Smartphone } from "lucide-react";
import { generateInspectionPdf } from "@/lib/generatePdf";
import { QRCodeSVG } from "qrcode.react";

type Role = "admin" | "user";

interface UserData {
  uid: string;
  email: string;
  role: Role;
  ativo: boolean;
  criadoEm: number;
}

const PRODUCTIVE_SUFFIX = "@deere";
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"tecnicos" | "usuarios" | "inspecoes">("tecnicos");
  
  // States: Users
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("user");
  const [isCreating, setIsCreating] = useState(false);

  // States: Técnicos (email + produtivo)
  const [tecEmail, setTecEmail] = useState("");
  const [tecProdutivo, setTecProdutivo] = useState("");
  const [isCreatingTec, setIsCreatingTec] = useState(false);

  // States: Inspections
  const [inspectionsList, setInspectionsList] = useState<Inspection[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      const data = await apiFetch<{ uid: string; email: string; role: string; ativo: boolean; criado_em: number; }[]>("/api/users");
      const users = data
        .map((item) => ({
          uid: item.uid,
          email: item.email,
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

  const fetchInspections = async () => {
    setLoadingInspections(true);
    try {
      const localInspections = getAllInspections().sort((a, b) => {
        if (a.status === "finalizada" && b.status !== "finalizada") return -1;
        if (a.status !== "finalizada" && b.status === "finalizada") return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      setInspectionsList(localInspections);
    } catch (error) {
      toast.error("Erro ao buscar inspeções salvas.");
    } finally {
      setLoadingInspections(false);
    }
  };

  useEffect(() => {
    if (activeTab === "usuarios" || activeTab === "tecnicos") {
      fetchUsers();
    } else {
      fetchInspections();
    }
  }, [activeTab]);

  const handleCreateTecnico = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = tecEmail.trim().toLowerCase();
    const cleanProd = tecProdutivo.trim();
    if (!cleanEmail || !cleanProd) {
      toast.error("Informe email e produtivo do técnico.");
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
        email: cleanEmail,
        role: "user" as Role,
        ativo: true,
      };

      await apiFetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify({ uid: newUser.uid, email: newUser.email, role: newUser.role, ativo: newUser.ativo }),
      });

      toast.success(`Técnico ${cleanEmail} cadastrado!`);

      setTecEmail("");
      setTecProdutivo("");
      fetchUsers();
    } catch (error: any) {
      const message = error?.message || "Erro desconhecido";
      if (message.includes("Email already in use")) {
        toast.error("Este e-mail já está cadastrado.");
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
    if (!newEmail) {
      toast.error("Preencha o e-mail para criar usuário.");
      return;
    }
    
    setIsCreating(true);
    try {
      await apiFetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify({
          uid: crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
          email: newEmail.trim().toLowerCase(),
          role: newRole,
          ativo: true,
        }),
      });

      toast.success("Usuário criado com sucesso!");
      
      setNewEmail("");
      setNewRole("user");
      fetchUsers();
    } catch (error: any) {
      const message = error?.message || "Erro desconhecido";
      if (message.includes("Email already in use")) {
        toast.error("Este e-mail já está em uso.");
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

  const filteredInspections = inspectionsList.filter((insp) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const h = insp.header;
    const rastreabilidadeStr = h.rastreabilidade ? String(h.rastreabilidade) : "";
    const rastreabilidadePadded = h.rastreabilidade
      ? String(h.rastreabilidade).padStart(5, "0")
      : "";
    const osStr = h.numeroOs ? String(h.numeroOs).toLowerCase() : "";
    const osDigits = osStr.replace(/\D/g, "");
    const qDigits = q.replace(/\D/g, "");
    return (
      (osStr && osStr.includes(q)) ||
      (qDigits && osDigits && osDigits.includes(qDigits)) ||
      (h.cliente && h.cliente.toLowerCase().includes(q)) ||
      (rastreabilidadeStr && rastreabilidadeStr.includes(q)) ||
      (rastreabilidadePadded && rastreabilidadePadded.includes(q)) ||
      (h.numeroSerie && h.numeroSerie.toLowerCase().includes(q))
    );
  });

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
              Gerencie acessos e visualize os relatórios globais.
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
          <button 
            onClick={() => setActiveTab("inspecoes")}
            className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'inspecoes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Central de Inspeções
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
                O técnico fará login com o <strong>email</strong> + <strong>produtivo</strong> abaixo. Permissão padrão: somente inspeções.
              </p>
              <form onSubmit={handleCreateTecnico} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email do técnico</label>
                  <input
                    type="email"
                    required
                    value={tecEmail}
                    onChange={(e) => setTecEmail(e.target.value)}
                    placeholder="tecnico@deere.com"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Produtivo (login)</label>
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
                    <p>3. Faça login com email + produtivo</p>
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
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                  <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
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
                          {u.email}
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

        {activeTab === "inspecoes" && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
               <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                 <FileText className="h-5 w-5 text-primary" />
                 Inspeções Salvas
               </h2>
               
               <div className="relative w-full sm:w-auto">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input 
                   type="text" 
                   placeholder="Pesquisar OS, Tracker, Cliente..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-9 pr-4 py-2 w-full sm:w-[300px] border border-border bg-card rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                 />
               </div>
            </div>

            {loadingInspections ? (
               <p className="text-sm text-muted-foreground">Carregando inspeções salvas...</p>
            ) : filteredInspections.length === 0 ? (
              <div className="p-8 text-center bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground">Nenhuma inspeção finalizada ou em andamento foi encontrada.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredInspections.map((insp) => (
                  <div key={insp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card border-border hover:border-primary transition-colors">
                    <div className="mb-3 sm:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                           TRK: {insp.header.rastreabilidade ? String(insp.header.rastreabilidade).padStart(5, '0') : 'N/A'}
                        </span>
                        {insp.header.numeroOs && (
                          <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-bold">
                             OS: {insp.header.numeroOs}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${insp.status === "finalizada" ? "bg-status-ok-bg text-foreground" : "bg-status-warning-bg text-foreground"}`}>
                           {insp.status === "finalizada" ? "Finalizada" : "Em andamento"}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">
                        {insp.header.cliente || "Cliente não informado"} — {EQUIPMENT_LABELS[insp.header.tipoEquipamento]}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Téc: {insp.header.tecnicoResponsavel || "Não inf."} • Data: {insp.header.data}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => generateInspectionPdf(insp)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
