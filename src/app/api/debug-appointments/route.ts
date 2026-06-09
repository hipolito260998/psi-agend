import { NextResponse } from "next/server"
import { prisma } from "@/auth"

export async function GET() {
  const appointments = await prisma.appointment.findMany()
  return NextResponse.json(appointments)
}
