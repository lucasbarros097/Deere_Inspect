import { Inspection } from "@/types/inspection";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

function toSnakeCaseInspection(inspection: Inspection) {
  return {
    id: inspection.id,
    created_by: inspection.createdBy,
    header: inspection.header,
    analysis_request: inspection.analysisRequest,
    operating_conditions: inspection.operatingConditions,
    diagnostico: inspection.diagnostico,
    checklist_data: inspection.checklistData,
    kanban: inspection.kanban,
    fotos: inspection.fotos,
    assinatura_tecnico: inspection.assinaturaTecnico,
    status: inspection.status,
  };
}

/** Gets global sequential tracking number, auto-increments it */
export async function getNextRastreabilidade(): Promise<number> {
  try {
    const data = await request<{ next_rastreabilidade: number }>("/api/next-rastreabilidade");
    return data.next_rastreabilidade;
  } catch (e) {
    console.error("Failed to fetch next rastreabilidade", e);
    return Date.now() % 1000000;
  }
}

/** Syncs a single inspection to the backend */
export async function syncInspectionToCloud(inspection: Inspection): Promise<void> {
  const body = toSnakeCaseInspection(inspection);
  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const updateResponse = await fetch(apiUrl(`/api/inspections/${inspection.id}`), {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (updateResponse.ok) {
    return;
  }

  if (updateResponse.status === 404) {
    await request<Inspection>("/api/inspections", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return;
  }

  const errorText = await updateResponse.text();
  throw new Error(errorText || `Failed to sync inspection: ${updateResponse.status}`);
}

/** Fetches all inspections globally (For Admin Area) */
export async function fetchAllInspectionsGlobal(): Promise<Inspection[]> {
  try {
    const data = await request<Inspection[]>("/api/inspections");
    return data.map((inspection: any) => ({
      id: inspection.id,
      createdBy: inspection.created_by,
      createdAt: inspection.created_at,
      updatedAt: inspection.updated_at,
      header: inspection.header,
      analysisRequest: inspection.analysis_request,
      operatingConditions: inspection.operating_conditions,
      diagnostico: inspection.diagnostico,
      checklistData: inspection.checklist_data,
      kanban: inspection.kanban,
      fotos: inspection.fotos,
      assinaturaTecnico: inspection.assinatura_tecnico || "",
      status: inspection.status,
    }));
  } catch (error) {
    console.error("Error fetching global inspections", error);
    return [];
  }
}
