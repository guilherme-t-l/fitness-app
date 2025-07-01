import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center gap-6 w-full max-w-md mt-8">
        <Image src="/placeholder-logo.svg" alt="FitFlow Logo" width={64} height={64} className="mb-2" />
        <h1 className="text-4xl font-bold mb-2">Welcome to FitFlow</h1>
        <p className="text-gray-400 mb-4 text-center">Your smart fitness companion. Choose how you want to get started:</p>
        <div className="flex flex-col gap-4 w-full">
          <button disabled className="w-full py-3 rounded bg-gray-800 text-gray-500 font-semibold cursor-not-allowed opacity-60">Login / Sign Up (coming soon)</button>
          <Link href="/workouts" className="w-full block py-3 rounded bg-green-500 text-white font-semibold text-center hover:bg-green-600 transition">Use as Guest</Link>
        </div>
      </div>
    </main>
  )
} 