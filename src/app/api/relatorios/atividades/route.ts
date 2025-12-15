import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import prisma from "@/lib/prisma";
import type { Decimal } from "@prisma/client/runtime/library";

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
      @page { size: A4 landscape; margin: 12mm; }
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

export async function GET(req: NextRequest) {
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

  const html = buildHtml(tarefas);

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdfUint8 = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
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
