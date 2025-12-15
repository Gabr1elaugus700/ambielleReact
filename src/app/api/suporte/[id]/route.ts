import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const item = await prisma.suporte.findUnique({
    where: { id: Number(params.id) },
  })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: Params) {
  const updated = await prisma.suporte.update({
    where: { id: Number(params.id) },
    data: await req.json(),
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.suporte.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}