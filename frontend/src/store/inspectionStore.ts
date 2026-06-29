import { Inspection, EquipmentType, ChecklistItem, KanbanItem } from "@/types/inspection";
import { getSectionsForEquipment } from "@/data/checklistSections";
import { syncInspectionToCloud } from "@/lib/inspectionsApi";

const STORAGE_KEY = "jd_inspections";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function createNewInspection(equipmentType: EquipmentType, creatorUid: string = ""): Inspection {
  const sections = getSectionsForEquipment(equipmentType);
  const checklistData: Record<string, ChecklistItem[]> = {};
  const kanban: KanbanItem[] = [];
  const fotos = Array.from({ length: 30 }).map((_, i) => ({
    id: generateId(),
    url: "",
    observacao: "",
    titulo: `Foto ${i + 1}`,
  }));

  sections.forEach((section) => {
    checklistData[section.id] = section.itens.map((item) => ({ ...item }));
    kanban.push({
      sistemaId: section.id,
      sistemaNome: section.nome,
      avaliacao: "",
    });
  });

  return {
    id: generateId(),
    createdBy: creatorUid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    header: {
      cliente: "",
      tipoEquipamento: equipmentType,
      marcaModelo: "",
      ano: "",
      numeroOs: "",
      rastreabilidade: 0,
      numeroSerie: "",
      horimetro: "",
      localInspecao: "",
      aplicacao: "",
      tecnicoResponsavel: "",
      data: new Date().toISOString().split("T")[0],
      orcamento: "",
    },
    analysisRequest: {
      falhaFuncional: false,
      quebraComponente: false,
      analiseGarantia: false,
      analisePreventiva: false,
      tradeIn: false,
      reforma: false,
      sinistro: false,
      outros: false,
      descricaoReclamacao: "",
    },
    operatingConditions: {
      tipoAplicacao: [],
      materialManuseado: "",
      condicoesAmbientais: "",
      operadorTreinado: "",
      planoManutencao: "",
    },
    diagnostico: {
      ferramentasUtilizadas: "SERVICE ADVISOR",
      manualPerformance: "",
      codigosAtivos: "",
      codigosPresentes: "",
    },
    checklistData,
    kanban,
    fotos,
    assinaturaTecnico: "",
    status: "em-andamento",
  };
}

export function saveInspection(inspection: Inspection): void {
  const all = getAllInspections();
  const idx = all.findIndex((i) => i.id === inspection.id);
  inspection.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    all[idx] = inspection;
  } else {
    all.push(inspection);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  // Sincroniza em background
  if (navigator.onLine) {
    syncInspectionToCloud(inspection).catch(e => console.error("Sync error", e));
  }
}

export function getAllInspections(): Inspection[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getInspectionById(id: string): Inspection | undefined {
  return getAllInspections().find((i) => i.id === id);
}

export function deleteInspection(id: string): void {
  const all = getAllInspections().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
