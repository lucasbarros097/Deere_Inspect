import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInspectionById, saveInspection } from "@/store/inspectionStore";
import { getNextRastreabilidade } from "@/lib/inspectionsApi";
import { Inspection, EQUIPMENT_LABELS, EquipmentType } from "@/types/inspection";
import { InspectionHeader } from "@/features/inspections/components/InspectionHeader";
import { AnalysisRequestSection } from "@/features/inspections/components/AnalysisRequestSection";
import { OperatingConditionsSection } from "@/features/inspections/components/OperatingConditionsSection";
import { DiagnosticoSection } from "@/features/inspections/components/DiagnosticoSection";
import { ChecklistSectionView } from "@/features/inspections/components/ChecklistSectionView";
import { KanbanSection } from "@/features/inspections/components/KanbanSection";
import { PhotosSection } from "@/features/inspections/components/PhotosSection";
import { SignatureSection } from "@/features/inspections/components/SignatureSection";
import { getSectionsForEquipment } from "@/data/checklistSections";
import { ArrowLeft, Save, ChevronRight, Recycle, History } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

// Novos Modais
import RecycleModal from "@/components/RecycleModal";
import EditHistory from "@/components/EditHistory";
import EditReasonDialog from "@/components/EditReasonDialog";

type Tab = "dados" | "analise" | "condicoes" | "diagnostico" | "checklist" | "kanban" | "fotos" | "assinatura";

const TABS: { key: Tab; label: string }[] = [
  { key: "dados", label: "Dados Iniciais" },
  { key: "analise", label: "Solicitação" },
  { key: "condicoes", label: "Condições" },
  { key: "diagnostico", label: "Diagnóstico" },
  { key: "checklist", label: "Checklist" },
  { key: "kanban", label: "Kanban" },
  { key: "fotos", label: "Fotos" },
  { key: "assinatura", label: "Finalizar" },
];

const InspectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { username } = useAuth();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dados");
  const [saved, setSaved] = useState(false);

  // Estados dos novos modais
  const [isRecycleModalOpen, setIsRecycleModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditReasonOpen, setIsEditReasonOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<Partial<Inspection> | null>(null);
  const [editReason, setEditReason] = useState("");

  const isFinalized = inspection?.status === "finalizada";

  useEffect(() => {
    if (id) {
      const data = getInspectionById(id);
      if (data) {
        if (!data.diagnostico) {
          (data as any).diagnostico = {
            ferramentasUtilizadas: "SERVICE ADVISOR",
            manualPerformance: "",
            codigosAtivos: "",
            codigosPresentes: "",
          };
        }
        setInspection(data);
      } else navigate("/");
    }
  }, [id, navigate]);

  useEffect(() => {
    if (inspection && inspection.header.rastreabilidade === 0 && navigator.onLine) {
      getNextRastreabilidade().then(num => {
        const updated = { ...inspection, header: { ...inspection.header, rastreabilidade: num } };
        setInspection(updated);
        saveInspection(updated);
      });
    }
  }, [inspection?.header.rastreabilidade]);

  const applyUpdate = (updates: Partial<Inspection>) => {
    if (!inspection) return;
    const updated = { ...inspection, ...updates };
    setInspection(updated);
    saveInspection(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleUpdate = useCallback(
    (updates: Partial<Inspection>) => {
      if (!inspection) return;

      // Interceptando se for finalizada para pedir motivo da edição
      if (isFinalized && updates.status !== "finalizada") {
        setPendingUpdate(updates);
        setIsEditReasonOpen(true);
        return;
      }

      applyUpdate(updates);
    },
    [inspection, isFinalized]
  );

  const confirmEditReason = () => {
    setIsEditReasonOpen(false);
    if (pendingUpdate) {
      applyUpdate(pendingUpdate);
      setPendingUpdate(null);
      setEditReason("");
    }
  };

  if (!inspection) return null;

  const sections = getSectionsForEquipment(inspection.header.tipoEquipamento);

  return (
    <div className="min-h-screen bg-background pt-16">
      <header className="industrial-header px-4 py-3 sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-primary touch-target">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">Voltar</span>
          </button>

          <div className="text-center flex-1 mx-2">
            <p className="text-sm font-bold text-primary truncate">
              {EQUIPMENT_LABELS[inspection.header.tipoEquipamento as EquipmentType]}
            </p>
            <p className="text-xs text-industrial-dark-foreground/60 truncate">
              {inspection.header.cliente || "Nova inspeção"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-status-ok animate-pulse-warning hidden sm:inline">Salvo ✓</span>
            )}

            {/* Botões do Topo */}
            <div className="flex gap-1.5">
              <button onClick={() => setIsHistoryOpen(true)} className="p-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded transition-colors" title="Histórico">
                <History className="h-4 w-4" />
              </button>
              {isFinalized && (
                <button onClick={() => setIsRecycleModalOpen(true)} className="p-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded transition-colors" title="Aproveitar">
                  <Recycle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-card border-b border-border overflow-x-auto no-scrollbar scroll-smooth sticky top-[52px] z-40">
        <div className="container max-w-4xl mx-auto flex w-max min-w-full px-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors touch-target flex-none ${activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {activeTab === "dados" && (
          <InspectionHeader
            header={inspection.header}
            onChange={(header) => handleUpdate({ header })}
            isFinalized={isFinalized}
          />
        )}
        {activeTab === "analise" && (
          <AnalysisRequestSection
            data={inspection.analysisRequest}
            onChange={(analysisRequest) => handleUpdate({ analysisRequest })}
          />
        )}
        {activeTab === "condicoes" && (
          <OperatingConditionsSection
            data={inspection.operatingConditions}
            onChange={(operatingConditions) => handleUpdate({ operatingConditions })}
          />
        )}
        {activeTab === "diagnostico" && (
          <DiagnosticoSection
            data={inspection.diagnostico}
            onChange={(diagnostico) => handleUpdate({ diagnostico })}
          />
        )}
        {activeTab === "checklist" && (
          <div className="space-y-4">
            {sections.map((section) => (
              <ChecklistSectionView
                key={section.id}
                section={section}
                items={inspection.checklistData[section.id] || []}
                onChange={(items) =>
                  handleUpdate({
                    checklistData: {
                      ...inspection.checklistData,
                      [section.id]: items,
                    },
                  })
                }
              />
            ))}
          </div>
        )}
        {activeTab === "kanban" && (
          <KanbanSection
            items={inspection.kanban}
            onChange={(kanban) => handleUpdate({ kanban })}
          />
        )}
        {activeTab === "fotos" && (
          <PhotosSection
            fotos={inspection.fotos || []}
            onChange={(fotos) => handleUpdate({ fotos })}
            isFinalized={isFinalized}
          />
        )}
        {activeTab === "assinatura" && (
          <SignatureSection
            inspection={inspection}
            onSign={(assinaturaTecnico) =>
              handleUpdate({ assinaturaTecnico, status: "finalizada" })
            }
          />
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => {
              const idx = TABS.findIndex((t) => t.key === activeTab);
              if (idx > 0) setActiveTab(TABS[idx - 1].key);
            }}
            disabled={activeTab === TABS[0].key}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted text-muted-foreground disabled:opacity-30 touch-target font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            onClick={() => {
              const idx = TABS.findIndex((t) => t.key === activeTab);
              if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key);
            }}
            disabled={activeTab === TABS[TABS.length - 1].key}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 touch-target font-medium"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      {/* Modais Integrados */}
      {isRecycleModalOpen && <RecycleModal isOpen={isRecycleModalOpen} inspectionId={inspection.id} onClose={() => setIsRecycleModalOpen(false)} />}
      {isHistoryOpen && <EditHistory isOpen={isHistoryOpen} inspectionId={inspection.id} onClose={() => setIsHistoryOpen(false)} />}
      {isEditReasonOpen && (
        <EditReasonDialog
          isOpen={isEditReasonOpen}
          onConfirm={confirmEditReason}
          onCancel={() => { setIsEditReasonOpen(false); setPendingUpdate(null); }}
        />
      )}
    </div>
  );
};

export default InspectionPage;