import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const data = await prisma.tipoServico.findMany({ orderBy: { nome: "asc" } })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const created = await prisma.tipoServico.create({ data: body })
  return NextResponse.json(created, { status: 201 })
}