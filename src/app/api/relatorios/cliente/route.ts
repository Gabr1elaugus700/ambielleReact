import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import prisma from "@/lib/prisma";
import { formatarCNPJ, formatarTelefone, formatarData } from "@/lib/formatters";
import ExcelJS from "exceljs";

// Garanta que essa rota rode no runtime Node.js (não Edge)
export const runtime = 'nodejs'

type ClienteComTarefas = {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  data_cadastro: Date | null;
  tarefas: {
    id: number;
    tipoServico: { nome: string };
    status: string;
    prazo_final: Date | null;
    data_inicio: Date | null;
  }[];
}

function escapeHtml(text?: string | null) {
  if (!text) return "—";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(clientes: ClienteComTarefas[], filtros: { dataInicial: string | null; dataFinal: string | null }) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório de Clientes</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: Arial, sans-serif; color: #111; background: #fff; }
      h1 { text-align: center; margin: 0 0 20px; color: #000; font-size: 20px; border-bottom: 3px solid #000; padding-bottom: 10px; }
      .meta { color: #666; font-size: 12px; margin-bottom: 20px; text-align: center; }
      
      .cliente-section { 
        background: white;
        border: 2px solid #333;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .cliente-header { 
        background: #e8e8e8;
        padding: 14px 16px;
        border-left: 4px solid #000;
        margin-bottom: 12px;
        border-radius: 2px;
      }
      
      .cliente-nome { 
        font-size: 18px;
        font-weight: bold;
        margin: 0 0 6px;
        color: #000;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .cliente-info { 
        font-size: 11px;
        margin: 3px 0;
        color: #333;
      }
      
      .tarefas-container {
        margin-top: 12px;
        padding-left: 8px;
      }
      
      .tarefas-title {
        font-size: 13px;
        font-weight: 600;
        color: #000;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 2px solid #333;
      }
      
      .tarefas-table { 
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }
      
      .tarefas-table th, .tarefas-table td { 
        border: 1px solid #999;
        padding: 8px 6px;
        font-size: 11px;
      }
      
      .tarefas-table th { 
        background: #d9d9d9;
        text-align: left;
        font-weight: 600;
        color: #000;
      }
      
      .tarefas-table tbody tr:nth-child(even) {
        background: #f5f5f5;
      }
      
      .no-tarefas { 
        color: #666;
        font-style: italic;
        font-size: 12px;
        padding: 12px;
        text-align: center;
        background: #f5f5f5;
        border: 1px dashed #999;
        border-radius: 4px;
        margin-top: 8px;
      }
      
      .separator {
        height: 2px;
        background: #ccc;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <h1>Relatório de Clientes</h1>
    <div class="meta">
      ${
        filtros.dataInicial || filtros.dataFinal
          ? `Período: ${
              filtros.dataInicial ? formatarData(filtros.dataInicial) : "início"
            } até ${
              filtros.dataFinal ? formatarData(filtros.dataFinal) : "hoje"
            }<br>`
          : ""
      }
      Total de clientes: ${clientes.length}
    </div>

    ${clientes.map((cliente, index) => `
      <div class="cliente-section">
        <div class="cliente-header">
          <h2 class="cliente-nome">${escapeHtml(cliente.nome)}</h2>
          <div class="cliente-info">CNPJ: ${escapeHtml(formatarCNPJ(cliente.cnpj))}</div>
          <div class="cliente-info">Tel: ${escapeHtml(formatarTelefone(cliente.telefone ?? ""))} | Email: ${escapeHtml(cliente.email)}</div>
          <div class="cliente-info">Data Cadastro: ${escapeHtml(formatarData(cliente.data_cadastro ? cliente.data_cadastro.toISOString() : null))}</div>
        </div>

        <div class="tarefas-container">
          ${cliente.tarefas && cliente.tarefas.length > 0 ? `
            <div class="tarefas-title">Tarefas Realizadas (${cliente.tarefas.length})</div>
            <table class="tarefas-table">
              <thead>
                <tr>
                  <th style="width: 50px;">ID</th>
                  <th>Tipo de Serviço</th>
                  <th style="width: 120px;">Status</th>
                  <th style="width: 100px;">Data Início</th>
                  <th style="width: 100px;">Prazo Final</th>
                </tr>
              </thead>
              <tbody>
                ${cliente.tarefas.map(tarefa => `
                  <tr>
                    <td style="text-align: center;">${tarefa.id}</td>
                    <td>${escapeHtml(tarefa.tipoServico?.nome)}</td>
                    <td>${escapeHtml(tarefa.status)}</td>
                    <td>${tarefa.data_inicio ? new Date(tarefa.data_inicio).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>${tarefa.prazo_final ? new Date(tarefa.prazo_final).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div class="tarefas-title">Tarefas Realizadas</div>
            <div class="no-tarefas">Nenhuma tarefa registrada para este cliente</div>
          `}
        </div>
      </div>
      ${index < clientes.length - 1 ? '<div class="separator"></div>' : ''}
    `).join('')}
  </body>
</html>`;
}

async function buildExcel(clientes: ClienteComTarefas[], filtros: { dataInicial: string | null; dataFinal: string | null }) {
  const workbook = new ExcelJS.Workbook();
  
  clientes.forEach((cliente) => {
    const wsName = cliente.nome.substring(0, 30).replace(/[\\/*?:\[\]]/g, ''); // Nome válido para worksheet
    const ws = workbook.addWorksheet(wsName);
    
    // Informações do cliente (cabeçalho)
    ws.mergeCells('A1:E1');
    const headerRow = ws.getRow(1);
    headerRow.getCell(1).value = cliente.nome.toUpperCase();
    headerRow.getCell(1).font = { bold: true, size: 14 };
    headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    headerRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8E8E8" },
    };
    headerRow.height = 25;

    // Linha 2: CNPJ
    ws.mergeCells('A2:E2');
    const cnpjRow = ws.getRow(2);
    cnpjRow.getCell(1).value = `CNPJ: ${formatarCNPJ(cliente.cnpj)}`;
    cnpjRow.getCell(1).font = { size: 11 };
    
    // Linha 3: Telefone e Email
    ws.mergeCells('A3:E3');
    const contatoRow = ws.getRow(3);
    contatoRow.getCell(1).value = `Tel: ${formatarTelefone(cliente.telefone ?? "")} | Email: ${cliente.email || "—"}`;
    contatoRow.getCell(1).font = { size: 11 };
    
    // Linha 4: Data Cadastro
    ws.mergeCells('A4:E4');
    const cadastroRow = ws.getRow(4);
    cadastroRow.getCell(1).value = `Data Cadastro: ${formatarData(cliente.data_cadastro ? cliente.data_cadastro.toISOString() : null)}`;
    cadastroRow.getCell(1).font = { size: 11 };
    
    // Linha 5: vazia
    ws.addRow([]);
    
    // Linha 6: Título das tarefas
    ws.mergeCells('A6:E6');
    const tarefasTitleRow = ws.getRow(6);
    tarefasTitleRow.getCell(1).value = `Tarefas Realizadas (${cliente.tarefas?.length || 0})`;
    tarefasTitleRow.getCell(1).font = { bold: true, size: 12 };
    tarefasTitleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };
    
    // Linha 7: Cabeçalho da tabela de tarefas
    ws.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Tipo de Serviço", key: "tipoServico", width: 35 },
      { header: "Status", key: "status", width: 20 },
      { header: "Data Início", key: "dataInicio", width: 15 },
      { header: "Prazo Final", key: "prazoFinal", width: 15 },
    ];

    const headerTableRow = ws.getRow(7);
    headerTableRow.values = ["ID", "Tipo de Serviço", "Status", "Data Início", "Prazo Final"];
    headerTableRow.font = { bold: true };
    headerTableRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };
    headerTableRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Adicionar tarefas
    if (cliente.tarefas && cliente.tarefas.length > 0) {
      cliente.tarefas.forEach((tarefa) => {
        const row = ws.addRow({
          id: tarefa.id,
          tipoServico: tarefa.tipoServico?.nome || "—",
          status: tarefa.status || "—",
          dataInicio: tarefa.data_inicio ? new Date(tarefa.data_inicio).toLocaleDateString('pt-BR') : "—",
          prazoFinal: tarefa.prazo_final ? new Date(tarefa.prazo_final).toLocaleDateString('pt-BR') : "—",
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
    } else {
      const row = ws.addRow({
        id: "",
        tipoServico: "Nenhuma tarefa registrada para este cliente",
        status: "",
        dataInicio: "",
        prazoFinal: "",
      });
      row.getCell(2).font = { italic: true, color: { argb: "FF999999" } };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  });

  return await workbook.xlsx.writeBuffer();
}

export async function GET(req: NextRequest) {
  // 1) Obter parâmetros de filtro da URL
  const searchParams = req.nextUrl.searchParams;
  const format = searchParams.get("format") || "pdf";
  const dataInicial = searchParams.get("dataInicial");
  const dataFinal = searchParams.get("dataFinal");

  // 2) Construir where clause do Prisma
  let where = {};
  if (dataInicial || dataFinal) {
    where = {
      data_cadastro: {
        ...(dataInicial && { gte: new Date(dataInicial) }),
        ...(dataFinal && { lte: new Date(dataFinal + "T23:59:59.999Z") }), // Inclui todo o dia final
      },
    };
  }

  // 3) Obter dados com filtros e incluir tarefas
  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { id: 'desc' },
    take: 200,
    include: {
      tarefas: {
        include: {
          tipoServico: {
            select: {
              nome: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      },
    },
  })

  if (format === "excel") {
    const buffer = await buildExcel(clientes, { dataInicial, dataFinal });
    
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="relatorio-clientes.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  }

  const html = buildHtml(clientes, { dataInicial, dataFinal })
  console.log('HTML gerado para PDF:', html)

  // 2) Iniciar Chromium compatível com Vercel
  const browser = await puppeteer.launch({ headless: true })

  try {
    // 3) Renderizar o HTML e gerar PDF
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    const pdfUint8 = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: false, // orientação vertical
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      preferCSSPageSize: true, // use se quiser respeitar @page size do CSS
    })

    // 4) Converter para Uint8Array (BodyInit compatível)
    const pdfBuffer = Buffer.from(pdfUint8)

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="relatorio-clientes.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}
