"use server"

import { prisma } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getPatients() {
  try {
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { appointments: true, clinicalRecords: true }
        }
      }
    })
    return { success: true, data: patients }
  } catch (error) {
    console.error("Error fetching patients:", error)
    return { success: false, error: "Error al obtener pacientes." }
  }
}

export async function createPatient(data: { name: string, email: string, phone?: string }) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return { success: false, error: "El correo ya está registrado." }
    }

    const patient = await prisma.user.create({
      data: {
        ...data,
        role: 'PATIENT'
      }
    })
    revalidatePath('/dashboard/pacientes')
    return { success: true, data: patient }
  } catch (error) {
    console.error("Error creating patient:", error)
    return { success: false, error: "Error al crear paciente." }
  }
}

export async function getClinicalRecords(patientId: string) {
  try {
    const records = await prisma.clinicalRecord.findMany({
      where: { patientId },
      orderBy: { date: 'desc' }
    })
    return { success: true, data: records }
  } catch (error) {
    console.error("Error fetching records:", error)
    return { success: false, error: "Error al obtener expedientes." }
  }
}

export async function addClinicalRecord(data: { patientId: string, content: string }) {
  try {
    const record = await prisma.clinicalRecord.create({
      data: {
        patientId: data.patientId,
        content: data.content
      }
    })
    revalidatePath('/dashboard/pacientes')
    return { success: true, data: record }
  } catch (error) {
    console.error("Error adding record:", error)
    return { success: false, error: "Error al guardar nota clínica." }
  }
}

import bcrypt from "bcryptjs"

export async function setPatientPassword(patientId: string, passwordPlain: string) {
  try {
    const hashedPassword = await bcrypt.hash(passwordPlain, 10)
    await prisma.user.update({
      where: { id: patientId },
      data: { password: hashedPassword }
    })
    return { success: true }
  } catch (error) {
    console.error("Error setting password:", error)
    return { success: false, error: "Error al asignar contraseña." }
  }
}
