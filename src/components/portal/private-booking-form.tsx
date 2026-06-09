"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getAvailableSlots, createPrivateAppointment } from "@/actions/appointments"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { toast } from "sonner"

export function PrivateBookingForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [success, setSuccess] = useState(false)

  // Fetch slots when date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!date) {
        setSlots([])
        setSelectedTime(null)
        return
      }
      setLoadingSlots(true)
      setSelectedTime(null)
      const res = await getAvailableSlots(date)
      if (res.success && res.data) {
        setSlots(res.data)
      }
      setLoadingSlots(false)
    }
    fetchSlots()
  }, [date])

  const handleSubmit = async () => {
    if (!date || !selectedTime || !patientId) return
    
    setLoadingSubmit(true)
    const res = await createPrivateAppointment({
      date,
      startTime: selectedTime,
      patientId
    })
    
    if (res.success) {
      setSuccess(true)
    } else {
      toast.error(res.error || "Ocurrió un error al agendar la sesión")
    }
    setLoadingSubmit(false)
  }

  if (success) {
    return (
      <div className="w-full bg-white rounded-[3rem] shadow-sm shadow-emerald-900/5 p-12 text-center border-4 border-emerald-50">
        <div className="size-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-emerald-900 mb-4">¡Cita Agendada!</h2>
        <p className="text-lg text-emerald-800/80 font-medium mb-8">
          Tu sesión ha sido reservada correctamente en tu expediente.
        </p>
        <Button 
          onClick={() => router.push('/portal')}
          className="rounded-full h-14 px-10 text-lg font-black shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Volver a Mis Citas
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-[3rem] shadow-sm shadow-violet-900/5 p-8 md:p-12 border-4 border-purple-50">
      <div className="space-y-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-violet-900">Agendar Nueva Sesión</h2>
        <p className="text-lg text-violet-700 font-medium max-w-xl">
          Elige el día y la hora para la próxima visita de tu pequeño. No necesitas volver a llenar tus datos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Calendario */}
        <div className="space-y-6">
          <div className="flex justify-center pb-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="bg-white rounded-[2rem] shadow-sm border border-purple-100 p-4 md:p-6"
              disabled={(d) => {
                const today = new Date(new Date().setHours(0,0,0,0))
                const maxDate = new Date(today)
                maxDate.setDate(maxDate.getDate() + 14) // Ventana de 14 días (RECOMENDADO)
                return d < today || d > maxDate || d.getDay() === 0
              }}
            />
          </div>
        </div>

        {/* Horarios y Confirmación */}
        <div className="space-y-8">
          <div className="space-y-4 min-h-[120px]">
            <Label className="text-violet-900 font-black text-lg">Horarios Disponibles</Label>
            {!date ? (
              <div className="bg-purple-50 rounded-3xl border-2 border-dashed border-purple-200 p-8 text-center">
                <p className="text-violet-700 font-medium">Selecciona un día en el calendario para ver las horas libres.</p>
              </div>
            ) : loadingSlots ? (
              <div className="flex justify-center py-8 text-purple-500"><Loader2 className="animate-spin w-8 h-8" /></div>
            ) : slots.length === 0 ? (
              <div className="bg-purple-50 rounded-3xl border-2 border-dashed border-purple-200 p-8 text-center">
                <p className="text-purple-800 font-bold">No hay horarios libres este día.</p>
                <p className="text-purple-600 text-sm mt-1">Por favor elige otra fecha.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map(slot => (
                  <Button 
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    variant={selectedTime === slot ? "default" : "outline"} 
                    className={`rounded-full font-black h-14 text-base transition-all ${
                      selectedTime === slot 
                      ? 'bg-purple-400 hover:bg-purple-500 text-purple-950 shadow-md scale-105' 
                      : 'border-2 border-purple-200 text-violet-700 hover:bg-purple-100'
                    }`}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className={`pt-8 border-t-2 border-purple-50 transition-opacity ${selectedTime ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <Button 
              onClick={handleSubmit}
              disabled={loadingSubmit || !selectedTime}
              className="w-full rounded-full h-16 text-xl font-black shadow-lg shadow-purple-200 bg-purple-500 hover:bg-violet-600 hover:-translate-y-1 transition-all text-white"
            >
              {loadingSubmit ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
              {loadingSubmit ? "Agendando..." : "Confirmar Cita"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
