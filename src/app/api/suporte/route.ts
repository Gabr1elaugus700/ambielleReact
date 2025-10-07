import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const clienteId = searchParams.get("clienteId")
  const data = await prisma.suporte.findMany({
    where: clienteId ? { cliente_id: Number(clienteId) } : undefined,
    include: { cliente: true },
    orderBy: { data_suporte: "desc" },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const b = await req.json()
  const created = await prisma.suporte.create({
    data: {
      cliente_id: Number(b.cliente_id),
      descricao: b.descricao,
      valor_hora: b.valor_hora ?? undefined,
      data_suporte: b.data_suporte ? new Date(b.data_suporte) : undefined,
      hora_inicio: b.hora_inicio,
      hora_fim: b.hora_fim ? new Date(b.hora_fim) : null,
      tempo_suporte: b.tempo_suporte ?? null,
      valor_total: b.valor_total ?? null,
    },
  })
  return NextResponse.json(created, { status: 201 })
}