"use server"

import { prisma } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getAvailabilities() {
  try {
    const availabilities = await prisma.availability.findMany({
      orderBy: {
        dayOfWeek: 'asc',
      },
    })
    return { success: true, data: availabilities }
  } catch (error) {
    console.error("Error fetching availabilities:", error)
    return { success: false, error: "Error al obtener disponibilidad." }
  }
}

export async function saveAvailability(data: { dayOfWeek: number, startTime: string, endTime: string }) {
  try {
    // Basic validation
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) throw new Error("Día inválido")
    
    // In a real app we might want to prevent overlapping, but for now we just create
    const availability = await prisma.availability.create({
      data,
    })
    
    revalidatePath('/dashboard/disponibilidad')
    return { success: true, data: availability }
  } catch (error) {
    console.error("Error saving availability:", error)
    return { success: false, error: "Error al guardar disponibilidad." }
  }
}

export async function deleteAvailability(id: string) {
  try {
    await prisma.availability.delete({
      where: { id },
    })
    revalidatePath('/dashboard/disponibilidad')
    return { success: true }
  } catch (error) {
    console.error("Error deleting availability:", error)
    return { success: false, error: "Error al eliminar disponibilidad." }
  }
}
