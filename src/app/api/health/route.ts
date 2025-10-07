import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // simples ping
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ ok: true })
  } catch (e: unknown) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}