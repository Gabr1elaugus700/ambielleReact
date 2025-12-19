import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

type Suporte = {
  id: number;
  cliente_id: number;
  cliente: { nome: string };
  descricao: string;
  valor_hora: Decimal;
  data_suporte: Date;
  hora_inicio: Date;
  hora_fim: Date | null;
  tempo_suporte: Decimal | null;
  valor_total: Decimal | null;
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

function buildHtml(suportes: Suporte[]) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório de Suporte</title>
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
    <h1>Relatório de Suporte</h1>
    <div class="meta">Total de chamados: ${suportes.length}</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">ID</th>
          <th style="width: 200px;">Cliente</th>
          <th>Descrição</th>
          <th style="width: 90px;">Data</th>
          <th style="width: 80px;">Hora Início</th>
          <th style="width: 80px;">Hora Fim</th>
          <th style="width: 80px;">Tempo (h)</th>
          <th style="width: 80px;">Valor/Hora</th>
          <th style="width: 100px;">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        ${suportes
          .map(
            (s) => `
          <tr>
            <td class="text-center">${s.id}</td>
            <td>${escapeHtml(s.cliente?.nome)}</td>
            <td>${escapeHtml(s.descricao)}</td>
            <td>${new Date(s.data_suporte).toLocaleDateString("pt-BR")}</td>
            <td>${new Date(s.hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
            <td>${s.hora_fim ? new Date(s.hora_fim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
            <td class="text-right">${s.tempo_suporte ? Number(s.tempo_suporte).toFixed(2) : "—"}</td>
            <td class="text-right">R$ ${Number(s.valor_hora).toFixed(2)}</td>
            <td class="text-right">${s.valor_total ? `R$ ${Number(s.valor_total).toFixed(2)}` : "—"}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </body>
</html>`;
}

async function buildExcel(suportes: Suporte[]) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Suportes");
  
  ws.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "Descrição", key: "descricao", width: 40 },
    { header: "Data", key: "data", width: 15 },
    { header: "Hora Início", key: "horaInicio", width: 15 },
    { header: "Hora Fim", key: "horaFim", width: 15 },
    { header: "Tempo (h)", key: "tempo", width: 12 },
    { header: "Valor/Hora", key: "valorHora", width: 15 },
    { header: "Valor Total", key: "valorTotal", width: 15 },
  ];

  // Estilizar cabeçalho
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9D9D9" },
  };

  // Adicionar dados
  suportes.forEach((s) => {
    const row = ws.addRow({
      id: s.id,
      cliente: s.cliente?.nome || "—",
      descricao: s.descricao || "—",
      data: new Date(s.data_suporte).toLocaleDateString("pt-BR"),
      horaInicio: new Date(s.hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      horaFim: s.hora_fim ? new Date(s.hora_fim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—",
      tempo: s.tempo_suporte ? Number(s.tempo_suporte).toFixed(2) : "—",
      valorHora: `R$ ${Number(s.valor_hora).toFixed(2)}`,
      valorTotal: s.valor_total ? `R$ ${Number(s.valor_total).toFixed(2)}` : "—",
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

  if (suportes.length === 0) {
    const row = ws.addRow({
      id: "",
      cliente: "",
      descricao: "Nenhum suporte encontrado",
      data: "",
      horaInicio: "",
      horaFim: "",
      tempo: "",
      valorHora: "",
      valorTotal: "",
    });
    row.getCell(3).font = { italic: true, color: { argb: "FF999999" } };
  }

  return await workbook.xlsx.writeBuffer();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "pdf";

  const suportes = await prisma.suporte.findMany({
    include: {
      cliente: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: { id: "desc" },
    take: 200,
  });

  if (format === "excel") {
    const buffer = await buildExcel(suportes);
    
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="relatorio-suporte.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  }

  const html = buildHtml(suportes);

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
        "Content-Disposition": 'inline; filename="relatorio-suporte.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}
