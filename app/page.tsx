import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700 opacity-30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 right-0 w-96 h-96 bg-cyan-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="z-10 flex flex-col items-center gap-8 w-full px-4 md:px-0">
        <Image src="/placeholder-logo.svg" alt="FitFlow Logo" width={96} height={96} className="mb-2 animate-bounce drop-shadow-lg" />
        <h1 className="text-5xl md:text-6xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text drop-shadow-xl">Welcome to FitFlow</h1>
        <p className="text-gray-200 mb-4 text-center text-2xl font-medium max-w-2xl drop-shadow">Your smart fitness companion. Start your journey:</p>
        {/* Feature highlights */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
          <div className="flex items-center gap-3 text-cyan-300 text-lg"><span className="text-2xl">💪</span> Track & edit custom workouts</div>
          <div className="flex items-center gap-3 text-purple-300 text-lg"><span className="text-2xl">📈</span> Visualize your progress</div>
          <div className="flex items-center gap-3 text-green-300 text-lg"><span className="text-2xl">⚡</span> Fast, modern, and easy to use</div>
        </div>
        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md mx-auto mt-6">
          <button
            disabled
            className="flex-1 min-h-[56px] flex flex-col items-center justify-center rounded-xl text-lg font-semibold shadow-lg border border-gray-600 bg-gray-700/70 text-gray-300 cursor-not-allowed text-center transition-all"
          >
            <span className="font-semibold text-lg">Login / Sign Up</span>
            <span className="text-sm text-gray-400 mt-1">(coming soon)</span>
          </button>
          <Link
            href="/workouts"
            className="flex-1 min-h-[56px] flex items-center justify-center rounded-xl text-lg font-semibold shadow-lg border border-cyan-500/40 bg-gradient-to-r from-green-500 to-cyan-500 text-white text-center hover:from-green-600 hover:to-cyan-600 hover:scale-105 transition-all"
          >
            Use as Guest
          </Link>
        </div>
      </div>
    </main>
  )
} 