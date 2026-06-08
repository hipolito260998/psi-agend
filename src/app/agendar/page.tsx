import { BookingForm } from "@/components/public/booking-form"

export const metadata = {
  title: "Agendar Cita | PsiAgend",
}

export default function AgendarPage() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
      <BookingForm />
    </div>
  )
}
