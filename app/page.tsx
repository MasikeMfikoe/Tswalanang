import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white">
      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Welcome to TSW SmartLog</h2>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Final_TswalanangLogistics-hxMkywQ9EbNzC0e28VrJzQXLgshfJq.png"
            alt="Tswalanang Logistics Logo"
            width={300}
            height={300}
            className="mx-auto mt-6 mb-8"
          />
          <p className="text-xl mb-8 text-center italic text-gray-300">
            Smart Logistics DMS <br />
            Simplifying Logistics, Maximizing Efficiency!
          </p>
          <div className="space-y-4"></div>
          <Link href="/login" className="mt-8 inline-block">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              Login
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
