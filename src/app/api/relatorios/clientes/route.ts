import type { NextRequest } from 'next/server'
import puppeteer from 'puppeteer'
import prisma from '@/lib/prisma'
import { formatarCNPJ, formatarTelefone, formatarData  } from "@/lib/formatters";


// Garanta que essa rota rode no runtime Node.js (não Edge)
export const runtime = 'nodejs'

// Exemplo de dados (substitua por busca no banco/Prisma se quiser)
type Cliente = { nome: string; cnpj: string; telefone: string | null; email: string | null, data_cadastro: Date | null }

function escapeHtml(text?: string | null) {
  if (!text) return '—'
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildHtml(clientes: Cliente[], filtros: { dataInicial: string | null, dataFinal: string | null }) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatório</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: Arial, sans-serif; color: #111; }
      h1 { text-align: center; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
      th { background: #f5f5f5; text-align: left; }
      .meta { color: #666; font-size: 12px; margin-bottom: 8px; }
    </style>
  </head>
  <body>
    <h1>Relatório de Clientes</h1>
    <div class="meta">
      ${filtros.dataInicial || filtros.dataFinal ? 
        `Período: ${filtros.dataInicial ? formatarData(filtros.dataInicial) : 'início'} até ${filtros.dataFinal ? formatarData(filtros.dataFinal) : 'hoje'}<br>` 
        : ''}
      Total de registros: ${clientes.length}
    </div>
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>CNPJ</th>
          <th>Telefone</th>
          <th>Email</th>
          <th>Data Cadastro</th>
        </tr>
      </thead>
      <tbody>
        ${clientes.map(c => `
          <tr>
            <td>${escapeHtml(c.nome)}</td>
            <td>${escapeHtml(formatarCNPJ(c.cnpj))}</td>
            <td>${escapeHtml(formatarTelefone(c.telefone ?? ""))}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(formatarData(c.data_cadastro ? c.data_cadastro.toISOString() : null))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </body>
</html>`
}

export async function GET(req: NextRequest) {
  // 1) Obter parâmetros de filtro da URL
  const searchParams = req.nextUrl.searchParams;
  const dataInicial = searchParams.get('dataInicial');
  const dataFinal = searchParams.get('dataFinal');

  // 2) Construir where clause do Prisma
  let where = {};
  if (dataInicial || dataFinal) {
    where = {
      data_cadastro: {
        ...(dataInicial && { gte: new Date(dataInicial) }),
        ...(dataFinal && { lte: new Date(dataFinal + 'T23:59:59.999Z') }) // Inclui todo o dia final
      }
    };
  }

  // 3) Obter dados com filtros
  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { id: 'desc' },
    take: 200,
  })

    const html = buildHtml(clientes, { dataInicial, dataFinal })
    console.log('HTML gerado para PDF:', html)

  // 2) Iniciar Chromium compatível com Vercel
    const browser = await puppeteer.launch({ headless: true })

  try {
    // 3) Renderizar o HTML e gerar PDF
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: true, // orientação horizontal
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      preferCSSPageSize: true, // use se quiser respeitar @page size do CSS
    })

    // 4) Converter para Uint8Array (BodyInit compatível)
    const pdfBuffer = Buffer.from(pdfUint8)

    // 5) Retornar o PDF
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="relatorio-clientes.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } finally {
    await browser.close()
  }
}