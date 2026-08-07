"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer"
import { Menu } from "lucide-react"
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { useState, type ReactNode } from 'react';
import { AuthModal } from './ui/AuthModal';
import { cn } from '@/lib/utils';

function NavLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "min-h-[44px] flex items-center justify-center text-sm tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1",
        active
          ? "text-foreground font-medium underline underline-offset-8 decoration-primary/40"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  )
}

function NavigationBar() {
  const { user, isGuest, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 bg-background/85 border-b border-border/70 backdrop-blur-md flex items-center justify-between px-4 h-14 md:px-8 md:h-16"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex items-center">
        <Link
          href="/"
          className="font-display text-xl md:text-[1.35rem] tracking-tight text-foreground hover:opacity-80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label="Home"
        >
          FitFlow
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <NavLink href="/workouts">Workouts</NavLink>
        <NavLink href="/progress">Progress</NavLink>
      </div>

      <div className="md:hidden flex items-center">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              aria-label="Open navigation menu"
              className="p-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
              tabIndex={0}
              type="button"
            >
              <Menu className="h-6 w-6" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-background border-t border-border text-foreground">
            <div className="flex flex-col gap-2 py-8 px-6">
              <NavLink href="/workouts" onClick={() => setDrawerOpen(false)} className="justify-start text-base">
                Workouts
              </NavLink>
              <NavLink href="/progress" onClick={() => setDrawerOpen(false)} className="justify-start text-base">
                Progress
              </NavLink>
              <div className="border-t border-border/70 my-4" />
              {isGuest ? (
                <Button
                  size="lg"
                  variant="default"
                  className="w-full"
                  onClick={() => { setAuthOpen(true); setDrawerOpen(false); }}
                >
                  Login
                </Button>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground truncate mb-2">{user?.email}</p>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={() => { logout(); setDrawerOpen(false); }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="hidden md:flex items-center gap-4">
        {isGuest ? (
          <>
            <span className="text-sm text-muted-foreground">Guest</span>
            <Button size="sm" variant="ghost" className="min-h-[44px]" onClick={() => setAuthOpen(true)}>
              Login
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground max-w-[180px] truncate">{user?.email}</span>
            <Button size="sm" variant="ghost" className="min-h-[44px]" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </nav>
  );
}

export default NavigationBar;
