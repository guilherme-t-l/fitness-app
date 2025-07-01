import Link from 'next/link'
import Image from 'next/image'

function NavigationBar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-950/90 border-b border-gray-800 shadow-sm backdrop-blur flex items-center justify-between px-6 h-16">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <Image src="/placeholder-logo.svg" alt="FitFlow Logo" width={32} height={32} />
          <span className="font-bold text-xl text-white tracking-tight">FitFlow</span>
        </Link>
      </div>
      {/* Center: Navigation Links */}
      <div className="flex items-center gap-6">
        <Link href="/workouts" className="text-white font-medium hover:text-green-400 transition">Workouts</Link>
        <span className="text-gray-500 font-medium cursor-not-allowed opacity-60 select-none">Progress</span>
        <span className="text-gray-500 font-medium cursor-not-allowed opacity-60 select-none">Community</span>
      </div>
      {/* Right: Login/Profile (disabled) */}
      <div className="flex items-center gap-4">
        <span className="text-gray-500 font-medium cursor-not-allowed opacity-60 select-none">Login/Profile</span>
      </div>
    </nav>
  )
}

export default NavigationBar; 