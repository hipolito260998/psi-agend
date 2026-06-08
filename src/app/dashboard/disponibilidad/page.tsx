import { getAvailabilities } from "@/actions/availability"
import { AvailabilityForm } from "@/components/dashboard/availability-form"

export const metadata = {
  title: "Disponibilidad | PsiAgend",
}

export default async function DisponibilidadPage() {
  const { data } = await getAvailabilities()
  const availabilities = data || []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-primary">Disponibilidad</h1>
        <p className="text-lg font-medium text-muted-foreground">
          Configura tus horarios de trabajo para que los padres puedan agendar.
        </p>
      </div>

      <AvailabilityForm initialData={availabilities} />
    </div>
  )
}
