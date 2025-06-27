"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/useWallet"
import { Dashboard } from "@/components/dashboard"

export default function DashboardPage() {
  const { isConnected, isLoading } = useWallet()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if not loading and not connected
    if (!isLoading && !isConnected) {
      const timer = setTimeout(() => {
        router.push("/")
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isConnected, isLoading, router])

  // Show loading while wallet state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a16] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) return null

  return <Dashboard />
}