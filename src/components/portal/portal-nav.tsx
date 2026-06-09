"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CalendarPlus } from "lucide-react"

export function PortalNav() {
  const pathname = usePathname()

  const links = [
    { href: "/portal", label: "Mis Citas", icon: LayoutDashboard },
    { href: "/portal/agendar", label: "Agendar Sesión", icon: CalendarPlus },
  ]

  return (
    <nav className="flex-1 space-y-2 p-6">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = link.href === "/portal" 
          ? pathname === "/portal" 
          : pathname.startsWith(link.href)

        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors ${
              isActive 
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                : "bg-sky-50 text-sky-700 hover:bg-sky-100"
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
