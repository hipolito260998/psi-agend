import { auth, prisma } from "@/auth"
import { CalendarDays, Users, TrendingUp, Sparkles } from "lucide-react"

export const metadata = {
  title: "Dashboard | PsiAgend",
}

export default async function DashboardPage() {
  const session = await auth()

  // Fechas para consultas
  const now = new Date()
  const todayNormalized = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))

  // Consultas a BD
  const [citasHoy, pacientesTotales, citasCompletadas, proximasCitas] = await Promise.all([
    prisma.appointment.count({
      where: {
        date: todayNormalized,
        status: { not: 'CANCELLED' }
      }
    }),
    prisma.user.count({
      where: { role: 'PATIENT' }
    }),
    prisma.appointment.count({
      where: { status: 'COMPLETED' }
    }),
    prisma.appointment.findMany({
      where: {
        date: todayNormalized,
        status: { not: 'CANCELLED' }
      },
      include: { patient: true },
      orderBy: { startTime: 'asc' },
      take: 5
    })
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">Hola, {session?.user?.name || "Doctora"} 👋</h1>
        <p className="text-lg font-medium text-muted-foreground mt-2">
          Bienvenida a tu panel de control. Aquí tienes un resumen de tu día.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta 1 */}
        <div className="bg-sky-50 rounded-[2rem] p-6 border-2 border-sky-100 flex flex-col justify-between h-40 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sky-900 font-bold text-lg">Citas Hoy</h3>
            <div className="size-10 rounded-full bg-sky-200 text-sky-700 flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-sky-900">{citasHoy}</p>
            <p className="text-sky-700 font-medium text-sm mt-1">Sesiones programadas</p>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-purple-50 rounded-[2rem] p-6 border-2 border-purple-100 flex flex-col justify-between h-40 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-purple-900 font-bold text-lg">Pacientes Activos</h3>
            <div className="size-10 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-purple-900">{pacientesTotales}</p>
            <p className="text-purple-700 font-medium text-sm mt-1">Familias en el sistema</p>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-pink-50 rounded-[2rem] p-6 border-2 border-pink-100 flex flex-col justify-between h-40 shadow-sm transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-pink-900 font-bold text-lg">Sesiones Exitosas</h3>
            <div className="size-10 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black text-pink-900">{citasCompletadas}</p>
            <p className="text-pink-700 font-medium text-sm mt-1">Citas completadas en total</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 lg:col-span-4 bg-white rounded-[2rem] p-8 border-2 border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-zinc-900">Agenda de Hoy</h2>
              <p className="text-muted-foreground font-medium mt-1">Tus próximas sesiones para este día.</p>
            </div>
            <div className="size-12 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-4">
            {proximasCitas.length === 0 ? (
              <div className="text-center py-10 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                <p className="text-zinc-500 font-bold">No hay citas para hoy.</p>
                <p className="text-zinc-400 text-sm mt-1">¡Aprovecha para adelantar trabajo o descansar!</p>
              </div>
            ) : (
              proximasCitas.map((cita) => (
                <div key={cita.id} className="flex items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="bg-primary text-white font-black text-lg px-4 py-2 rounded-2xl shadow-sm">
                    {cita.startTime}
                  </div>
                  <div className="ml-5">
                    <p className="text-lg font-black text-zinc-900 leading-none">{cita.patient.name || "Sin nombre"}</p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {cita.status === 'PENDING' ? 'Pendiente' : cita.status === 'CONFIRMED' ? 'Confirmada' : 'Completada'}
                    </p>
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
