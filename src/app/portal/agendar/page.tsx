import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrivateBookingForm } from "@/components/portal/private-booking-form"

export const metadata = {
  title: "Agendar Sesión | Portal de Padres",
}

export default async function PortalAgendarPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect('/login')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PrivateBookingForm patientId={userId} />
    </div>
  )
}
