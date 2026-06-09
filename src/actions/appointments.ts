"use server"

import { prisma } from "@/auth"
import { revalidatePath } from "next/cache"
import { AppointmentStatus } from "@prisma/client"
import { createNotification } from "@/actions/notifications"

function normalizeDate(d: Date) {
  // Ignora la zona horaria y fuerza la medianoche en UTC para coincidir con @db.Date de Postgres
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

/**
 * Calculates 1-hour available slots for a given date.
 */
export async function getAvailableSlots(date: Date) {
  try {
    const dayOfWeek = date.getDay()
    
    // 1. Get availability configurations for this day of week
    const availabilities = await prisma.availability.findMany({
      where: { dayOfWeek }
    })
    
    if (availabilities.length === 0) return { success: true, data: [] }
    
    const normalized = normalizeDate(date)
    
    // 2. Get existing appointments for this exact date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date: normalized,
        status: {
          not: 'CANCELLED' // Cancelled appointments free up the slot
        }
      }
    })
    
    const bookedTimes = new Set(existingAppointments.map(app => app.startTime))
    
    // 3. Generate 1-hour blocks from availability
    const slots: string[] = []
    
    // Validar horas pasadas si la cita es para hoy
    const now = new Date()
    const todayNormalized = normalizeDate(now)
    const isToday = normalized.getTime() === todayNormalized.getTime()
    const isPastDate = normalized.getTime() < todayNormalized.getTime()

    // Si la fecha solicitada ya pasó por completo, no hay citas
    if (isPastDate) return { success: true, data: [] }

    const currentHour = now.getHours()
    
    for (const av of availabilities) {
      const startHour = parseInt(av.startTime.split(':')[0], 10)
      const endHour = parseInt(av.endTime.split(':')[0], 10)
      
      for (let h = startHour; h < endHour; h++) {
        // Si es el mismo día, ocultar las horas que ya pasaron o que están en curso
        if (isToday && h <= currentHour) {
          continue
        }

        const timeStr = `${h.toString().padStart(2, '0')}:00`
        if (!bookedTimes.has(timeStr)) {
          slots.push(timeStr)
        }
      }
    }
    
    // Sort slots chronologically
    slots.sort()
    
    return { success: true, data: slots }
  } catch (error) {
    console.error("Error calculating slots:", error)
    return { success: false, error: "Error al calcular horarios." }
  }
}

export async function createAppointment(data: { 
  date: Date, 
  startTime: string, 
  patientId: string, 
  notes?: string 
}) {
  try {
    // End time is assumed to be 1 hour later
    const startHour = parseInt(data.startTime.split(':')[0], 10)
    const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`
    const normalized = normalizeDate(data.date)
    
    const appointment = await prisma.appointment.create({
      data: {
        date: normalized,
        startTime: data.startTime,
        endTime,
        patientId: data.patientId,
        notes: data.notes
      }
    })
    
    revalidatePath('/dashboard/citas')
    return { success: true, data: appointment }
  } catch (error) {
    console.error("Error creating appointment:", error)
    return { success: false, error: "Error al agendar cita." }
  }
}

export async function getAppointments(date: Date) {
  try {
    const normalized = normalizeDate(date)
    
    const appointments = await prisma.appointment.findMany({
      where: {
        date: normalized
      },
      include: {
        patient: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    return { success: true, data: appointments }
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return { success: false, error: "Error al obtener citas." }
  }
}

export async function getActiveAppointmentDates() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: { not: 'CANCELLED' }
      },
      select: {
        date: true
      }
    })
    
    // Obtener array de fechas únicas en formato string ISO
    const uniqueDates = Array.from(new Set(appointments.map(a => a.date.toISOString())))
    
    return { success: true, data: uniqueDates }
  } catch (error) {
    console.error("Error fetching appointment dates:", error)
    return { success: false, error: "Error al obtener fechas." }
  }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/dashboard/citas')
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating appointment status:", error)
    return { success: false, error: "Error al actualizar cita." }
  }
}

export async function createPublicAppointment(data: {
  date: Date
  startTime: string
  parentName: string
  email: string
  phone: string
}) {
  try {
    // Check if patient exists
    let patient = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    // If not, create patient
    if (!patient) {
      patient = await prisma.user.create({
        data: {
          name: data.parentName,
          email: data.email,
          phone: data.phone,
          role: 'PATIENT'
        }
      })
    }
    
    // Create appointment
    const startHour = parseInt(data.startTime.split(':')[0], 10)
    const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`
    const normalized = normalizeDate(data.date)
    
    const appointment = await prisma.appointment.create({
      data: {
        date: normalized,
        startTime: data.startTime,
        endTime,
        patientId: patient.id
      }
    })
    
    // Notificar a todos los usuarios (para garantizar que llegue al admin)
    const admins = await prisma.user.findMany()
    for (const admin of admins) {
      await createNotification(
        admin.id, 
        "¡Nueva Cita Programada! 🎉", 
        `${patient.name} acaba de agendar una cita por la web para el ${normalized.toLocaleDateString('es-ES', { timeZone:'UTC', month:'short', day:'numeric'})} a las ${data.startTime}.`
      )
    }
    
    revalidatePath('/dashboard/citas')
    revalidatePath('/dashboard/pacientes')
    
    return { success: true, data: appointment }
  } catch (error) {
    console.error("Error in public appointment creation:", error)
    return { success: false, error: "Error al registrar la cita." }
  }
}

export async function createPrivateAppointment(data: {
  date: Date
  startTime: string
  patientId: string
}) {
  try {
    const startHour = parseInt(data.startTime.split(':')[0], 10)
    const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`
    const normalized = normalizeDate(data.date)
    
    const appointment = await prisma.appointment.create({
      data: {
        date: normalized,
        startTime: data.startTime,
        endTime,
        patientId: data.patientId
      },
      include: { patient: true }
    })
    
    // Notificar a todos los usuarios (para garantizar que llegue al admin)
    const admins = await prisma.user.findMany()
    for (const admin of admins) {
      await createNotification(
        admin.id, 
        "Cita Agendada desde Portal 📲", 
        `El padre de ${appointment.patient.name} acaba de agendar una nueva sesión para el ${normalized.toLocaleDateString('es-ES', { timeZone:'UTC', month:'short', day:'numeric'})} a las ${data.startTime}.`
      )
    }
    
    revalidatePath('/dashboard/citas')
    revalidatePath('/portal')
    revalidatePath('/portal/agendar')
    
    return { success: true, data: appointment }
  } catch (error) {
    console.error("Error in private appointment creation:", error)
    return { success: false, error: "Error al agendar la sesión." }
  }
}
