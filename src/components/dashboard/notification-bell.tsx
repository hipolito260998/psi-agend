"use client"

import { useState, useEffect } from "react"
import Pusher from "pusher-js"
import { Bell, CheckCircle2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getUnreadNotifications, markAsRead, deleteNotification } from "@/actions/notifications"

import { useRouter } from "next/navigation"

type NotificationType = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Cargar notificaciones al iniciar
  useEffect(() => {
    async function fetchNotifs() {
      const res = await getUnreadNotifications(userId)
      if (res.success && res.data) {
        setNotifications(res.data as NotificationType[])
      }
    }
    fetchNotifs()
  }, [userId])

  // Suscribirse a WebSockets
  useEffect(() => {
    // Enable pusher logging for debug
    Pusher.logToConsole = true;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us3",
    })

    const channel = pusher.subscribe(`admin-${userId}`)
    
    channel.bind('new-notification', (data: NotificationType) => {
      // 1. Mostrar Toast
      toast.success(data.title, {
        description: data.message,
        duration: 8000,
      })
      
      // 2. Agregar a la campanita
      setNotifications(prev => [data, ...prev])

      // 3. Recargar los datos de la página (citas de hoy, pacientes, etc) en segundo plano
      router.refresh()
    })

    return () => {
      pusher.unsubscribe(`admin-${userId}`)
      pusher.disconnect()
    }
  }, [userId, router])

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await markAsRead(id)
  }

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await deleteNotification(id)
  }

  const unreadCount = notifications.length

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-amber-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 sm:left-full sm:-ml-12 mt-3 w-80 sm:w-96 bg-white rounded-[2rem] shadow-xl border-4 border-amber-50 z-50 overflow-hidden">
            <div className="p-4 bg-amber-50 border-b-2 border-amber-100 flex items-center justify-between">
              <h3 className="font-black text-amber-900 text-lg">Notificaciones</h3>
              <span className="text-sm font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded-full">{unreadCount} nuevas</span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-amber-200 mx-auto mb-2" />
                  <p className="text-amber-800/60 font-bold">No tienes notificaciones nuevas</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:bg-zinc-50 transition-colors group">
                    <p className="font-bold text-zinc-900 text-sm mb-1">{n.title}</p>
                    <p className="text-zinc-600 text-xs mb-3">{n.message}</p>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAsRead(n.id)}
                        className="flex-1 h-8 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 font-bold text-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Marcar leída
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(n.id)}
                        className="h-8 w-8 p-0 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
