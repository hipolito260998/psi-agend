"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPatient, addClinicalRecord, getClinicalRecords, setPatientPassword } from "@/actions/patients"
import { Loader2, Plus, FileText, UserCircle2, Key } from "lucide-react"

// Types matching prisma
type User = { id: string, name: string | null, email: string, phone: string | null, _count?: { appointments: number, clinicalRecords: number } }
type Record = { id: string, content: string, date: Date }

export function PatientsView({ initialPatients }: { initialPatients: User[] }) {
  const [patients, setPatients] = useState<User[]>(initialPatients)
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null)
  const [records, setRecords] = useState<Record[]>([])
  
  // Create patient state
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")

  // Add record state
  const [newRecord, setNewRecord] = useState("")
  const [loadingRecord, setLoadingRecord] = useState(false)

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [loadingPassword, setLoadingPassword] = useState(false)

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createPatient({ name: newName, email: newEmail, phone: newPhone })
    if (res.success && res.data) {
      setPatients([res.data as User, ...patients])
      setShowCreate(false)
      setNewName(""); setNewEmail(""); setNewPhone("")
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleSelectPatient = async (patient: User) => {
    setSelectedPatient(patient)
    setShowPasswordForm(false)
    const res = await getClinicalRecords(patient.id)
    if (res.success && res.data) {
      setRecords(res.data)
    }
  }

  const handleAddRecord = async () => {
    if (!selectedPatient || !newRecord.trim()) return
    setLoadingRecord(true)
    const res = await addClinicalRecord({ patientId: selectedPatient.id, content: newRecord })
    if (res.success && res.data) {
      setRecords([res.data as Record, ...records])
      setNewRecord("")
      
      // Update local count
      setPatients(patients.map(p => 
        p.id === selectedPatient.id 
          ? { ...p, _count: { ...p._count!, clinicalRecords: (p._count?.clinicalRecords || 0) + 1 } }
          : p
      ))
    }
    setLoadingRecord(false)
  }

  const handleSetPassword = async () => {
    if (!selectedPatient || !newPassword) return
    setLoadingPassword(true)
    const res = await setPatientPassword(selectedPatient.id, newPassword)
    if (res.success) {
      alert("Contraseña asignada correctamente. Ya puedes compartirla con el paciente.")
      setNewPassword("")
      setShowPasswordForm(false)
    } else {
      alert(res.error)
    }
    setLoadingPassword(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Lista de Pacientes */}
      <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border-2 border-sky-100 shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-sky-900">Directorio</h2>
          <Button 
            onClick={() => setShowCreate(!showCreate)} 
            size="icon"
            className="rounded-full bg-primary hover:bg-orange-500 text-white"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreatePatient} className="bg-sky-50 p-4 rounded-2xl mb-4 border border-sky-200 space-y-3">
            <h3 className="font-bold text-sky-800 text-sm">Nuevo Paciente (Padre/Tutor)</h3>
            <Input required placeholder="Nombre completo" value={newName} onChange={e => setNewName(e.target.value)} className="rounded-full bg-white border-sky-200" />
            <Input required type="email" placeholder="Correo electrónico" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="rounded-full bg-white border-sky-200" />
            <Input placeholder="Teléfono" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="rounded-full bg-white border-sky-200" />
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-sky-500 hover:bg-sky-600 font-bold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Registro"}
            </Button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {patients.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4 font-medium">No hay pacientes registrados.</p>
          ) : (
            patients.map(p => (
              <div 
                key={p.id} 
                onClick={() => handleSelectPatient(p)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedPatient?.id === p.id ? 'bg-primary/10 border-primary' : 'bg-zinc-50 border-transparent hover:border-zinc-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <UserCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{p.name || 'Sin nombre'}</p>
                    <p className="text-xs text-muted-foreground font-medium">{p.email}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Expediente del Paciente */}
      <div className="lg:col-span-2">
        {!selectedPatient ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-amber-200 rounded-[2rem] bg-amber-50/50">
            <FileText className="w-16 h-16 text-amber-300 mb-4" />
            <h3 className="text-xl font-black text-amber-900 mb-2">Selecciona un paciente</h3>
            <p className="text-amber-800/70 font-medium">
              Haz clic en un paciente de la lista para ver o agregar notas a su expediente clínico.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border-2 border-amber-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
            
            {/* Header Expediente */}
            <div className="bg-amber-50 p-6 border-b-2 border-amber-100 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-black text-amber-900">{selectedPatient.name}</h2>
                <p className="text-amber-700 font-bold text-sm">{selectedPatient.email} • {selectedPatient.phone || 'Sin teléfono'}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-2 border-amber-200 text-amber-700 hover:bg-amber-100 font-bold"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Acceso a Portal
                </Button>
                <span className="inline-block px-4 py-1 bg-white rounded-full text-amber-600 font-black text-sm border-2 border-amber-200 shadow-sm">
                  {selectedPatient._count?.clinicalRecords || 0} Notas
                </span>
              </div>
            </div>

            {/* Asignar Contraseña Form */}
            {showPasswordForm && (
              <div className="p-6 bg-amber-100/50 border-b-2 border-amber-100 flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <label className="font-bold text-amber-900 text-sm">Nueva Contraseña para el Padre</label>
                  <Input 
                    type="text" 
                    placeholder="Ej. Familia123!" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="rounded-full bg-white border-amber-200 focus-visible:ring-primary"
                  />
                </div>
                <Button 
                  onClick={handleSetPassword}
                  disabled={loadingPassword || !newPassword}
                  className="rounded-full bg-amber-500 hover:bg-amber-600 font-bold text-white shadow-sm"
                >
                  {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar y Asignar"}
                </Button>
              </div>
            )}

            {/* Nueva Nota */}
            <div className="p-6 border-b-2 border-zinc-100 bg-zinc-50/50">
              <div className="flex flex-col gap-3">
                <label className="font-bold text-zinc-700 ml-2">Agregar nota a la bitácora</label>
                <textarea 
                  value={newRecord}
                  onChange={e => setNewRecord(e.target.value)}
                  placeholder="Escribe aquí las observaciones de la sesión..."
                  className="w-full rounded-[1.5rem] border-2 border-zinc-200 p-4 focus:ring-2 focus:ring-primary focus:border-primary resize-none h-24 text-zinc-800 font-medium"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddRecord} 
                    disabled={loadingRecord || !newRecord.trim()}
                    className="rounded-full px-8 font-black bg-primary hover:bg-orange-500 text-white"
                  >
                    {loadingRecord ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Nota"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Historial */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {records.length === 0 ? (
                <p className="text-center text-muted-foreground font-medium mt-10">No hay notas en el expediente de este paciente.</p>
              ) : (
                records.map(record => (
                  <div key={record.id} className="bg-white border-2 border-zinc-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                        <FileText className="w-3 h-3" />
                        Sesión Registrada
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-zinc-700 font-medium whitespace-pre-wrap leading-relaxed">{record.content}</p>
                  </div>
                ))
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
