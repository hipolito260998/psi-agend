import { auth, prisma } from "@/auth"
import { CalendarHeart, Clock, CheckCircle2, History } from "lucide-react"

export const metadata = {
  title: "Portal de Padres | PsiAgend",
}

export default async function PortalPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Consultar próximas citas (Pendientes o Confirmadas) a partir de hoy
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      patientId: userId,
      date: { gte: today },
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  })

  // Consultar historial de citas (Completadas)
  const pastAppointments = await prisma.appointment.findMany({
    where: {
      patientId: userId,
      status: 'COMPLETED'
    },
    orderBy: [
      { date: 'desc' },
      { startTime: 'desc' }
    ]
  })

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-sky-900">Hola, {session?.user?.name?.split(' ')[0] || "Familia"} 👋</h1>
        <p className="text-lg font-medium text-sky-700 mt-2">
          Bienvenido a tu espacio seguro. Aquí puedes ver las próximas sesiones de tu pequeño.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Próximas Citas */}
        <div className="bg-white rounded-[2rem] p-8 border-4 border-amber-100 shadow-sm shadow-amber-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center">
              <CalendarHeart className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-amber-900">Próximas Sesiones</h2>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-10 bg-amber-50 rounded-3xl border-2 border-dashed border-amber-200">
                <p className="text-amber-800 font-bold">No tienes sesiones programadas próximamente.</p>
                <p className="text-amber-600 text-sm mt-1">Recuerda que puedes agendar nuevas citas desde la página principal.</p>
              </div>
            ) : (
              upcomingAppointments.map((cita) => (
                <div key={cita.id} className="flex flex-col sm:flex-row gap-4 p-5 bg-amber-50 rounded-3xl border-2 border-amber-100">
                  <div className="bg-white border-2 border-amber-200 px-4 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[100px] shadow-sm">
                    <span className="text-xs font-bold text-amber-600 uppercase">{cita.date.toLocaleDateString('es-ES', { month: 'short' })}</span>
                    <span className="text-3xl font-black text-amber-900 leading-none">{cita.date.getDate()}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="font-black text-amber-900 text-lg">{cita.startTime}</span>
                    </div>
                    <p className="text-sm font-bold text-amber-700 flex items-center gap-1 mt-1">
                      {cita.status === 'CONFIRMED' ? (
                         <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600">Cita Confirmada</span></>
                      ) : (
                         <><Clock className="w-4 h-4 text-orange-400" /> <span className="text-orange-500">Pendiente de Confirmación</span></>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Historial */}
        <div className="bg-white rounded-[2rem] p-8 border-4 border-sky-100 shadow-sm shadow-sky-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-full bg-sky-100 flex items-center justify-center">
              <History className="w-6 h-6 text-sky-600" />
            </div>
            <h2 className="text-2xl font-black text-sky-900">Historial de Visitas</h2>
          </div>

          <div className="space-y-4">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-10 bg-sky-50 rounded-3xl border-2 border-dashed border-sky-200">
                <p className="text-sky-800 font-bold">Aún no hay visitas completadas.</p>
              </div>
            ) : (
              pastAppointments.map((cita) => (
                <div key={cita.id} className="flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <div>
                    <p className="font-bold text-sky-900">
                      {cita.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-sm text-sky-700 font-medium">{cita.startTime}</p>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-full border border-sky-200">
                    <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completada
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
