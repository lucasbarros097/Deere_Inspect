import { useRef } from "react";
import { Inspection, EQUIPMENT_LABELS } from "@/types/inspection";
import { FileText, PenTool, Download } from "lucide-react";
import { generateInspectionPdf } from "@/lib/generatePdf";

interface Props {
  inspection: Inspection;
  onSign: (signature: string) => void;
}

export const SignatureSection = ({ inspection, onSign }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pos = "touches" in e ? e.touches[0] : e;
    ctx.beginPath();
    ctx.moveTo(pos.clientX - rect.left, pos.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pos = "touches" in e ? e.touches[0] : e;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "hsl(220, 20%, 10%)";
    ctx.lineTo(pos.clientX - rect.left, pos.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    onSign(dataUrl);
  };

  const totalSystems = inspection.kanban.length;
  const evaluated = inspection.kanban.filter((k) => k.avaliacao !== "").length;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">Finalizar Inspeção</h2>

      {/* Summary */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          <strong>Equipamento:</strong> {EQUIPMENT_LABELS[inspection.header.tipoEquipamento]}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Cliente:</strong> {inspection.header.cliente || "—"}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Modelo:</strong> {inspection.header.marcaModelo || "—"}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Série:</strong> {inspection.header.numeroSerie || "—"}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Kanban:</strong> {evaluated}/{totalSystems} sistemas avaliados
        </p>
      </div>

      {/* Signature */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          Assinatura do Técnico
        </label>
        <div className="border-2 border-border rounded-lg bg-white overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="w-full cursor-crosshair touch-none bg-white"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>
        <button
          onClick={clearCanvas}
          className="mt-2 text-sm text-muted-foreground underline"
        >
          Limpar assinatura
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSign}
          className="w-full p-4 rounded-lg bg-primary text-primary-foreground font-bold touch-target flex items-center justify-center gap-2"
        >
          <FileText className="h-5 w-5" />
          Finalizar e Assinar Inspeção
        </button>

        {inspection.status === "finalizada" && (
          <>
            <p className="text-center text-sm text-status-ok font-medium">
              ✓ Inspeção finalizada com sucesso
            </p>
            <button
              onClick={() => generateInspectionPdf(inspection)}
              className="w-full p-4 rounded-lg bg-secondary text-secondary-foreground font-bold touch-target flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Baixar Relatório PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
};
