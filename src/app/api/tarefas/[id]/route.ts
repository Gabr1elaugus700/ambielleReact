import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const id = Number(params.id)
  const tarefa = await prisma.tarefa.findUnique({
    where: { id },
    include: { cliente: true, tipoServico: true, historico_status: true, etapas: true },
  })
  if (!tarefa) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(tarefa)
}

export async function PUT(req: Request, { params }: Params) {
  const id = Number(params.id)
  const data = await req.json()
  const updated = await prisma.tarefa.update({
    where: { id },
    data: {
      status: data.status,
      observacoes: data.observacoes ?? undefined,
      prazo_final: data.prazo_final ? new Date(data.prazo_final) : undefined,
      valor_total_servico: data.valor_total_servico ?? undefined,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: Params) {
  const id = Number(params.id)
  await prisma.tarefa.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}