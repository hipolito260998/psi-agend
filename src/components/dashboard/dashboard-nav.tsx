"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Clock, LayoutDashboard, Users } from "lucide-react"

export function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/citas", label: "Citas", icon: CalendarDays },
    { href: "/dashboard/disponibilidad", label: "Horarios", icon: Clock },
    { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  ]

  if (mobile) {
    return (
      <>
        {links.map((link) => {
          const Icon = link.icon
          const isActive = link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href)
          
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex flex-col items-center justify-center gap-1 p-2 transition-all ${
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-sky-600"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-black">{link.label}</span>
            </Link>
          )
        })}
      </>
    )
  }

  return (
    <nav className="flex-1 space-y-2 p-6">
      {links.map((link) => {
        const Icon = link.icon
        // For dashboard root, we need exact match. For others, startsWith is fine
        const isActive = link.href === "/dashboard" 
          ? pathname === "/dashboard" 
          : pathname.startsWith(link.href)

        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors ${
              isActive 
                ? "bg-purple-100 text-primary hover:bg-purple-200" 
                : "text-muted-foreground hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
