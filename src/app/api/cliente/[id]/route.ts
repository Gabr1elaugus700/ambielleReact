import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(request: Request, context: Params) {
  const { params } = await context;
  const { id } = params;
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(id) },
    include: { tarefas: true, suportes: true, relatorios: true, licencas: true },
  });
  if (!cliente) return NextResponse.json({ error: "Cliente not found" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(request: Request, context: Params) {
  const params = await context.params;
  const { id } = params;
  const body = await request.json();
  const updated = await prisma.cliente.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: Params) {
  const { params } = await context;
  const { id } = params;
  const deleted = await prisma.cliente.delete({
    where: { id: Number(id) },
  });
  return NextResponse.json(deleted);
}