import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";

// Garanta que essa rota rode no runtime Node.js (não Edge)
export const runtime = "nodejs";

export type TarefaStatus =
  | "Iniciado"
  | "Coleta_de_Informações"
  | "Execucao"
  | "Aprovação_Cliente"
  | "Concluído"
  | "Encerrado"
  | "Protocolado";

// Função para formatar o status para exibição
function formatarStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

// Exemplo de dados (substitua por busca no banco/Prisma se quiser)
type TarefaRelatorio = {
  id: number;
  cliente: { nome: string };
  tipoServico: { nome: string };
  status: string;
  prazo_final: Date | null;
  observacao: string | null;
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

function buildHtml(tarefas: TarefaRelatorio[]) {
  // Lista de todos os status possíveis
  const todosStatus: TarefaStatus[] = [
    "Iniciado",
    "Coleta_de_Informações",
    "Execucao",
    "Aprovação_Cliente",
    "Protocolado",
    "Concluído",
    "Encerrado"
  ];

  // Agrupar tarefas por status
  const tarefasPorStatus = new Map<string, TarefaRelatorio[]>();
  
  todosStatus.forEach(status => {
    tarefasPorStatus.set(status, []);
  });

  tarefas.forEach(tarefa => {
    const statusOriginal = tarefa.status.replace(/ /g, '_');
    if (tarefasPorStatus.has(statusOriginal)) {
      tarefasPorStatus.get(statusOriginal)!.push(tarefa);
    }
  });

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório de Tarefas por Status</title>
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      body { font-family: Arial, sans-serif; color: #111; background: #fff; }
      h1 { text-align: center; margin: 0 0 20px; color: #000; font-size: 20px; border-bottom: 3px solid #000; padding-bottom: 10px; }
      .meta { color: #666; font-size: 12px; margin-bottom: 20px; text-align: center; }
      
      .status-section { 
        background: white;
        border: 2px solid #333;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .status-header { 
        background: #e8e8e8;
        padding: 14px 16px;
        border-left: 4px solid #000;
        margin-bottom: 12px;
        border-radius: 2px;
      }
      
      .status-nome { 
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        color: #000;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .status-count {
        font-size: 11px;
        color: #666;
        margin-top: 4px;
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
      
      .text-center { text-align: center; }
    </style>
  </head>
  <body>
    <h1>Relatório de Tarefas por Status</h1>
    <div class="meta">Total de tarefas: ${tarefas.length}</div>

    ${todosStatus.map(status => {
      const tarefasDoStatus = tarefasPorStatus.get(status) || [];
      const statusFormatado = formatarStatus(status);
      
      return `
      <div class="status-section">
        <div class="status-header">
          <div class="status-nome">${statusFormatado}</div>
          <div class="status-count">${tarefasDoStatus.length} tarefa(s)</div>
        </div>
        
        ${tarefasDoStatus.length > 0 ? `
          <table class="tarefas-table">
            <thead>
              <tr>
                <th style="width: 50px;">ID</th>
                <th style="width: 180px;">Cliente</th>
                <th>Tipo de Serviço</th>
                <th style="width: 90px;">Prazo Final</th>
                <th style="width: 200px;">Observações</th>
              </tr>
            </thead>
            <tbody>
              ${tarefasDoStatus.map(t => `
                <tr>
                  <td class="text-center">${t.id}</td>
                  <td>${escapeHtml(t.cliente?.nome)}</td>
                  <td>${escapeHtml(t.tipoServico?.nome)}</td>
                  <td>${t.prazo_final ? new Date(t.prazo_final).toLocaleDateString("pt-BR") : "—"}</td>
                  <td>${escapeHtml(t.observacao)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div class="no-tarefas">
            Nenhuma tarefa encontrada neste status
          </div>
        `}
      </div>
      `;
    }).join('')}
  </body>
</html>`;
}

async function buildExcel(tarefas: TarefaRelatorio[]) {
  const workbook = new ExcelJS.Workbook();
  
  // Lista de todos os status possíveis
  const todosStatus: TarefaStatus[] = [
    "Iniciado",
    "Coleta_de_Informações",
    "Execucao",
    "Aprovação_Cliente",
    "Protocolado",
    "Concluído",
    "Encerrado"
  ];

  // Agrupar tarefas por status
  const tarefasPorStatus = new Map<string, TarefaRelatorio[]>();
  
  todosStatus.forEach(status => {
    tarefasPorStatus.set(status, []);
  });

  tarefas.forEach(tarefa => {
    const statusOriginal = tarefa.status.replace(/ /g, '_');
    if (tarefasPorStatus.has(statusOriginal)) {
      tarefasPorStatus.get(statusOriginal)!.push(tarefa);
    }
  });

  // Criar uma aba para cada status
  todosStatus.forEach(status => {
    const statusFormatado = formatarStatus(status);
    const tarefasDoStatus = tarefasPorStatus.get(status) || [];
    
    const worksheet = workbook.addWorksheet(statusFormatado);
    
    // Cabeçalhos
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Tipo de Serviço', key: 'tipoServico', width: 30 },
      { header: 'Prazo Final', key: 'prazoFinal', width: 15 },
      { header: 'Observações', key: 'observacoes', width: 40 },
    ];
    
    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }
    };
    
    // Adicionar dados
    tarefasDoStatus.forEach(tarefa => {
      worksheet.addRow({
        id: tarefa.id,
        cliente: tarefa.cliente?.nome || '—',
        tipoServico: tarefa.tipoServico?.nome || '—',
        prazoFinal: tarefa.prazo_final ? new Date(tarefa.prazo_final).toLocaleDateString('pt-BR') : '—',
        observacoes: tarefa.observacao || '—'
      });
    });
    
    // Se não houver tarefas, adicionar linha informativa
    if (tarefasDoStatus.length === 0) {
      worksheet.addRow({
        id: '',
        cliente: 'Nenhuma tarefa encontrada neste status',
        tipoServico: '',
        prazoFinal: '',
        observacoes: ''
      });
      worksheet.getRow(2).font = { italic: true, color: { argb: 'FF666666' } };
    }
    
    // Bordas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  });
  
  return await workbook.xlsx.writeBuffer();
}

export async function GET(req: NextRequest) {
  // 1) Obter filtros da URL
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "pdf";
  const status = searchParams.get("status") ?? undefined;
  const dataInicial = searchParams.get("dataInicial") ?? undefined;
  const dataFinal = searchParams.get("dataFinal") ?? undefined;
  const clienteId = searchParams.get("cliente_id")
    ? Number(searchParams.get("cliente_id"))
    : undefined;

  // 2) Montar filtro Prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status && status !== 'todos') {
    where.status = status;
  }
  if (clienteId) {
    where.cliente_id = clienteId;
  }
  if (dataInicial || dataFinal) {
    where.data_inicio = {
      ...(dataInicial && { gte: new Date(dataInicial) }),
      ...(dataFinal && { lte: new Date(dataFinal + 'T23:59:59.999Z') })
    };
  }

  // 3) Buscar tarefas
  const tarefas = await prisma.tarefa.findMany({
    where,
    include: {
      cliente: true,
      tipoServico: true,
    },
    orderBy: { id: "desc" },
    take: 200,
  });

  // Mapeia para o tipo TarefaRelatorio
  const tarefasRelatorio: TarefaRelatorio[] = tarefas.map((t) => ({
    id: t.id,
    cliente: { nome: t.cliente.nome },
    tipoServico: { nome: t.tipoServico.nome },
    status: formatarStatus(t.status),
    prazo_final: t.prazo_final,
    observacao: t.observacoes
  }));

  // Verificar formato e gerar apropriadamente
  if (format === "excel") {
    const excelBuffer = await buildExcel(tarefasRelatorio);
    
    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="relatorio-tarefas.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  }

  // Formato PDF (padrão)
  const html = buildHtml(tarefasRelatorio);

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdfUint8 = await page.pdf({
      format: "A4",
      landscape: false,
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });
    const pdfBuffer = Buffer.from(pdfUint8);
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="relatorio-tarefas.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}
