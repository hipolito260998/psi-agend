import { getPatients } from "@/actions/patients"
import { PatientsView } from "@/components/dashboard/patients-view"

export const metadata = {
  title: "Pacientes | PsiAgend",
}

export default async function PacientesPage() {
  const { data } = await getPatients()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patients = (data as any) || []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-primary">Pacientes y Expedientes</h1>
        <p className="text-lg font-medium text-muted-foreground">
          Gestiona los registros de tus pacientes y documenta sus sesiones de forma segura.
        </p>
      </div>

      <PatientsView initialPatients={patients} />
    </div>
  )
}
