import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const tarefaId = Number(params.id)
  const data = await prisma.etapa.findMany({
    where: { tarefa_id: tarefaId },
    orderBy: { id: "asc" },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: Params) {
  const tarefaId = Number(params.id)
  const body = await req.json()
  const created = await prisma.etapa.create({
    data: {
      tarefa_id: tarefaId,
      nome_etapa: body.nome_etapa,
      data_etapa: body.data_etapa ? new Date(body.data_etapa) : undefined,
      status_etapa: Boolean(body.status_etapa),
      observacoes_etapa: body.observacoes_etapa ?? null,
    },
  })
  return NextResponse.json(created, { status: 201 })
}