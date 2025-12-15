import type { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import prisma from "@/lib/prisma";

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
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório de Tarefas</title>
    <style>
      @page { size: A4 landscape; margin: 12mm; }
      body { font-family: Arial, sans-serif; color: #111; }
      h1 { text-align: center; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
      th { background: #f5f5f5; text-align: left; }
      .meta { color: #666; font-size: 12px; margin-bottom: 8px; }
    </style>
  </head>
  <body>
    <h1>Relatório de Tarefas</h1>
    <div class="meta">Total de registros: ${tarefas.length}</div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Tipo Serviço</th>
          <th>Status</th>
          <th>Observação</th>
          <th>Prazo Final</th>
        </tr>
      </thead>
      <tbody>
        ${tarefas
          .map(
            (t) => `
          <tr>
            <td>${t.id}</td>
            <td>${escapeHtml(t.cliente?.nome)}</td>
            <td>${escapeHtml(t.tipoServico?.nome)}</td>
            <td>${escapeHtml(t.status)}</td>
            <td>${escapeHtml(t.observacao)}</td>
            <td>${
              t.prazo_final
                ? new Date(t.prazo_final).toLocaleDateString("pt-BR")
                : "—"
            }</td>
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
  // 1) Obter filtros da URL
  const { searchParams } = new URL(req.url);
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
    observacao: t.observacoes // Corrigido: campo correto é 'observacoes' não 'observacao'
  }));
  const html = buildHtml(tarefasRelatorio);
  console.log("HTML gerado para PDF:", html);

  // 4) Iniciar Chromium
  const browser = await puppeteer.launch({ headless: true });
  try {
    // 5) Renderizar o HTML e gerar PDF
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdfUint8 = await page.pdf({
      format: "A4",
      landscape: true,
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
