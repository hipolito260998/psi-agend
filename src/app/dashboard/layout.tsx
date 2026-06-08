import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { CalendarDays, Clock, LayoutDashboard, LogOut, Users } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session.user as any).role === 'PATIENT') {
    redirect('/portal')
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:flex-row">
      <aside className="hidden w-64 flex-col border-r-4 border-amber-50 bg-white md:flex">
        <div className="flex h-24 items-center border-b-4 border-amber-50 px-6 gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center rotate-3 shadow-sm shadow-orange-200">
            <span className="text-primary-foreground text-xl font-bold">P</span>
          </div>
          <span className="text-2xl font-black text-primary tracking-tight">PsiAgend</span>
        </div>
        <nav className="flex-1 space-y-2 p-6">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl bg-amber-100 px-4 py-3 text-primary transition-colors hover:bg-amber-200 font-bold">
            <LayoutDashboard className="h-5 w-5" />
            <span>Inicio</span>
          </Link>
          <Link href="/dashboard/citas" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-muted-foreground transition-colors hover:bg-sky-50 hover:text-sky-700 font-bold">
            <CalendarDays className="h-5 w-5" />
            <span>Citas</span>
          </Link>
          <Link href="/dashboard/disponibilidad" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-muted-foreground transition-colors hover:bg-orange-50 hover:text-orange-700 font-bold">
            <Clock className="h-5 w-5" />
            <span>Disponibilidad</span>
          </Link>
          <Link href="/dashboard/pacientes" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-muted-foreground transition-colors hover:bg-pink-50 hover:text-pink-700 font-bold">
            <Users className="h-5 w-5" />
            <span>Pacientes</span>
          </Link>
        </nav>
        <div className="border-t-4 border-amber-50 p-6">
          <form action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 font-bold">
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
