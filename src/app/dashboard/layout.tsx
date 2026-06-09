import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { NotificationBell } from "@/components/dashboard/notification-bell"

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
      <aside className="hidden w-64 flex-col border-r-4 border-purple-50 bg-white md:flex">
        <div className="flex h-24 items-center justify-between border-b-4 border-purple-50 px-6 gap-2">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center rotate-3 shadow-sm shadow-violet-200 shrink-0">
              <span className="text-primary-foreground text-xl font-bold">P</span>
            </div>
            <span className="text-xl font-black text-primary tracking-tight">PsiAgend</span>
          </div>
          <NotificationBell userId={session.user.id!} />
        </div>
        <DashboardNav />
        <div className="border-t-4 border-purple-50 p-6">
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
      <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Navegación Móvil (Bottom Tab Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <DashboardNav mobile />
      </nav>
    </div>
  )
}
