"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { getAppointments, updateAppointmentStatus, getActiveAppointmentDates } from "@/actions/appointments"
import { Loader2, CheckCircle2, Clock, XCircle, Info, Phone } from "lucide-react"

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
    phone: string | null
  }
}

export function AppointmentsView() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeDates, setActiveDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchActiveDates = async () => {
    const res = await getActiveAppointmentDates()
    if (res.success && res.data) {
      setActiveDates(res.data.map(d => {
        // d es "2026-06-09T00:00:00.000Z". Cortamos por la 'T' para extraer el año, mes y día,
        // y creamos una fecha local en el navegador para que no se desface por zonas horarias.
        const [year, month, day] = d.split('T')[0].split('-').map(Number)
        return new Date(year, month - 1, day)
      }))
    }
  }

  useEffect(() => {
    fetchActiveDates()
  }, [])

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
      // Refrescar los puntitos rojos en caso de que se cancele la última cita de un día
      if (status === 'CANCELLED') {
        fetchActiveDates()
      }
    }
    setUpdating(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Calendario */}
      <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border-2 border-purple-100 shadow-sm flex flex-col items-center">
        <h2 className="text-xl font-black text-purple-900 mb-6 w-full text-left">Selecciona un día</h2>
        <div className="bg-purple-50 p-4 rounded-[2rem] border-2 border-purple-100">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-[1.5rem]"
            disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
            modifiers={{
              hasAppointment: activeDates
            }}
            modifiersClassNames={{
              hasAppointment: "relative after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-purple-500 after:rounded-full font-bold text-purple-900"
            }}
          />
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="lg:col-span-2 bg-white rounded-[2rem] border-2 border-purple-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="bg-purple-50 p-6 border-b-2 border-purple-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-violet-900">
              Agenda del Día
            </h2>
            <p className="text-violet-700 font-bold text-sm">
              {date ? date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Selecciona una fecha'}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-4 py-1 bg-white rounded-full text-violet-600 font-black text-sm border-2 border-purple-200 shadow-sm">
              {appointments.length} Citas
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-violet-600 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-bold">Cargando agenda...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Info className="w-16 h-16 text-purple-200 mb-4" />
              <h3 className="text-xl font-black text-violet-900 mb-2">Día libre</h3>
              <p className="text-violet-700/70 font-medium max-w-sm">
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
                    
                    {app.patient.phone && (
                      <a href={`tel:${app.patient.phone}`} className="inline-flex items-center gap-1 text-sm text-violet-600 font-bold hover:text-violet-800 transition-colors mt-0.5">
                        <Phone className="w-3.5 h-3.5" />
                        {app.patient.phone}
                      </a>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      {app.status === 'PENDING' && <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Pendiente</span>}
                      {app.status === 'CONFIRMED' && <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 bg-purple-100 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Confirmada</span>}
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
                      className="rounded-full bg-purple-500 hover:bg-violet-600 font-bold"
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
