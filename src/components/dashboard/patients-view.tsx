"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPatient, addClinicalRecord, getClinicalRecords, setPatientPassword, deletePatient } from "@/actions/patients"
import { Loader2, Plus, FileText, UserCircle2, Key, Trash2 } from "lucide-react"

// Types matching prisma
type User = { id: string, name: string | null, email: string, phone: string | null, _count?: { appointments: number, clinicalRecords: number } }
type Record = { id: string, content: string, date: Date }

import { toast } from "sonner"

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
      toast.success("Paciente agregado correctamente")
    } else {
      toast.error(res.error || "Ocurrió un error")
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
      toast.success("Nota agregada al expediente")
    } else {
      toast.error(res.error || "No se pudo guardar la nota")
    }
    setLoadingRecord(false)
  }

  const handleSetPassword = async () => {
    if (!selectedPatient || !newPassword) return
    setLoadingPassword(true)
    const res = await setPatientPassword(selectedPatient.id, newPassword)
    if (res.success) {
      toast.success("Contraseña asignada", {
        description: "Ya puedes compartirla con el paciente para que acceda al portal."
      })
      setNewPassword("")
      setShowPasswordForm(false)
    } else {
      toast.error(res.error || "Error al asignar contraseña")
    }
    setLoadingPassword(false)
  }

  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const confirmDelete = async () => {
    if (!selectedPatient) return
    setDeleting(true)
    const res = await deletePatient(selectedPatient.id)
    if (res.success) {
      setPatients(prev => prev.filter(p => p.id !== selectedPatient.id))
      setSelectedPatient(null)
      setShowDeleteModal(false)
      toast.success("Paciente eliminado exitosamente")
    } else {
      toast.error(res.error || "No se pudo eliminar al paciente")
    }
    setDeleting(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Lista de Pacientes */}
      <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border-2 border-purple-100 shadow-sm flex flex-col lg:h-[calc(100vh-12rem)] min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-violet-900">Directorio</h2>
          <Button 
            onClick={() => setShowCreate(!showCreate)} 
            size="icon"
            className="rounded-full bg-primary hover:bg-violet-500 text-white"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreatePatient} className="bg-purple-50 p-4 rounded-2xl mb-4 border border-purple-200 space-y-3">
            <h3 className="font-bold text-violet-800 text-sm">Nuevo Paciente (Padre/Tutor)</h3>
            <Input required placeholder="Nombre completo" value={newName} onChange={e => setNewName(e.target.value)} className="rounded-full bg-white border-purple-200" />
            <Input required type="email" placeholder="Correo electrónico" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="rounded-full bg-white border-purple-200" />
            <Input placeholder="Teléfono" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="rounded-full bg-white border-purple-200" />
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-purple-500 hover:bg-violet-600 font-bold">
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
          <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-purple-200 rounded-[2rem] bg-purple-50/50 min-h-[300px]">
            <FileText className="w-16 h-16 text-purple-300 mb-4" />
            <h3 className="text-xl font-black text-purple-900 mb-2">Selecciona un paciente</h3>
            <p className="text-purple-800/70 font-medium">
              Haz clic en un paciente de la lista para ver o agregar notas a su expediente clínico.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border-2 border-purple-100 shadow-sm overflow-hidden flex flex-col lg:h-[calc(100vh-12rem)]">
            
            {/* Header Expediente */}
            <div className="bg-purple-50 p-6 border-b-2 border-purple-100 flex items-center justify-between flex-wrap gap-4">
              <div className="w-full sm:w-auto">
                <h2 className="text-2xl font-black text-purple-900">{selectedPatient.name}</h2>
                <p className="text-purple-700 font-bold text-sm">{selectedPatient.email} • {selectedPatient.phone || 'Sin teléfono'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-2 border-purple-200 text-purple-700 hover:bg-purple-100 font-bold"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Acceso a Portal
                </Button>
                <Button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
                <span className="inline-block px-4 py-1 bg-white rounded-full text-purple-600 font-black text-sm border-2 border-purple-200 shadow-sm">
                  {selectedPatient._count?.clinicalRecords || 0} Notas
                </span>
              </div>
            </div>

            {/* Modal de Eliminación */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border-4 border-red-50 text-center animate-in fade-in zoom-in duration-200">
                  <div className="size-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-zinc-900 mb-3">¿Eliminar Paciente?</h3>
                  <p className="text-lg text-zinc-600 font-medium mb-10 leading-snug">
                    Esta acción es <span className="font-bold text-red-500">irreversible</span>. Se borrará su cuenta, todas sus citas y su expediente clínico completo.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => setShowDeleteModal(false)} 
                      variant="outline" 
                      disabled={deleting}
                      className="rounded-full h-14 px-8 font-black border-2 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={confirmDelete} 
                      disabled={deleting} 
                      className="rounded-full h-14 px-8 bg-red-500 hover:bg-red-600 text-white font-black shadow-lg shadow-red-200"
                    >
                      {deleting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                      Sí, Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Asignar Contraseña Form */}
            {showPasswordForm && (
              <div className="p-6 bg-purple-100/50 border-b-2 border-purple-100 flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <label className="font-bold text-purple-900 text-sm">Nueva Contraseña para el Padre</label>
                  <Input 
                    type="text" 
                    placeholder="Ej. Familia123!" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="rounded-full bg-white border-purple-200 focus-visible:ring-primary"
                  />
                </div>
                <Button 
                  onClick={handleSetPassword}
                  disabled={loadingPassword || !newPassword}
                  className="rounded-full bg-purple-500 hover:bg-purple-600 font-bold text-white shadow-sm"
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
                    className="rounded-full px-8 font-black bg-primary hover:bg-violet-500 text-white"
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
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 bg-purple-100 px-3 py-1 rounded-full">
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
