"use server"

import { prisma } from "@/auth"
import { revalidatePath } from "next/cache"
import { pusherServer } from "@/lib/pusher"

export async function createNotification(userId: string, title: string, message: string, link?: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        link
      }
    })

    // Disparar evento a través de Pusher al canal del usuario
    await pusherServer.trigger(`admin-${userId}`, 'new-notification', notification)

    return { success: true, data: notification }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: "No se pudo crear la notificación" }
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isRead: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: notifications }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return { success: false, error: "No se pudieron obtener las notificaciones" }
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })
    revalidatePath('/dashboard')
    return { success: true, data: notification }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "No se pudo marcar la notificación como leída" }
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId }
    })
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { success: false, error: "No se pudo borrar la notificación" }
  }
}
