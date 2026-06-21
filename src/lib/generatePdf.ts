import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Inspection, EQUIPMENT_LABELS } from "@/types/inspection";
import { getSectionsForEquipment } from "@/data/checklistSections";

export function generateInspectionPdf(inspection: Inspection) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  const PRIMARY_COLOR: [number, number, number] = [255, 161, 0];
  const DARK_BAR: [number, number, number] = [30, 30, 30];

  // ── Helper ──
  const addSectionTitle = (title: string) => {
    if (y > 260) {
      doc.addPage();
      y = 14;
    }
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(margin, y, pageW - margin * 2, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin + 3, y + 5.5);
    doc.setTextColor(0, 0, 0);
    y += 12;
  };

  const addField = (label: string, value: string) => {
    if (y > 275) {
      doc.addPage();
      y = 14;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", margin + doc.getTextWidth(label + ": ") + 1, y);
    y += 5;
  };

  // ══════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setFillColor(...DARK_BAR);
  doc.rect(0, 22, pageW, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("RELATÓRIO DE INSPEÇÃO TÉCNICA", pageW / 2, 10, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Equipamentos Linha Amarela John Deere", pageW / 2, 17, { align: "center" });
  
  if (inspection.header.rastreabilidade) {
     doc.setFontSize(10);
     doc.setTextColor(100, 100, 100);
     doc.text(`Tracker Nº ${String(inspection.header.rastreabilidade).padStart(5, '0')}`, pageW - margin, 17, { align: "right" });
  }
  
  doc.setTextColor(0, 0, 0);
  y = 32;

  // ══════════════════════════════════════
  // DADOS INICIAIS
  // ══════════════════════════════════════
  addSectionTitle("1. DADOS INICIAIS");
  const h = inspection.header;
  addField("Cliente", h.cliente);
  addField("Ordem de Serviço (O.S)", h.numeroOs);
  addField("Equipamento", EQUIPMENT_LABELS[h.tipoEquipamento]);
  addField("Marca / Modelo", h.marcaModelo);
  addField("Ano", h.ano);
  addField("Número de Série", h.numeroSerie);
  addField("Horímetro", h.horimetro);
  addField("Local da Inspeção", h.localInspecao);
  addField("Aplicação", h.aplicacao);
  addField("Técnico Responsável", h.tecnicoResponsavel);
  addField("Data", h.data);
  addField("Orçamento", h.orcamento === "sim" ? "Sim" : h.orcamento === "nao" ? "Não" : "—");
  y += 4;

  // ══════════════════════════════════════
  // SOLICITAÇÃO DE ANÁLISE
  // ══════════════════════════════════════
  addSectionTitle("2. SOLICITAÇÃO DE ANÁLISE");
  const ar = inspection.analysisRequest;
  const checks = [
    ["Falha funcional", ar.falhaFuncional],
    ["Quebra de componente", ar.quebraComponente],
    ["Análise de garantia", ar.analiseGarantia],
    ["Análise preventiva", ar.analisePreventiva],
    ["Trade-in", ar.tradeIn],
    ["Reforma", ar.reforma],
    ["Sinistro", ar.sinistro],
    ["Outros", ar.outros],
  ] as [string, boolean][];

  doc.setFontSize(9);
  checks.forEach(([label, checked]) => {
    if (y > 275) { doc.addPage(); y = 14; }
    doc.setFont("helvetica", "normal");
    doc.text(`[${checked ? "X" : " "}] ${label}`, margin, y);
    y += 5;
  });
  if (ar.descricaoReclamacao) {
    y += 2;
    addField("Descrição da reclamação", ar.descricaoReclamacao);
  }
  y += 4;

  // ══════════════════════════════════════
  // CONDIÇÕES DE OPERAÇÃO
  // ══════════════════════════════════════
  addSectionTitle("3. CONDIÇÕES DE OPERAÇÃO");
  const oc = inspection.operatingConditions;
  addField("Tipo de aplicação", oc.tipoAplicacao.join(", "));
  addField("Material manuseado", oc.materialManuseado);
  addField("Condições ambientais", oc.condicoesAmbientais);
  addField("Operador treinado (padrão JD)", oc.operadorTreinado === "sim" ? "Sim" : oc.operadorTreinado === "nao" ? "Não" : "—");
  addField("Plano de manutenção em dia", oc.planoManutencao === "sim" ? "Sim" : oc.planoManutencao === "nao" ? "Não" : "—");
  y += 4;

  // ══════════════════════════════════════
  // CHECKLISTS POR SISTEMA
  // ══════════════════════════════════════
  const sections = getSectionsForEquipment(h.tipoEquipamento);
  let sectionNum = 4;

  sections.forEach((section) => {
    addSectionTitle(`${sectionNum}. ${section.nome.toUpperCase()}`);
    sectionNum++;

    const items = inspection.checklistData[section.id] || [];
    if (items.length === 0) {
      doc.setFontSize(9);
      doc.text("Nenhum item registrado.", margin, y);
      y += 6;
      return;
    }

    const tableBody: any[] = [];
    let lastGrupo = "";
    items.forEach((item) => {
      const g = item.grupo || "";
      if (g && g !== lastGrupo) {
        tableBody.push([
          { content: g, colSpan: 5, styles: { fillColor: PRIMARY_COLOR, textColor: [0, 0, 0], fontStyle: "bold", fontSize: 8, halign: "left" } },
        ]);
        lastGrupo = g;
      }
      tableBody.push([
        item.descricao,
        item.medida || "—",
        item.medidaReferencia || "—",
        item.tempo || "—",
        item.observacao || "—",
      ]);
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Descrição", "Medida", "Referência", "Tempo", "Observação"]],
      body: tableBody,
      styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 45 },
      },
      alternateRowStyles: { fillColor: [245, 245, 240] },
      didDrawPage: () => {
        y = 14;
      },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  });

  // ══════════════════════════════════════
  // KANBAN
  // ══════════════════════════════════════
  addSectionTitle(`${sectionNum}. KANBAN DA INSPEÇÃO`);
  sectionNum++;

  const kanbanBody = inspection.kanban.map((k) => {
    const status =
      k.avaliacao === "aprovado"
        ? "APROVADO"
        : k.avaliacao === "ressalvas"
        ? "APROVADO C/ RESSALVAS"
        : k.avaliacao === "reprovado"
        ? "REPROVADO"
        : "NÃO AVALIADO";
    return [k.sistemaNome, status];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Sistema", "Avaliação"]],
    body: kanbanBody,
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [0, 0, 0], fontStyle: "bold" },
    bodyStyles: { fontStyle: "bold" },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 1) {
        const val = data.cell.raw as string;
        if (val === "APROVADO") {
          data.cell.styles.textColor = [22, 128, 57];
          data.cell.styles.fillColor = [220, 252, 231];
        } else if (val === "APROVADO C/ RESSALVAS") {
          data.cell.styles.textColor = [146, 64, 14];
          data.cell.styles.fillColor = [254, 243, 199];
        } else if (val === "REPROVADO") {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fillColor = [254, 226, 226];
        } else {
          data.cell.styles.textColor = [120, 120, 120];
        }
      }
    },
    didDrawPage: () => {
      y = 14;
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ══════════════════════════════════════
  // FOTOS ADICIONAIS
  // ══════════════════════════════════════
  const fotosPreenchidas = inspection.fotos?.filter(f => f.url) || [];
  if (fotosPreenchidas.length > 0) {
    addSectionTitle(`${sectionNum}. REGISTRO FOTOGRÁFICO`);
    sectionNum++;

    const colW = (pageW - margin * 2 - 10) / 2; 
    const imgHeight = 50; 
    
    fotosPreenchidas.forEach((foto, i) => {
       const isLeft = i % 2 === 0;
       if (isLeft && y > 210) { doc.addPage(); y = 14; }
       
       const currentX = isLeft ? margin : margin + colW + 10;
       
       try {
           doc.addImage(foto.url, "JPEG", currentX, y, colW, imgHeight, undefined, "FAST");
           doc.setFontSize(8);
           doc.setFont("helvetica", "bold");
           doc.text(foto.titulo, currentX, y + imgHeight + 4);
           doc.setFont("helvetica", "normal");
           
           const obsLines = doc.splitTextToSize(foto.observacao || "Sem observação", colW);
           doc.text(obsLines, currentX, y + imgHeight + 8);
           
           if (!isLeft || i === fotosPreenchidas.length - 1) {
              const maxLines = obsLines.length; // Simplified height calculation
              y += imgHeight + 10 + (maxLines * 4);
           }
       } catch (e) {
           doc.text("Erro ao renderizar imagem", currentX, y + 5);
       }
    });

    y += 10;
  }

  // ══════════════════════════════════════
  // ASSINATURA
  // ══════════════════════════════════════
  if (y > 230) {
    doc.addPage();
    y = 14;
  }

  addSectionTitle(`${sectionNum}. ASSINATURA DO TÉCNICO`);

  if (inspection.assinaturaTecnico) {
    try {
      doc.addImage(inspection.assinaturaTecnico, "PNG", margin, y, 60, 22);
      y += 25;
    } catch {
      doc.setFontSize(9);
      doc.text("(assinatura digital registrada)", margin, y);
      y += 6;
    }
  } else {
    doc.setFontSize(9);
    doc.text("Sem assinatura registrada.", margin, y);
    y += 6;
  }

  doc.setDrawColor(0);
  doc.line(margin, y, margin + 70, y);
  y += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(h.tecnicoResponsavel || "Técnico Responsável", margin, y);
  y += 4;
  doc.text(`Data: ${h.data}`, margin, y);

  // ── Footer on all pages ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} — Página ${i} de ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);
  }

  // Save
  const trackerStr = h.rastreabilidade ? `_T${h.rastreabilidade}` : '';
  const osStr = h.numeroOs ? `_OS-${h.numeroOs}` : '';
  const fileName = `Inspecao_${h.cliente || "sem-cliente"}${trackerStr}${osStr}_${h.data}.pdf`;
  doc.save(fileName.replace(/\s+/g, "_"));
}
