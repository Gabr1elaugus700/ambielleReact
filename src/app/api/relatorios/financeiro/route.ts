import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

type TarefaFinanceira = {
  id: number;
  cliente: {
    nome: string;
    cnpj: string;
  };
  tipoServico: {
    nome: string;
    orgao: string | null;
  };
  data_inicio: Date;
  prazo_final: Date | null;
  valor_total_servico: Decimal | null;
};

type SuporteFinanceiro = {
  id: number;
  cliente: {
    nome: string;
    cnpj: string;
  };
  descricao: string;
  data_suporte: Date;
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

function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj) return "—";
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return cnpj;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
}

function buildHtml(tarefas: TarefaFinanceira[], suportes: SuporteFinanceiro[], dataInicio: string, dataFim: string, incluirSuportes: boolean) {
  const totalTarefas = tarefas
    .filter((t) => t.valor_total_servico)
    .reduce((acc, t) => acc + Number(t.valor_total_servico || 0), 0);
  
  const totalSuportes = incluirSuportes ? suportes
    .filter((s) => s.valor_total)
    .reduce((acc, s) => acc + Number(s.valor_total || 0), 0) : 0;
  
  const totalReceitas = totalTarefas + totalSuportes;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório Financeiro</title>
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      body { font-family: Arial, sans-serif; color: #111; background: #fff; }
      h1 { text-align: center; margin: 0 0 20px; color: #000; font-size: 20px; border-bottom: 3px solid #000; padding-bottom: 10px; }
      .meta { color: #666; font-size: 12px; margin-bottom: 20px; text-align: center; }
      
      .resumo { 
        background: #e8e8e8;
        border: 2px solid #333;
        padding: 12px;
        margin: 16px 0;
        text-align: center;
      }
      .resumo-item { 
        display: inline-block;
        margin: 0 20px;
        font-weight: bold;
        font-size: 14px;
      }
      
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
    <h1>Relatório Financeiro</h1>
    <div class="meta">Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} a ${new Date(dataFim).toLocaleDateString('pt-BR')}</div>
    
    <div class="resumo">
      <div class="resumo-item">
        Total de Serviços: R$ ${totalTarefas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      ${incluirSuportes ? `<div class="resumo-item">
        Total de Suportes: R$ ${totalSuportes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div class="resumo-item">
        Total Geral: R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50px;">ID</th>
          <th style="width: 90px;">Data Início</th>
          <th style="width: 200px;">Cliente</th>
          <th style="width: 120px;">CNPJ</th>
          <th>Tarefa - Serviço - Órgão</th>
          <th style="width: 90px;">Prazo Final</th>
          <th style="width: 100px;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${tarefas
          .map(
            (t) => {
              const tarefaInfo = `Tarefa ${t.id} - ${escapeHtml(t.tipoServico?.nome)}${t.tipoServico?.orgao ? ` - ${escapeHtml(t.tipoServico.orgao)}` : ''}`;
              return `
          <tr>
            <td class="text-center">${t.id}</td>
            <td>${new Date(t.data_inicio).toLocaleDateString("pt-BR")}</td>
            <td>${escapeHtml(t.cliente?.nome)}</td>
            <td>${formatCnpj(t.cliente?.cnpj)}</td>
            <td>${tarefaInfo}</td>
            <td>${t.prazo_final ? new Date(t.prazo_final).toLocaleDateString("pt-BR") : "—"}</td>
            <td class="text-right">${t.valor_total_servico ? `R$ ${Number(t.valor_total_servico).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</td>
          </tr>
        `;
            }
          )
          .join("")}
        ${incluirSuportes ? suportes.map((s) => `
          <tr style="background: #fff8dc;">
            <td class="text-center">SUP-${s.id}</td>
            <td>${new Date(s.data_suporte).toLocaleDateString("pt-BR")}</td>
            <td>${escapeHtml(s.cliente?.nome)}</td>
            <td>${formatCnpj(s.cliente?.cnpj)}</td>
            <td>Suporte - ${escapeHtml(s.descricao)}</td>
            <td>—</td>
            <td class="text-right">${s.valor_total ? `R$ ${Number(s.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</td>
          </tr>
        `).join("") : ''}
      </tbody>
    </table>
  </body>
</html>`;
}

async function buildExcel(tarefas: TarefaFinanceira[], suportes: SuporteFinanceiro[], dataInicio: string, dataFim: string, incluirSuportes: boolean) {
  const workbook = new ExcelJS.Workbook();
  
  const totalTarefas = tarefas
    .filter((t) => t.valor_total_servico)
    .reduce((acc, t) => acc + Number(t.valor_total_servico || 0), 0);
  
  const totalSuportes = incluirSuportes ? suportes
    .filter((s) => s.valor_total)
    .reduce((acc, s) => acc + Number(s.valor_total || 0), 0) : 0;
  
  const totalReceitas = totalTarefas + totalSuportes;

  // Criar planilha de Serviços (Tarefas)
  const wsTarefas = workbook.addWorksheet("Serviços");
  
  wsTarefas.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Data Início", key: "dataInicio", width: 15 },
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "CNPJ", key: "cnpj", width: 20 },
    { header: "Tarefa - Serviço - Órgão", key: "descricao", width: 40 },
    { header: "Prazo Final", key: "prazoFinal", width: 15 },
    { header: "Valor", key: "valor", width: 15 },
  ];

  // Estilizar cabeçalho
  wsTarefas.getRow(1).font = { bold: true };
  wsTarefas.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9D9D9" },
  };

  // Adicionar dados de tarefas
  tarefas.forEach((t) => {
    const tarefaInfo = `Tarefa ${t.id} - ${t.tipoServico?.nome || ''}${t.tipoServico?.orgao ? ` - ${t.tipoServico.orgao}` : ''}`;
    const row = wsTarefas.addRow({
      id: t.id,
      dataInicio: new Date(t.data_inicio).toLocaleDateString("pt-BR"),
      cliente: t.cliente?.nome || "—",
      cnpj: formatCnpj(t.cliente?.cnpj),
      descricao: tarefaInfo,
      prazoFinal: t.prazo_final ? new Date(t.prazo_final).toLocaleDateString("pt-BR") : "—",
      valor: t.valor_total_servico ? `R$ ${Number(t.valor_total_servico).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
    });

    // Bordas
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Adicionar linha de total
  const rowTotal = wsTarefas.addRow({
    id: "",
    dataInicio: "",
    cliente: "",
    cnpj: "",
    descricao: "",
    prazoFinal: "TOTAL:",
    valor: `R$ ${totalTarefas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  });
  rowTotal.font = { bold: true };
  rowTotal.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8E8E8" },
  };
  rowTotal.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  if (tarefas.length === 0) {
    const row = wsTarefas.addRow({
      id: "",
      dataInicio: "",
      cliente: "Nenhum serviço encontrado neste período",
      cnpj: "",
      descricao: "",
      prazoFinal: "",
      valor: "",
    });
    row.getCell(3).font = { italic: true, color: { argb: "FF999999" } };
  }

  // Criar planilha de Suportes se necessário
  if (incluirSuportes) {
    const wsSuportes = workbook.addWorksheet("Suportes");
    
    wsSuportes.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Data", key: "data", width: 15 },
      { header: "Cliente", key: "cliente", width: 30 },
      { header: "CNPJ", key: "cnpj", width: 20 },
      { header: "Descrição", key: "descricao", width: 40 },
      { header: "Prazo Final", key: "prazoFinal", width: 15 },
      { header: "Valor", key: "valor", width: 15 },
    ];

    // Estilizar cabeçalho
    wsSuportes.getRow(1).font = { bold: true };
    wsSuportes.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };

    // Adicionar dados de suportes
    suportes.forEach((s) => {
      const row = wsSuportes.addRow({
        id: `SUP-${s.id}`,
        data: new Date(s.data_suporte).toLocaleDateString("pt-BR"),
        cliente: s.cliente?.nome || "—",
        cnpj: formatCnpj(s.cliente?.cnpj),
        descricao: `Suporte - ${s.descricao || ''}`,
        prazoFinal: "—",
        valor: s.valor_total ? `R$ ${Number(s.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
      });

      // Bordas
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Adicionar linha de total
    const rowTotalSup = wsSuportes.addRow({
      id: "",
      data: "",
      cliente: "",
      cnpj: "",
      descricao: "",
      prazoFinal: "TOTAL:",
      valor: `R$ ${totalSuportes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
    rowTotalSup.font = { bold: true };
    rowTotalSup.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8E8E8" },
    };
    rowTotalSup.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    if (suportes.length === 0) {
      const row = wsSuportes.addRow({
        id: "",
        data: "",
        cliente: "Nenhum suporte encontrado neste período",
        cnpj: "",
        descricao: "",
        prazoFinal: "",
        valor: "",
      });
      row.getCell(3).font = { italic: true, color: { argb: "FF999999" } };
    }

    // Adicionar planilha de resumo geral
    const wsResumo = workbook.addWorksheet("Resumo");
    wsResumo.columns = [
      { header: "Descrição", key: "descricao", width: 30 },
      { header: "Valor", key: "valor", width: 20 },
    ];

    wsResumo.getRow(1).font = { bold: true };
    wsResumo.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };

    wsResumo.addRow({
      descricao: "Total de Serviços",
      valor: `R$ ${totalTarefas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
    wsResumo.addRow({
      descricao: "Total de Suportes",
      valor: `R$ ${totalSuportes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
    const rowGrandTotal = wsResumo.addRow({
      descricao: "TOTAL GERAL",
      valor: `R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
    rowGrandTotal.font = { bold: true };
    rowGrandTotal.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8E8E8" },
    };

    wsResumo.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  }

  return await workbook.xlsx.writeBuffer();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "pdf";
  const dataInicio = searchParams.get("dataInicio") || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
  const dataFim = searchParams.get("dataFim") || new Date().toISOString().split('T')[0];
  const incluirSuportes = searchParams.get("incluirSuportes") === "true";

  const tarefas = await prisma.tarefa.findMany({
    where: {
      data_inicio: {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      },
      valor_total_servico: {
        not: null,
      },
    },
    include: {
      cliente: {
        select: {
          nome: true,
          cnpj: true,
        },
      },
      tipoServico: {
        select: {
          nome: true,
          orgao: true,
        },
      },
    },
    orderBy: { id: "desc" },
    take: 200,
  });

  const suportes = incluirSuportes ? await prisma.suporte.findMany({
    where: {
      data_suporte: {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      },
      valor_total: {
        not: null,
      },
    },
    include: {
      cliente: {
        select: {
          nome: true,
          cnpj: true,
        },
      },
    },
    orderBy: { id: "desc" },
    take: 200,
  }) : [];

  if (format === "excel") {
    const buffer = await buildExcel(tarefas, suportes, dataInicio, dataFim, incluirSuportes);
    
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="relatorio-financeiro.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  }

  const html = buildHtml(tarefas, suportes, dataInicio, dataFim, incluirSuportes);

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
        "Content-Disposition": 'inline; filename="relatorio-financeiro.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}
