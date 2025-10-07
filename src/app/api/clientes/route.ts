import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(clientes);
}

export async function POST(req: Request) {  
  const body = await req.json()  
  const created = await prisma.cliente.create({ data: body })  
  return NextResponse.json(created, { status: 201 })  
}
