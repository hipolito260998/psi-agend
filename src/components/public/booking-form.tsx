"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getAvailableSlots, createPublicAppointment } from "@/actions/appointments"
import { Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export function BookingForm() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

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
    setErrorMsg("")
    
    if (!date || !selectedTime) return
    
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Por favor no dejes ningún campo vacío (Nombre, Correo y Teléfono).")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("Por favor ingresa un correo electrónico válido.")
      return
    }

    if (!/^\d+$/.test(phone.trim())) {
      setErrorMsg("El teléfono debe contener únicamente números.")
      return
    }
    
    setLoadingSubmit(true)
    const res = await createPublicAppointment({
      date,
      startTime: selectedTime,
      parentName: name,
      email,
      phone
    })
    
    if (res.success) {
      setSuccess(true)
    } else {
      setErrorMsg(res.error || "Ocurrió un error al agendar tu cita.")
    }
    setLoadingSubmit(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[3rem] shadow-xl p-12 text-center border-4 border-emerald-50">
        <div className="size-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-emerald-900 mb-4">¡Cita Confirmada!</h2>
        <p className="text-lg text-emerald-800/80 font-medium mb-8">
          Hemos registrado tu cita exitosamente. Te enviaremos un correo con los detalles.
        </p>
        <Link href="/">
          <Button className="rounded-full h-14 px-10 text-lg font-black shadow-lg bg-primary hover:bg-orange-500 text-white">
            Volver al inicio
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-xl shadow-orange-900/5 p-8 md:p-12 border-4 border-amber-50">
      <div className="space-y-4 text-center mb-12">
        <Link href="/" className="inline-block text-sm font-bold text-primary hover:text-orange-500 mb-4 bg-amber-50 px-4 py-2 rounded-full transition-colors">
          ← Volver al inicio
        </Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Agenda tu sesión</h1>
        <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
          Elige el horario ideal para ti y tu pequeño. Te enviaremos una confirmación de inmediato.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        {/* Paso 1 */}
        <div className="space-y-8 bg-sky-50/50 p-6 rounded-[2rem] border-2 border-sky-100">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-sky-900 flex items-center gap-2">
              <span className="flex h-8 w-8 rounded-full bg-sky-200 items-center justify-center text-sky-700 text-lg">1</span>
              Fecha y Hora
            </h2>
            <div className="flex justify-center bg-white p-4 rounded-3xl shadow-sm border border-sky-100">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-3xl"
                disabled={(d) => {
                  const today = new Date(new Date().setHours(0,0,0,0))
                  const maxDate = new Date(today)
                  maxDate.setDate(maxDate.getDate() + 14) // Ventana de 14 días (RECOMENDADO)
                  return d < today || d > maxDate || d.getDay() === 0
                }}
              />
            </div>
            
            <div className="space-y-4 pt-4 min-h-[120px]">
              <Label className="text-sky-800 font-bold text-base">Horarios disponibles:</Label>
              {!date ? (
                <p className="text-sm text-sky-600 font-medium text-center italic py-4 bg-white rounded-2xl border border-sky-100">Selecciona un día en el calendario.</p>
              ) : loadingSlots ? (
                <div className="flex justify-center py-4 text-sky-500"><Loader2 className="animate-spin w-6 h-6" /></div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-sky-600 font-medium text-center italic py-4 bg-white rounded-2xl border border-sky-100">No hay horarios disponibles para este día.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {slots.map(slot => (
                    <Button 
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      variant={selectedTime === slot ? "default" : "outline"} 
                      className={`rounded-full font-bold h-12 ${
                        selectedTime === slot 
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md' 
                        : 'border-2 border-sky-200 text-sky-700 hover:bg-sky-100'
                      }`}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Paso 2 */}
        <div className={`space-y-8 p-6 rounded-[2rem] border-2 transition-all ${selectedTime ? 'bg-amber-50/50 border-amber-100' : 'bg-zinc-50 border-zinc-100 opacity-50 pointer-events-none'}`}>
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-amber-900 flex items-center gap-2">
              <span className="flex h-8 w-8 rounded-full bg-amber-200 items-center justify-center text-amber-800 text-lg">2</span>
              Tus Datos
            </h2>
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="font-bold text-amber-900 ml-2">Nombre del Padre/Tutor</Label>
                <Input id="nombre" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Pérez" className="rounded-full bg-white border-2 border-amber-200 focus-visible:ring-2 focus-visible:ring-primary h-12 px-6 shadow-sm font-medium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-amber-900 ml-2">Correo Electrónico</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="rounded-full bg-white border-2 border-amber-200 focus-visible:ring-2 focus-visible:ring-primary h-12 px-6 shadow-sm font-medium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="font-bold text-amber-900 ml-2">Teléfono de Contacto</Label>
                <Input id="telefono" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="555-0100" className="rounded-full bg-white border-2 border-amber-200 focus-visible:ring-2 focus-visible:ring-primary h-12 px-6 shadow-sm font-medium" />
              </div>
              <div className="pt-6">
                {errorMsg && (
                  <p className="text-red-500 font-bold text-sm text-center mb-4 bg-red-50 p-3 rounded-2xl border border-red-100">
                    {errorMsg}
                  </p>
                )}
                <Button 
                  onClick={handleSubmit}
                  disabled={loadingSubmit || !name.trim() || !email.trim() || !phone.trim()}
                  className="w-full rounded-full h-14 text-lg font-black shadow-lg shadow-orange-200 bg-primary hover:bg-orange-500 hover:-translate-y-1 transition-all text-white"
                >
                  {loadingSubmit ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {loadingSubmit ? "Procesando..." : "Confirmar Reserva"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
