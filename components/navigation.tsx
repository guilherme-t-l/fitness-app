"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dumbbell, Home, Plus, BarChart3, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/create", label: "Create", icon: Plus },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
]

/** Legacy nav — unused by active shell (`navigation-bar.tsx`). Kept for reference. */
export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl tracking-tight text-foreground">
            FitFlow
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2 text-muted-foreground hover:text-foreground",
                      isActive && "text-foreground font-medium",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
