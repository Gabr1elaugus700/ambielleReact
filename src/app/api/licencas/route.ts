import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const clienteId = searchParams.get("clienteId")
  const data = await prisma.licenca.findMany({
    where: clienteId ? { cliente_id: Number(clienteId) } : undefined,
    include: { cliente: true },
    orderBy: { validade: "asc" },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const b = await req.json()
  const created = await prisma.licenca.create({
    data: {
      cliente_id: Number(b.cliente_id),
      nome: b.nome,
      validade: b.validade ? new Date(b.validade) : undefined,
      observacao: b.observacao ?? null,
    },
  })
  return NextResponse.json(created, { status: 201 })
}