"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { getAppointments, updateAppointmentStatus } from "@/actions/appointments"
import { Loader2, CheckCircle2, Clock, XCircle, Info } from "lucide-react"

type Appointment = {
  id: string
  date: Date
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes: string | null
  patient: {
    name: string | null
    email: string
  }
}

export function AppointmentsView() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAppointments() {
      if (!date) return
      setLoading(true)
      const res = await getAppointments(date)
      if (res.success && res.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAppointments(res.data as any)
      }
      setLoading(false)
    }
    fetchAppointments()
  }, [date])

  const handleUpdateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    setUpdating(id)
    const res = await updateAppointmentStatus(id, status)
    if (res.success) {
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))
    }
    setUpdating(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Calendario */}
      <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border-2 border-amber-100 shadow-sm flex flex-col items-center">
        <h2 className="text-xl font-black text-amber-900 mb-6 w-full text-left">Selecciona un día</h2>
        <div className="bg-amber-50 p-4 rounded-[2rem] border-2 border-amber-100">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-[1.5rem]"
          />
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="lg:col-span-2 bg-white rounded-[2rem] border-2 border-sky-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="bg-sky-50 p-6 border-b-2 border-sky-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-sky-900">
              Agenda del Día
            </h2>
            <p className="text-sky-700 font-bold text-sm">
              {date ? date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Selecciona una fecha'}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-4 py-1 bg-white rounded-full text-sky-600 font-black text-sm border-2 border-sky-200 shadow-sm">
              {appointments.length} Citas
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-sky-600 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-bold">Cargando agenda...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Info className="w-16 h-16 text-sky-200 mb-4" />
              <h3 className="text-xl font-black text-sky-900 mb-2">Día libre</h3>
              <p className="text-sky-700/70 font-medium max-w-sm">
                No hay citas programadas para este día. ¡Disfruta tu tiempo o configura más disponibilidad!
              </p>
            </div>
          ) : (
            appointments.map(app => (
              <div key={app.id} className="bg-zinc-50 border-2 border-zinc-100 p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-white font-black text-lg px-4 py-2 rounded-2xl shadow-sm">
                    {app.startTime}
                  </div>
                  <div>
                    <p className="font-black text-zinc-900 text-lg">{app.patient.name || 'Paciente sin nombre'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {app.status === 'PENDING' && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Pendiente</span>}
                      {app.status === 'CONFIRMED' && <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Confirmada</span>}
                      {app.status === 'COMPLETED' && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Completada</span>}
                      {app.status === 'CANCELLED' && <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Cancelada</span>}
                    </div>
                    {app.notes && <p className="text-sm text-zinc-500 font-medium mt-2">{app.notes}</p>}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
                  {app.status === 'PENDING' && (
                    <Button 
                      onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                      disabled={updating === app.id}
                      size="sm"
                      className="rounded-full bg-sky-500 hover:bg-sky-600 font-bold"
                    >
                      Confirmar
                    </Button>
                  )}
                  {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                    <Button 
                      onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                      disabled={updating === app.id}
                      size="sm"
                      variant="outline"
                      className="rounded-full border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold"
                    >
                      Completar
                    </Button>
                  )}
                  {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                    <Button 
                      onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                      disabled={updating === app.id}
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 font-bold"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
