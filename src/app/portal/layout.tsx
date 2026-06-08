import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { CalendarHeart, LayoutDashboard, LogOut } from "lucide-react"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session.user as any).role === 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-sky-50 md:flex-row">
      <aside className="hidden w-64 flex-col border-r-4 border-white bg-white md:flex rounded-r-[3rem] shadow-sm my-4 mr-4">
        <div className="flex h-24 items-center border-b-2 border-sky-50 px-6 gap-3">
          <div className="size-10 bg-sky-400 rounded-xl flex items-center justify-center -rotate-3 shadow-sm shadow-sky-200">
            <CalendarHeart className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-sky-900 tracking-tight leading-tight">Portal<br/>de Padres</span>
        </div>
        <nav className="flex-1 space-y-2 p-6">
          <Link href="/portal" className="flex items-center gap-3 rounded-2xl bg-sky-100 px-4 py-3 text-sky-700 transition-colors hover:bg-sky-200 font-bold">
            <LayoutDashboard className="h-5 w-5" />
            <span>Mis Citas</span>
          </Link>
          {/* We can add more links later, e.g. /portal/pagos */}
        </nav>
        <div className="border-t-2 border-sky-50 p-6">
          <form action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sky-600 transition-colors hover:bg-red-50 hover:text-red-600 font-bold">
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
