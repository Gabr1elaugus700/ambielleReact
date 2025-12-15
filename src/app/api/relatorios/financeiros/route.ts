import type { NextRequest } from 'next/server'
import puppeteer from 'puppeteer'
import prisma from '@/lib/prisma'
export const runtime = 'nodejs'

// Tipos para os filtros do Prisma
type DateFilter = {
  gte?: Date
  lte?: Date
}

type TarefaFilter = {
  prazo_final?: DateFilter
}

type SuporteFilter = {
  data_suporte?: DateFilter
}

// Tipos para o relatório financeiro
type FinanceiroRelatorio = {
  tipo: 'Tarefa' | 'Suporte'
  id: number
  cliente: string
  descricao?: string
  valor: number
  data: string
  valor_hora?: number | null
  prazo_final?: Date | null
  
}

function escapeHtml(text?: string | null) {
  if (!text) return '—'
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildHtml(dados: FinanceiroRelatorio[], total: number) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório Financeiro</title>
    <style>
      @page { size: A4 landscape; margin: 12mm; }
      body { font-family: Arial, sans-serif; color: #111; }
      h1 { text-align: center; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
      th { background: #f5f5f5; text-align: left; }
      .meta { color: #666; font-size: 12px; margin-bottom: 8px; }
      .total { font-weight: bold; font-size: 14px; margin-top: 16px; }
    </style>
  </head>
  <body>
    <h1>Relatório Financeiro</h1>
    <div class="meta">Total de registros: ${dados.length}</div>
    <table>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>ID</th>
          <th>Cliente</th>
          <th>Descrição</th>
          <th>Valor (R$)</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${dados.map(d => `
          <tr>
            <td>${d.tipo}</td>
            <td>${d.id}</td>
            <td>${escapeHtml(d.cliente)}</td>
            <td>${escapeHtml(d.descricao)}</td>
            <td>${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>${d.data}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="total">Total Geral: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
  </body>
</html>`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') // 'tarefas', 'suportes' ou 'todos'
  const dataInicio = searchParams.get('dataInicio')
  const dataFim = searchParams.get('dataFim')

  // Busca tarefas
  let tarefas: FinanceiroRelatorio[] = []
  if (tipo === 'tarefas' || tipo === 'todos' || !tipo) {
    const tarefaWhere: TarefaFilter = {};
    if (dataInicio || dataFim) {
      tarefaWhere.prazo_final = {};
      if (dataInicio) tarefaWhere.prazo_final.gte = new Date(dataInicio);
      if (dataFim) tarefaWhere.prazo_final.lte = new Date(dataFim);
    }
    const tarefasDb = await prisma.tarefa.findMany({
      where: tarefaWhere,
      include: { cliente: true },
      orderBy: { id: 'desc' },
      take: 200,
    })
    tarefas = tarefasDb.map(t => ({
      tipo: 'Tarefa',
      id: t.id,
      cliente: t.cliente?.nome ?? '—',
      descricao: typeof t.tipo_servico === 'number' ? String(t.tipo_servico) : (t.tipo_servico ?? '—'),
      valor: Number(t.valor_total_servico ?? 0),
      data: t.prazo_final
        ? new Date(t.prazo_final).toLocaleDateString('pt-BR')
        : '—',
    }))
  }

  // Busca suportes
  let suportes: FinanceiroRelatorio[] = []
  if (tipo === 'suportes' || tipo === 'todos' || !tipo) {
    const suporteWhere: SuporteFilter = {};
    if (dataInicio || dataFim) {
      suporteWhere.data_suporte = {};
      if (dataInicio) suporteWhere.data_suporte.gte = new Date(dataInicio);
      if (dataFim) suporteWhere.data_suporte.lte = new Date(dataFim);
    }
    const suportesDb = await prisma.suporte.findMany({
      where: suporteWhere,
      include: { cliente: true },
      orderBy: { id: 'desc' },
      take: 200,
    })
    suportes = suportesDb.map(s => ({
      tipo: 'Suporte',
      id: s.id,
      cliente: s.cliente?.nome ?? '—',
      descricao: s.descricao ?? '—',
      valor: Number(s.valor_total ?? s.valor_hora ?? 0),
      data: s.data_suporte
        ? new Date(s.data_suporte).toLocaleDateString('pt-BR')
        : '—',
    }))
  }

  // Junta os dados conforme filtro
  const dados = [...tarefas, ...suportes]
  const total = dados.reduce((acc, curr) => acc + curr.valor, 0)

  const html = buildHtml(dados, total)

  const browser = await puppeteer.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      preferCSSPageSize: true,
    })
    const pdfBuffer = Buffer.from(pdfUint8)
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="relatorio-financeiro.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } finally {
    await browser.close()
  }
}