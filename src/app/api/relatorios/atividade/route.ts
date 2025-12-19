import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import prisma from "@/lib/prisma";
import type { Decimal } from "@prisma/client/runtime/library";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

type Tarefa = {
  id: number;
  cliente: { nome: string };
  tipoServico: { nome: string };
  status: string;
  data_inicio: Date;
  prazo_final: Date | null;
  valor_total_servico: Decimal | null;
  observacoes: string | null;
};

function escapeHtml(text?: string | null) {
  if (!text) return "—";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(tarefas: Tarefa[]) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório de Atividades</title>
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      body { font-family: Arial, sans-serif; color: #111; background: #fff; }
      h1 { text-align: center; margin: 0 0 20px; color: #000; font-size: 20px; border-bottom: 3px solid #000; padding-bottom: 10px; }
      .meta { color: #666; font-size: 12px; margin-bottom: 20px; text-align: center; }
      
      table { 
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }
      
      th, td { 
        border: 1px solid #999;
        padding: 8px 6px;
        font-size: 11px;
      }
      
      th { 
        background: #d9d9d9;
        text-align: left;
        font-weight: 600;
        color: #000;
      }
      
      tbody tr:nth-child(even) {
        background: #f5f5f5;
      }
      
      .text-center { text-align: center; }
      .text-right { text-align: right; }
    </style>
  </head>
  <body>
    <h1>Relatório de Atividades (Tarefas)</h1>
    <div class="meta">Total de atividades: ${tarefas.length}</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">ID</th>
          <th style="width: 200px;">Cliente</th>
          <th style="width: 180px;">Tipo de Serviço</th>
          <th style="width: 120px;">Status</th>
          <th style="width: 90px;">Data Início</th>
          <th style="width: 90px;">Prazo Final</th>
          <th style="width: 100px;">Valor</th>
          <th>Observações</th>
        </tr>
      </thead>
      <tbody>
        ${tarefas
          .map(
            (t) => `
          <tr>
            <td class="text-center">${t.id}</td>
            <td>${escapeHtml(t.cliente?.nome)}</td>
            <td>${escapeHtml(t.tipoServico?.nome)}</td>
            <td>${escapeHtml(t.status)}</td>
            <td>${new Date(t.data_inicio).toLocaleDateString("pt-BR")}</td>
            <td>${t.prazo_final ? new Date(t.prazo_final).toLocaleDateString("pt-BR") : "—"}</td>
            <td class="text-right">${t.valor_total_servico ? `R$ ${Number(t.valor_total_servico).toFixed(2)}` : "—"}</td>
            <td>${escapeHtml(t.observacoes)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </body>
</html>`;
}

async function buildExcel(tarefas: Tarefa[]) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Atividades");
  
  ws.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "Tipo de Serviço", key: "tipoServico", width: 30 },
    { header: "Status", key: "status", width: 20 },
    { header: "Data Início", key: "dataInicio", width: 15 },
    { header: "Prazo Final", key: "prazoFinal", width: 15 },
    { header: "Valor", key: "valor", width: 15 },
    { header: "Observações", key: "observacoes", width: 40 },
  ];

  // Estilizar cabeçalho
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9D9D9" },
  };

  // Adicionar dados
  tarefas.forEach((t) => {
    const row = ws.addRow({
      id: t.id,
      cliente: t.cliente?.nome || "—",
      tipoServico: t.tipoServico?.nome || "—",
      status: t.status || "—",
      dataInicio: new Date(t.data_inicio).toLocaleDateString("pt-BR"),
      prazoFinal: t.prazo_final ? new Date(t.prazo_final).toLocaleDateString("pt-BR") : "—",
      valor: t.valor_total_servico ? `R$ ${Number(t.valor_total_servico).toFixed(2)}` : "—",
      observacoes: t.observacoes || "—",
    });

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  if (tarefas.length === 0) {
    const row = ws.addRow({
      id: "",
      cliente: "",
      tipoServico: "",
      status: "Nenhuma atividade encontrada",
      dataInicio: "",
      prazoFinal: "",
      valor: "",
      observacoes: "",
    });
    row.getCell(4).font = { italic: true, color: { argb: "FF999999" } };
  }

  return await workbook.xlsx.writeBuffer();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "pdf";

  const tarefas = await prisma.tarefa.findMany({
    include: {
      cliente: {
        select: {
          nome: true,
        },
      },
      tipoServico: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: { id: "desc" },
    take: 200,
  });

  if (format === "excel") {
    const buffer = await buildExcel(tarefas);
    
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="relatorio-atividades.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  }

  const html = buildHtml(tarefas);

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdfUint8 = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: false,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });

    const pdfBuffer = Buffer.from(pdfUint8);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="relatorio-atividades.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}
}
