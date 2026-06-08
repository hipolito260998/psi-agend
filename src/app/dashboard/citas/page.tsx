import { AppointmentsView } from "@/components/dashboard/appointments-view"

export const metadata = {
  title: "Citas | PsiAgend",
}

export default function CitasPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-primary">Agenda de Citas</h1>
        <p className="text-lg font-medium text-muted-foreground">
          Revisa y gestiona las citas programadas día por día.
        </p>
      </div>

      <AppointmentsView />
    </div>
  )
}
