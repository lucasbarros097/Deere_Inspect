import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EquipmentType, EQUIPMENT_LABELS } from "@/types/inspection";
import { createNewInspection, saveInspection, getAllInspections, deleteInspection } from "@/store/inspectionStore";
import { BookOpenCheck, ClipboardList, CheckCircle, Plus, Download, Trash2, LogOut, Key } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { toast } from "sonner";

const SwipeableInspectionItem = ({
  insp,
  onNavigate,
  onDelete
}: {
  insp: any;
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [offset, setOffset] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const threshold = -80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    currentX.current = e.touches[0].clientX;
    const diff = Math.min(0, currentX.current - startX.current);
    setOffset(Math.max(diff, -100));
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (offset < threshold) {
      setOffset(-100);
      setShowDelete(true);
    } else {
      setOffset(0);
      setShowDelete(false);
    }
  }, [offset, threshold]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    currentX.current = e.clientX;
    const diff = Math.min(0, currentX.current - startX.current);
    setOffset(Math.max(diff, -100));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (offset < threshold) {
      setOffset(-100);
      setShowDelete(true);
    } else {
      setOffset(0);
      setShowDelete(false);
    }
  }, [offset, threshold]);

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-lg">
      {/* Delete button behind */}
      <div className="absolute inset-y-0 right-0 w-[100px] flex items-center justify-center bg-destructive rounded-r-lg">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(insp.id);
          }}
          className="flex flex-col items-center gap-1 text-destructive-foreground"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-xs font-medium">Excluir</span>
        </button>
      </div>
      {/* Swipeable card */}
      <div
        style={{ transform: `translateX(${offset}px)`, transition: isDragging.current ? 'none' : 'transform 0.3s ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { if (isDragging.current) handleMouseUp(); }}
        onClick={() => { if (Math.abs(offset) < 5) onNavigate(insp.id); }}
        className="relative w-full flex items-center justify-between p-4 bg-card border border-border hover:border-primary transition-colors touch-target text-left cursor-grab active:cursor-grabbing select-none rounded-lg"
      >
        <div className="min-w-0 flex-1 pr-3">
          <p className="font-medium text-card-foreground truncate">
            {insp.header.cliente || "Sem cliente"} — {EQUIPMENT_LABELS[insp.header.tipoEquipamento as EquipmentType]}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {insp.header.marcaModelo || "Modelo não informado"} • Série: {insp.header.numeroSerie || "—"}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded font-medium flex-shrink-0 ${insp.status === "finalizada"
            ? "bg-status-ok-bg text-foreground"
            : "bg-status-warning-bg text-foreground"
            }`}
        >
          {insp.status === "finalizada" ? "Finalizada" : "Em andamento"}
        </span>
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { role, username, logout } = useAuth();
  const [inspections, setInspections] = useState(getAllInspections());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewInspection, setShowNewInspection] = useState(false);

  // Filtrando inspeções pelo usuário logado
  const userInspections = inspections.filter(insp => insp.createdBy === username || insp.header.tecnicoResponsavel === username);
  const inProgressInspections = userInspections.filter(i => i.status !== "finalizada").reverse();
  const finalizedInspections = userInspections.filter(i => i.status === "finalizada").reverse();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const handleNewInspection = (type: EquipmentType) => {
    const inspection = createNewInspection(type, username || "");
    saveInspection(inspection);
    setShowNewInspection(false);
    navigate(`/ferramentas/analise-tecnica/${inspection.id}`);
  };

  const handleDelete = (id: string) => {
    deleteInspection(id);
    setInspections(getAllInspections());
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    toast.success("Você foi desconectado");
  };

  const roleLabel = role === "admin" ? "Administrador" : "Técnico";

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-jd-yellow p-2 rounded-lg">
                <BookOpenCheck className="h-7 w-7 text-industrial-dark" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-jd-yellow">Análise Técnica</h1>
                <p className="text-sm text-industrial-dark-foreground/70">
                  Equipamentos Linha Amarela
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notificações */}
              <NotificationBell />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-xs font-medium"
                  title={`Usuário: ${username}`}
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {username ? username[0].toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline truncate max-w-[100px]">{username}</span>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 origin-top-right duration-200">
                    <div className="px-4 py-3 border-b border-border/50">
                      <p className="text-xs text-muted-foreground">Conectado como</p>
                      <p className="font-semibold text-foreground">{username}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {role === "admin" ? "👑 Administrador" : "🔧 Técnico"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/sobre-nos");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground"
                    >
                      <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                      Sobre o App
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/trocar-senha");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground"
                    >
                      <Key className="h-4 w-4 text-muted-foreground" />
                      Trocar Senha
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-destructive/10 transition-colors text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Install Banner */}
      {deferredPrompt && !isInstalled && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
          <div className="container max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Download className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm text-foreground truncate">Instale o app para usar offline</p>
            </div>
            <button
              onClick={handleInstall}
              className="flex-shrink-0 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium touch-target"
            >
              Instalar
            </button>
          </div>
        </div>
      )}

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Botão + Nova Inspeção */}
        <section>
          <button
            onClick={() => setShowNewInspection(!showNewInspection)}
            className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-lg hover:from-primary/90 hover:to-primary transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            <Plus className="h-6 w-6" />
            Nova Inspeção
          </button>

          {/* Formulários de tipo de equipamento (atrás do botão) */}
          {showNewInspection && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-muted-foreground mb-3">Selecione o tipo de equipamento:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(EQUIPMENT_LABELS) as EquipmentType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleNewInspection(type)}
                    className="flex items-center justify-center p-4 rounded-xl bg-card border-2 border-border hover:border-primary hover:shadow-md transition-all touch-target text-center card-hover"
                  >
                    <span className="font-medium text-card-foreground">
                      {EQUIPMENT_LABELS[type]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Seção: Inspeções em Andamento */}
        {inProgressInspections.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-status-warning" />
              Inspeções em Andamento
            </h2>
            <div className="space-y-2">
              {inProgressInspections.map((insp) => (
                <SwipeableInspectionItem
                  key={insp.id}
                  insp={insp}
                  onNavigate={(id) => navigate(`/ferramentas/analise-tecnica/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Seção: Inspeções Finalizadas */}
        {finalizedInspections.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-status-ok" />
              Inspeções Finalizadas
            </h2>
            <div className="space-y-2">
              {finalizedInspections.map((insp) => (
                <SwipeableInspectionItem
                  key={insp.id}
                  insp={insp}
                  onNavigate={(id) => navigate(`/ferramentas/analise-tecnica/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Mensagem quando não há inspeções */}
        {inProgressInspections.length === 0 && finalizedInspections.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhuma inspeção encontrada.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "+ Nova Inspeção" para começar.
            </p>
          </div>
        )}
      </main>

      {/* Close menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Index;