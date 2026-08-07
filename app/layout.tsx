import type React from "react"
import type { Metadata } from "next"
import { Figtree, Fraunces } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import NavigationBar from "@/components/navigation-bar"
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from "@/components/ui/toaster"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FitFlow — Training Journal",
  description: "Plan workouts, run sessions, and track your progress.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} ${fraunces.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
          <AuthProvider>
            <NavigationBar />
            <main className="pt-16 min-h-screen">{children}</main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
