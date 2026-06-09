"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { saveAvailability, deleteAvailability } from "@/actions/availability"
import { Loader2, Trash2 } from "lucide-react"

type Availability = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const HOURS = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`)

export function AvailabilityForm({ initialData }: { initialData: Availability[] }) {
  const [data, setData] = useState<Availability[]>(initialData)
  const [loading, setLoading] = useState(false)
  
  // States for adding a new block
  const [newDay, setNewDay] = useState<number>(1)
  const [newStart, setNewStart] = useState("09:00")
  const [newEnd, setNewEnd] = useState("13:00")

  const handleAdd = async () => {
    setLoading(true)
    const res = await saveAvailability({ dayOfWeek: newDay, startTime: newStart, endTime: newEnd })
    if (res.success && res.data) {
      setData([...data, res.data as Availability])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    const res = await deleteAvailability(id)
    if (res.success) {
      setData(data.filter(d => d.id !== id))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Agregar Nuevo */}
      <div className="bg-purple-50 p-6 rounded-[2rem] border-2 border-purple-200 shadow-sm">
        <h2 className="text-xl font-black text-purple-900 mb-4">Agregar Horario</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="font-bold text-purple-800 ml-2">Día de la semana</label>
            <select 
              value={newDay} 
              onChange={(e) => setNewDay(Number(e.target.value))}
              className="w-full rounded-full border-2 border-purple-200 bg-white h-12 px-4 focus:ring-2 focus:ring-primary font-medium text-purple-900"
            >
              {DAYS.map((d, i) => (
                i !== 0 ? <option key={i} value={i}>{d}</option> : null
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="font-bold text-purple-800 ml-2">Hora de Inicio</label>
            <select 
              value={newStart} 
              onChange={(e) => setNewStart(e.target.value)}
              className="w-full rounded-full border-2 border-purple-200 bg-white h-12 px-4 focus:ring-2 focus:ring-primary font-medium text-purple-900"
            >
              {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="font-bold text-purple-800 ml-2">Hora de Fin</label>
            <select 
              value={newEnd} 
              onChange={(e) => setNewEnd(e.target.value)}
              className="w-full rounded-full border-2 border-purple-200 bg-white h-12 px-4 focus:ring-2 focus:ring-primary font-medium text-purple-900"
            >
              {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <Button 
            onClick={handleAdd} 
            disabled={loading}
            className="rounded-full h-12 px-8 font-black bg-primary hover:bg-violet-500 shadow-md text-white"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Lista Actual */}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-sky-100 shadow-sm">
        <h2 className="text-xl font-black text-sky-900 mb-6">Horarios Configurados</h2>
        
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground font-medium py-8">No has configurado ningún horario aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-sky-50 p-4 rounded-2xl border-2 border-sky-100 group">
                <div>
                  <p className="font-black text-sky-900 text-lg">{DAYS[item.dayOfWeek]}</p>
                  <p className="text-sky-700 font-bold">{item.startTime} - {item.endTime}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(item.id)}
                  disabled={loading}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
