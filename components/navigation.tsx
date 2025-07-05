"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dumbbell, Home, Plus, BarChart3, User, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/create", label: "Create", icon: Plus },
  { href: "https://v0-fitness-flame.vercel.app/progress", label: "Progress", icon: BarChart3, external: true },
  { href: "/profile", label: "Profile", icon: User },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-cyan-500/20 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-cyan-400 neon-text" />
            <span className="font-cyber text-2xl font-bold text-cyan-400 neon-text">CyberFit</span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10",
                      isActive && "text-cyan-400 bg-cyan-400/20 cyber-glow",
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
