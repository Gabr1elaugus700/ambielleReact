import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const tarefaId = Number(params.id)
  const data = await prisma.historicoStatusTarefa.findMany({
    where: { tarefa_id: tarefaId },
    orderBy: { data_mudanca: "desc" },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: Params) {
  const tarefaId = Number(params.id)
  const body = await req.json()
  const created = await prisma.historicoStatusTarefa.create({
    data: {
      tarefa_id: tarefaId,
      status: body.status,
      data_mudanca: body.data_mudanca ? new Date(body.data_mudanca) : undefined,
    },
  })
  return NextResponse.json(created, { status: 201 })
}