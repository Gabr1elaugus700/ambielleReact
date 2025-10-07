import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const item = await prisma.licenca.findUnique({ where: { id: Number(params.id) }, include: { cliente: true } })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: Params) {
  const b = await req.json()
  const updated = await prisma.licenca.update({
    where: { id: Number(params.id) },
    data: {
      nome: b.nome ?? undefined,
      validade: b.validade ? new Date(b.validade) : undefined,
      observacao: b.observacao ?? undefined,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.licenca.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}