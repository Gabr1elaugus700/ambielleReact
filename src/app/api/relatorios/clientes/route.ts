import type { NextRequest } from 'next/server'
import puppeteer from 'puppeteer'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

type ClienteComTarefas = {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  tarefas: {
    id: number;
    tipoServico: { nome: string };
    status: string;
    prazo_final: Date | null;
    data_inicio: Date | null;
  }[];
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

function buildHtml(clientes: ClienteComTarefas[]) {
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
    <div class="meta">Total de clientes: ${clientes.length}</div>
    
    ${clientes.map((cliente, index) => `
      <div class="cliente-section">
        <div class="cliente-header">
          <h2 class="cliente-nome">${escapeHtml(cliente.nome)}</h2>
          <div class="cliente-info">CNPJ: ${escapeHtml(cliente.cnpj)}</div>
          <div class="cliente-info">Tel: ${escapeHtml(cliente.telefone)} | Email: ${escapeHtml(cliente.email)}</div>
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
</html>`
}

export async function GET(req: NextRequest) {
  const clientes = await prisma.cliente.findMany({
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

  const html = buildHtml(clientes)

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
        'Content-Disposition': 'inline; filename="relatorio-clientes.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } finally {
    await browser.close()
  }
}
