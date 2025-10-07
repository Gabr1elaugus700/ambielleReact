import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type Status = "Iniciado" | "Coleta_De_Informações" | "Execucao" | "Aprovação_Cliente" | "Concluído" | "Encerrado" | "Protocolado"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") ?? undefined

  const tarefas = await prisma.tarefa.findMany({
    where: { status: status as Status | undefined },
    include: {
      cliente: true,
      tipoServico: true,
    },
    orderBy: { id: "desc" },
    take: 100,
  })
  return NextResponse.json(tarefas)
}

export async function POST(req: Request) {
  const body = await req.json()
  // Valide body aqui (Zod recomendado)
  const created = await prisma.tarefa.create({
    data: {
      tipo_servico: body.tipo_servico, // id
      cliente_id: body.cliente_id,     // id
      status: body.status,             // enum
      data_inicio: body.data_inicio ? new Date(body.data_inicio) : undefined,
      prazo_final: body.prazo_final ? new Date(body.prazo_final) : undefined,
      observacoes: body.observacoes ?? null,
      valor_total_servico: body.valor_total_servico ?? null,
    },
  })
  return NextResponse.json(created, { status: 201 })
}