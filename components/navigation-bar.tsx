import Link from 'next/link'
import Image from 'next/image'
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer"
import { Menu } from "lucide-react"

function NavigationBar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-950/90 border-b border-gray-800 shadow-sm backdrop-blur flex items-center justify-between px-4 h-14 md:px-6 md:h-16">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <Image src="/placeholder-logo.svg" alt="FitFlow Logo" width={28} height={28} className="md:w-8 md:h-8" />
          <span className="font-bold text-lg md:text-xl text-white tracking-tight">FitFlow</span>
        </Link>
      </div>
      {/* Center: Navigation Links (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/workouts" className="text-white font-medium hover:text-green-400 transition">Workouts</Link>
        <span className="text-gray-500 font-medium cursor-not-allowed opacity-60 select-none">Progress</span>
        <span className="text-gray-500 font-medium cursor-not-allowed opacity-60 select-none">Community</span>
      </div>
      {/* Right: Hamburger menu on mobile, Login/Profile on desktop */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <button className="p-2 rounded-md hover:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-green-500">
                <Menu className="h-6 w-6 text-white" />
                <span className="sr-only">Open navigation</span>
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="flex flex-col gap-4 p-6">
                <Link href="/workouts" className="text-white text-lg font-semibold py-2 px-2 rounded hover:bg-gray-800/60">Workouts</Link>
                <span className="text-gray-500 text-lg font-semibold py-2 px-2 rounded cursor-not-allowed opacity-60 select-none">Progress</span>
                <span className="text-gray-500 text-lg font-semibold py-2 px-2 rounded cursor-not-allowed opacity-60 select-none">Community</span>
                <span className="text-gray-500 text-lg font-semibold py-2 px-2 rounded cursor-not-allowed opacity-60 select-none">Login/Profile</span>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <span className="hidden md:inline text-gray-500 font-medium cursor-not-allowed opacity-60 select-none">Login/Profile</span>
      </div>
    </nav>
  )
}

export default NavigationBar; 