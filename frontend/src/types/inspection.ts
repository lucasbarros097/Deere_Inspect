export type EquipmentType =
  | "pa-carregadeira"
  | "motoniveladora"
  | "escavadeira"
  | "retroescavadeira"
  | "trator-esteira";

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  "pa-carregadeira": "Pá Carregadeira",
  motoniveladora: "Motoniveladora",
  escavadeira: "Escavadeira",
  retroescavadeira: "Retroescavadeira",
  "trator-esteira": "Trator de Esteira",
};

export interface InspectionHeader {
  cliente: string;
  tipoEquipamento: EquipmentType;
  marcaModelo: string;
  ano: string;
  numeroOs: string;
  rastreabilidade: number;
  numeroSerie: string;
  horimetro: string;
  localInspecao: string;
  aplicacao: string;
  tecnicoResponsavel: string;
  data: string;
  orcamento: "sim" | "nao" | "";
}

export interface AnalysisRequest {
  falhaFuncional: boolean;
  quebraComponente: boolean;
  analiseGarantia: boolean;
  analisePreventiva: boolean;
  tradeIn: boolean;
  reforma: boolean;
  sinistro: boolean;
  outros: boolean;
  descricaoReclamacao: string;
}

export interface OperatingConditions {
  tipoAplicacao: string[];
  materialManuseado: string;
  condicoesAmbientais: string;
  operadorTreinado: "sim" | "nao" | "";
  planoManutencao: "sim" | "nao" | "";
}

export interface DiagnosticoEletronico {
  ferramentasUtilizadas: string;
  manualPerformance: string;
  codigosAtivos: "sim" | "nao" | "";
  codigosPresentes: string;
}

export interface ChecklistItem {
  id: string;
  grupo?: string;
  descricao: string;
  medida: string;
  medidaReferencia: string;
  tempo: string;
  observacao: string;
}

export interface ChecklistSection {
  id: string;
  nome: string;
  itens: ChecklistItem[];
  aplicavelA: EquipmentType[];
}

export type SystemEvaluation = "aprovado" | "ressalvas" | "reprovado" | "";

export interface KanbanItem {
  sistemaId: string;
  sistemaNome: string;
  avaliacao: SystemEvaluation;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  observacao: string;
  titulo: string;
}

export interface Inspection {
  id: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  header: InspectionHeader;
  analysisRequest: AnalysisRequest;
  operatingConditions: OperatingConditions;
  diagnostico: DiagnosticoEletronico;
  checklistData: Record<string, ChecklistItem[]>;
  kanban: KanbanItem[];
  fotos: InspectionPhoto[];
  assinaturaTecnico: string;
  status: "em-andamento" | "finalizada";
}
