import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const data = await prisma.servico.findMany({
    include: { tipoServico: true },
    orderBy: { id: "desc" },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const created = await prisma.servico.create({ data: body })
  return NextResponse.json(created, { status: 201 })
}