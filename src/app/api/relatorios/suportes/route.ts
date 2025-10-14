import type { NextRequest } from 'next/server'
import puppeteer from 'puppeteer'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

// Tipos para os filtros
type DateFilter = {
  gte?: Date
  lte?: Date
}

type SuporteFilter = {
  data_suporte?: DateFilter
  cliente_id?: number
}

// Tipo para o relatório de suporte
type SuporteRelatorio = {
  id: number
  cliente: string
  descricao: string
  valor_total: number
  valor_hora: number | null
  data_suporte: string
  hora_inicio: string
  hora_fim: string | null
  tempo_suporte: number | null
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


function buildHtml(dados: SuporteRelatorio[], total: number) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório de Suportes</title>
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
    <h1>Relatório de Suportes</h1>
    <div class="meta">Total de registros: ${dados.length}</div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Descrição</th>
          <th>Valor Total (R$)</th>
          <th>Valor/Hora (R$)</th>
          <th>Data</th>
          <th>Hora Início</th>
          <th>Hora Fim</th>
          <th>Tempo Total</th>
        </tr>
      </thead>
      <tbody>
        ${dados.map(d => `
          <tr>
            <td>${d.id}</td>
            <td>${escapeHtml(d.cliente)}</td>
            <td>${escapeHtml(d.descricao)}</td>
            <td>${d.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>${d.valor_hora ? d.valor_hora.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}</td>
            <td>${d.data_suporte}</td>
            <td>${d.hora_inicio}</td>
            <td>${d.hora_fim ?? '—'}</td>
            <td>${d.tempo_suporte ? d.tempo_suporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + 'h' : '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="total">Valor Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
  </body>
</html>`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dataInicio = searchParams.get('dataInicio')
  const dataFim = searchParams.get('dataFim')
  const clienteId = searchParams.get('clienteId')
  // Construir filtro
  const where: SuporteFilter = {}
  
  // Filtro de data
  if (dataInicio || dataFim) {
    where.data_suporte = {}
    if (dataInicio) where.data_suporte.gte = new Date(dataInicio)
    if (dataFim) where.data_suporte.lte = new Date(dataFim)
  }

  // Filtro de cliente
  if (clienteId) {
    where.cliente_id = parseInt(clienteId)
  }

  // Buscar suportes
  const suportes = await prisma.suporte.findMany({
    where,
    include: { cliente: true },
    orderBy: [{ data_suporte: 'desc' }, { id: 'desc' }],
    take: 200,
  })

  // Formatar dados para o relatório
  const dados: SuporteRelatorio[] = suportes.map(s => ({
    id: s.id,
    cliente: s.cliente?.nome ?? '—',
    descricao: s.descricao ?? '—',
    valor_total: Number(s.valor_total ?? 0),
    valor_hora: s.valor_hora ? Number(s.valor_hora) : null,
    data_suporte: s.data_suporte
      ? new Date(s.data_suporte).toLocaleDateString('pt-BR')
      : '—',
    hora_inicio: s.hora_inicio
      ? new Date(s.hora_inicio).toLocaleTimeString('pt-BR')
      : '—',
    hora_fim: s.hora_fim
      ? new Date(s.hora_fim).toLocaleTimeString('pt-BR')
      : null,
    tempo_suporte: s.tempo_suporte ? Number(s.tempo_suporte) : null,
  }))

  const total = dados.reduce((acc, curr) => acc + curr.valor_total, 0)

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
        'Content-Disposition': 'inline; filename="relatorio-suportes.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } finally {
    await browser.close()
  }
}
