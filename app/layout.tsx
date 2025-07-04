import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import NavigationBar from "@/components/navigation-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitFlow - Smart Workout Tracker",
  description: "Modern fitness application for tracking workouts",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <NavigationBar />
          <main className="pt-16 min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
